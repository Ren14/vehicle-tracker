package handler

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/Ren14/vehicle-tracker/backend/internal/ports"
	"github.com/google/uuid"
)

func corsMiddleware(next http.Handler) http.Handler {
	// ALLOWED_ORIGINS can be a comma-separated list, e.g.:
	// "https://vehicle-tracker.vercel.app,http://localhost:5174"
	// Falls back to "*" when unset (safe for local dev).
	allowed := os.Getenv("ALLOWED_ORIGINS")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if allowed == "" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" && strings.Contains(allowed, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type contextKey string

const userIDKey contextKey = "userID"

func AuthMiddleware(tokenService ports.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeError(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				writeError(w, http.StatusUnauthorized, "authorization header must be: Bearer <token>")
				return
			}

			userID, err := tokenService.ValidateToken(parts[1])
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func userIDFromContext(r *http.Request) (uuid.UUID, bool) {
	id, ok := r.Context().Value(userIDKey).(uuid.UUID)
	return id, ok
}
