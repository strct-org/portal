package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/strct-org/portal/backend/internal/types/device"
	"github.com/strct-org/portal/backend/utils"
)

type DeviceService struct {
	db *pgxpool.Pool
}

func NewDeviceService(db *pgxpool.Pool) *DeviceService {
	return &DeviceService{
		db: db,
	}
}

func (s *DeviceService) GetDevices(ctx context.Context, clerkID string) ([]device.Device, error) {
	user, err := utils.GetUserByClerkID(ctx, s.db, clerkID)
	if err != nil {
		return nil, fmt.Errorf("failed to identify user: %w", err)
	}

	query := `
		SELECT id, owner_id, friendly_name, is_online, last_seen, local_ip, version, created_at, updated_at
		FROM devices
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`

	rows, err := s.db.Query(ctx, query, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query devices: %w", err)
	}
	defer rows.Close()

	var devices []device.Device
	for rows.Next() {
		var d device.Device
		err := rows.Scan(
			&d.ID,
			&d.OwnerID,
			&d.FriendlyName,
			&d.IsOnline,
			&d.LastSeen,
			&d.LocalIP,
			&d.Version,
			&d.CreatedAt,
			&d.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan device row: %w", err)
		}
		devices = append(devices, d)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating device rows: %w", err)
	}

	return devices, nil
}

func (s *DeviceService) ClaimDevice(ctx context.Context, clerkID string, serialNumber string, claimToken string, friendlyName string) (*device.Device, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	user, err := utils.GetUserByClerkID(ctx, tx, clerkID)
	if err != nil {
		return nil, fmt.Errorf("failed to identify user: %w", err)
	}

	var dbClaimToken string
	var isClaimed bool

	mfgQuery := `
		SELECT claim_token, is_claimed 
		FROM manufactured_devices 
		WHERE id = $1
		FOR UPDATE 
	`

	err = tx.QueryRow(ctx, mfgQuery, serialNumber).Scan(&dbClaimToken, &isClaimed)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("device serial number not found")
		}
		return nil, fmt.Errorf("database error checking inventory: %w", err)
	}

	if isClaimed {
		return nil, fmt.Errorf("this device has already been claimed")
	}

	if dbClaimToken != claimToken {
		return nil, fmt.Errorf("invalid claim token provided")
	}

	_, err = tx.Exec(ctx, "UPDATE manufactured_devices SET is_claimed = TRUE WHERE id = $1", serialNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to update inventory status: %w", err)
	}

	if friendlyName == "" {
		friendlyName = "My Device"
	}

	insertQuery := `
		INSERT INTO devices (id, owner_id, friendly_name, is_online, created_at, updated_at)
		VALUES ($1, $2, $3, FALSE, NOW(), NOW())
		RETURNING id, owner_id, friendly_name, is_online, last_seen, local_ip, version, created_at, updated_at
	`

	newDevice := &device.Device{}
	err = tx.QueryRow(ctx, insertQuery, serialNumber, user.ID, friendlyName).Scan(
		&newDevice.ID,
		&newDevice.OwnerID,
		&newDevice.FriendlyName,
		&newDevice.IsOnline,
		&newDevice.LastSeen,
		&newDevice.LocalIP,
		&newDevice.Version,
		&newDevice.CreatedAt,
		&newDevice.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to insert new device record: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return newDevice, nil
}

func (s *DeviceService) GetParams(ctx context.Context, clerkID string, deviceID string) (*device.Params, error) {
	user, err := utils.GetUserByClerkID(ctx, s.db, clerkID)
	if err != nil {
		return nil, fmt.Errorf("failed to identify user: %w", err)
	}

	query := `
		SELECT is_online, last_seen, local_ip, version, updated_at
		FROM devices
		WHERE id = $1 AND owner_id = $2
	`

	var p device.Params
	err = s.db.QueryRow(ctx, query, deviceID, user.ID).Scan(
		&p.IsOnline,
		&p.LastSeen,
		&p.LocalIP,
		&p.Version,
		&p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("device not found or access denied")
		}
		return nil, fmt.Errorf("failed to scan device params: %w", err)
	}

	return &p, nil
}


func (s *DeviceService) UpdateParams(ctx context.Context, req device.ParamsUpdate) (*device.Params, error) {
	query := `
		UPDATE devices 
		SET 
			is_online = $1,
			local_ip = $2, 
			version = $3, 
			last_seen = NOW(), 
			updated_at = NOW()
		WHERE id = $4
		RETURNING is_online, last_seen, local_ip, version, updated_at
	`

	var p device.Params

	err := s.db.QueryRow(ctx, query, req.IsOnline, req.LocalIP, req.Version, req.ID).Scan(
		&p.IsOnline,
		&p.LastSeen,
		&p.LocalIP,
		&p.Version,
		&p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("device not found")
		}
		return nil, fmt.Errorf("failed to update device params: %w", err)
	}

	return &p, nil
}