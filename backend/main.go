package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	clerk "github.com/clerk/clerk-sdk-go/v2"
	gorilllaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/strct-org/portal/backend/internal/handlers"
	"github.com/strct-org/portal/backend/internal/services"
	"github.com/strct-org/portal/backend/middleware"

	_ "net/http/pprof"
)

var (
	dbPool      *pgxpool.Pool
	userService *services.UserService
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, using system env")
	}

	clerkSecretKey := os.Getenv("CLERK_SECRET_KEY")
	if clerkSecretKey == "" {
		log.Fatal("CLERK_SECRET_KEY environment variable is not set")
	}
	clerk.SetKey(clerkSecretKey)
	log.Println("Clerk initialized")

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	poolConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatal("Failed to parse database URL:", err)
	}

	poolConfig.MaxConnIdleTime = 30 * time.Second
	poolConfig.MinConns = 0
	poolConfig.MaxConns = 15
	poolConfig.MaxConnLifetime = 5 * time.Minute
	poolConfig.HealthCheckPeriod = 24 * time.Hour

	dbPool, err = pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatal("Failed to create connection pool:", err)
	}
	log.Println("Database pool configured (Lazy connection)")

	defer func() {
		log.Println("Closing database connection pool...")
		dbPool.Close()
	}()

	userService = services.NewUserService(dbPool)

	userHandler := handlers.NewUserHandler(userService)
	webhookHandler := handlers.NewClerkHandler(userService)

	go func() {
		for i := 0; i < 3; i++ {
			time.Sleep(500 * time.Millisecond)
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			log.Printf("Background: Pinging NeonDB to wake it up (Attempt %d/3)...", i+1)

			if err := dbPool.Ping(ctx); err == nil {
				log.Println("Success: NeonDB is awake and ready")
				cancel()
				return
			} else {
				log.Printf("Ping failed: %v", err)
			}
			cancel()
		}
		log.Println("Warning: NeonDB warm-up failed after retries. First request might be slow.")
	}()

	r := mux.NewRouter()

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "service": "outDrinkMe-api"}`))
	}).Methods("GET")

	standardRouter := r.PathPrefix("/").Subrouter()
	// standardRouter.Use(middleware.RateLimitMiddleware)
	// standardRouter.Use(middleware.MonitorMiddleware)

	// standardRouter.Handle("/metrics", middleware.BasicAuthMiddleware(promhttp.Handler()))
	// standardRouter.PathPrefix("/debug/pprof/").Handler(middleware.PprofSecurityMiddleware(http.DefaultServeMux))

	assetsDir := "./assets"
	fs := http.FileServer(http.Dir(assetsDir))
	standardRouter.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", fs))

	updatesDir := "./updates"
	updatesFS := http.FileServer(http.Dir(updatesDir))

	standardRouter.PathPrefix("/agent_updates/").Handler(http.StripPrefix("/agent_updates/", updatesFS)).Methods("GET")

	standardRouter.HandleFunc("/webhook/clerk", webhookHandler.HandleClerkWebhook).Methods("POST")

	api := standardRouter.PathPrefix("/api/v1").Subrouter()

	// api.HandleFunc("/privacy-policy", docHandler.ServePrivacyPolicy).Methods("GET")
	// api.HandleFunc("/terms-of-services", docHandler.ServeTermsOfServices).Methods("GET")
	// api.HandleFunc("/refund-policy", docHandler.ServeRefundPolicy).Methods("GET")
	// api.HandleFunc("/pricing", docHandler.ServePricing).Methods("GET")

	// api.HandleFunc("/delete-account-webpage", userHandler.DeleteAccountPage).Methods("GET")
	// api.HandleFunc("/delete-account-details-webpage", userHandler.UpdateAccountPage).Methods("GET")

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.ClerkAuthMiddleware)

	protected.HandleFunc("/user", userHandler.GetProfile).Methods("GET")
	// protected.HandleFunc("/user", userHandler.UpdateProfile).Methods("PUT")
	// protected.HandleFunc("/user", userHandler.DeleteAccount).Methods("DELETE")

	corsHandler := gorilllaHandlers.CORS(
		gorilllaHandlers.AllowedOrigins([]string{"*"}),
		gorilllaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorilllaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Pprof-Secret"}),
		gorilllaHandlers.ExposedHeaders([]string{"Content-Length"}),
		gorilllaHandlers.AllowCredentials(),
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3333"
	}
	port = ":" + port

	server := http.Server{
		Addr:         port,
		Handler:      corsHandler(r),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("Starting server on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Error starting server:", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)

	sig := <-sigChan
	log.Println("Got signal:", sig)

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}

	log.Println("Server shutdown complete")
}
