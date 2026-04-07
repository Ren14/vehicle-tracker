package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Ren14/vehicle-tracker/backend/internal/app"
	"github.com/Ren14/vehicle-tracker/backend/internal/ports"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Server struct {
	router *chi.Mux
}

func NewServer(
	authService *app.AuthService,
	vehicleService *app.VehicleService,
	tokenService ports.TokenService,
) *Server {
	s := &Server{router: chi.NewRouter()}
	s.setupRoutes(authService, vehicleService, tokenService)
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *Server) setupRoutes(
	authService *app.AuthService,
	vehicleService *app.VehicleService,
	tokenService ports.TokenService,
) {
	r := s.router
	r.Use(corsMiddleware)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	authHandler := NewAuthHandler(authService)
	vehicleHandler := NewVehicleHandler(vehicleService)
	authMW := AuthMiddleware(tokenService)

	r.Route("/api/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})

		r.Group(func(r chi.Router) {
			r.Use(authMW)

			r.Get("/vehicles", vehicleHandler.ListVehicles)
			r.Post("/vehicles", vehicleHandler.CreateVehicle)

			r.Route("/vehicles/{vehicleID}", func(r chi.Router) {
				r.Get("/maintenance", vehicleHandler.ListMaintenanceRecords)
				r.Post("/maintenance", vehicleHandler.CreateMaintenanceRecord)
				r.Put("/maintenance/{recordID}", vehicleHandler.UpdateMaintenanceRecord)
				r.Delete("/maintenance/{recordID}", vehicleHandler.DeleteMaintenanceRecord)
			})
		})
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v) //nolint:errcheck
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, ErrorResponse{Error: msg})
}
