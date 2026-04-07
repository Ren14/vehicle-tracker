package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/Ren14/vehicle-tracker/backend/internal/adapters/jwt"
	httphandler "github.com/Ren14/vehicle-tracker/backend/internal/adapters/http"
	"github.com/Ren14/vehicle-tracker/backend/internal/adapters/postgres"
	"github.com/Ren14/vehicle-tracker/backend/internal/app"
)

func main() {
	// Load .env if present (no-op in production when vars are set directly)
	_ = godotenv.Load()

	dbURL := mustEnv("DATABASE_URL")
	jwtSecret := mustEnv("JWT_SECRET")
	port := envOr("PORT", "8081")

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("failed to create connection pool: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}
	log.Println("database connection established")

	// ── Adapters (infrastructure layer) ───────────────────────────────────────
	userRepo := postgres.NewUserRepository(pool)
	vehicleRepo := postgres.NewVehicleRepository(pool)
	tokenService := jwt.NewTokenService(jwtSecret)

	// ── Application services (use-case layer) ─────────────────────────────────
	authService := app.NewAuthService(userRepo, tokenService)
	vehicleService := app.NewVehicleService(vehicleRepo)

	// ── HTTP server (delivery layer) ──────────────────────────────────────────
	server := httphandler.NewServer(authService, vehicleService, tokenService)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("server listening on %s", addr)
	if err := http.ListenAndServe(addr, server); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required environment variable %q is not set", key)
	}
	return v
}

func envOr(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
