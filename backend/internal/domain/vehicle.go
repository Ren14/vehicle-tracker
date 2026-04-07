package domain

import (
	"time"

	"github.com/google/uuid"
)

type Vehicle struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	Make         string
	Model        string
	Year         int
	LicensePlate string
	CreatedAt    time.Time
}

// Category values for MaintenanceRecord.
const (
	CategoryService            = "service"
	CategoryAlignmentBalancing = "alineacion_balanceo"
	CategoryOther              = "otros"
)

type MaintenanceRecord struct {
	ID          uuid.UUID
	VehicleID   uuid.UUID
	Date        time.Time
	Km          int
	Description string
	Mechanic    string
	Cost        float64
	Category    string
	CreatedAt   time.Time
}
