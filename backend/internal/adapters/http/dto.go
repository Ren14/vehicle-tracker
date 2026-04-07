package handler

import (
	"time"

	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/google/uuid"
)

// ── Request DTOs ───────────────────────────────────────────────────────────────

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CreateVehicleRequest struct {
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         int    `json:"year"`
	LicensePlate string `json:"license_plate"`
}

type CreateMaintenanceRecordRequest struct {
	Date        string  `json:"date"` // YYYY-MM-DD
	Km          int     `json:"km"`
	Description string  `json:"description"`
	Mechanic    string  `json:"mechanic"`
	Cost        float64 `json:"cost"`
	Category    string  `json:"category"`
}

// ── Response DTOs ──────────────────────────────────────────────────────────────

type ErrorResponse struct {
	Error string `json:"error"`
}

type UserDTO struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type AuthResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type VehicleDTO struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Make         string    `json:"make"`
	Model        string    `json:"model"`
	Year         int       `json:"year"`
	LicensePlate string    `json:"license_plate"`
	CreatedAt    time.Time `json:"created_at"`
}

type MaintenanceRecordDTO struct {
	ID          uuid.UUID `json:"id"`
	VehicleID   uuid.UUID `json:"vehicle_id"`
	Date        time.Time `json:"date"`
	Km          int       `json:"km"`
	Description string    `json:"description"`
	Mechanic    string    `json:"mechanic"`
	Cost        float64   `json:"cost"`
	Category    string    `json:"category"`
	CreatedAt   time.Time `json:"created_at"`
}

// ── Mappers ────────────────────────────────────────────────────────────────────

func userToDTO(u *domain.User) UserDTO {
	return UserDTO{ID: u.ID, Email: u.Email, CreatedAt: u.CreatedAt}
}

func vehicleToDTO(v domain.Vehicle) VehicleDTO {
	return VehicleDTO{
		ID:           v.ID,
		UserID:       v.UserID,
		Make:         v.Make,
		Model:        v.Model,
		Year:         v.Year,
		LicensePlate: v.LicensePlate,
		CreatedAt:    v.CreatedAt,
	}
}

func maintenanceRecordToDTO(r domain.MaintenanceRecord) MaintenanceRecordDTO {
	return MaintenanceRecordDTO{
		ID:          r.ID,
		VehicleID:   r.VehicleID,
		Date:        r.Date,
		Km:          r.Km,
		Description: r.Description,
		Mechanic:    r.Mechanic,
		Cost:        r.Cost,
		Category:    r.Category,
		CreatedAt:   r.CreatedAt,
	}
}
