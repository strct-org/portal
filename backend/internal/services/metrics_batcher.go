package services

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// MetricData represents the flattened structure to save to DB
type MetricData struct {
	DeviceID  string
	Latency   *float64
	Loss      *float64
	Bandwidth *float64
	IsDown    *bool
	Timestamp time.Time
}

type MetricsBatcher struct {
	db        *pgxpool.Pool
	inputChan chan MetricData
	batchSize int
	batch     []MetricData
	mu        sync.Mutex // Protects batch (though strictly not needed if only one worker runs)
	done      chan bool
}

func NewMetricsBatcher(db *pgxpool.Pool) *MetricsBatcher {
	return &MetricsBatcher{
		db:        db,
		inputChan: make(chan MetricData, 1000), // Buffered channel
		batchSize: 50,                          // Flush after 50 records
		batch:     make([]MetricData, 0, 50),
		done:      make(chan bool),
	}
}

// Add queues a metric to be saved
func (mb *MetricsBatcher) Add(data MetricData) {
	select {
	case mb.inputChan <- data:
		// Queued successfully
	default:
		log.Println("WARNING: Metrics buffer full, dropping data packet")
	}
}

// Start runs the background worker
func (mb *MetricsBatcher) Start() {
	ticker := time.NewTicker(10 * time.Second) // Flush every 10s regardless of size
	defer ticker.Stop()

	for {
		select {
		case metric := <-mb.inputChan:
			mb.batch = append(mb.batch, metric)
			if len(mb.batch) >= mb.batchSize {
				mb.flush()
			}
		case <-ticker.C:
			if len(mb.batch) > 0 {
				mb.flush()
			}
		case <-mb.done:
			// Flush remaining data on shutdown
			if len(mb.batch) > 0 {
				mb.flush()
			}
			return
		}
	}
}

// Stop signals the worker to finish
func (mb *MetricsBatcher) Stop() {
	mb.done <- true
}

func (mb *MetricsBatcher) flush() {
	if len(mb.batch) == 0 {
		return
	}

	// Copy data to a temp slice to free up the main batch immediately
	dataToInsert := make([]MetricData, len(mb.batch))
	copy(dataToInsert, mb.batch)
	mb.batch = mb.batch[:0] // Reset buffer

	go func(data []MetricData) {
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		// Efficient Bulk Insert using pgx.CopyFrom
		rows := [][]interface{}{}
		for _, m := range data {
			rows = append(rows, []interface{}{
				m.DeviceID, m.Latency, m.Loss, m.Bandwidth, m.IsDown, m.Timestamp,
			})
		}

		_, err := mb.db.CopyFrom(
			ctx,
			pgx.Identifier{"network_metrics"}, // Your DB Table Name
			[]string{"device_id", "latency", "loss", "bandwidth", "is_down", "timestamp"},
			pgx.CopyFromRows(rows),
		)

		if err != nil {
			log.Printf("Error flushing metrics batch: %v", err)
		} else {
			log.Printf("Flushed %d metrics to DB", len(data))
		}
	}(dataToInsert)
}