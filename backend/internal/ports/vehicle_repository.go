package ports

import (
	"context"

	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/google/uuid"
)

type VehicleRepository interface {
	Create(ctx context.Context, vehicle *domain.Vehicle) error
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Vehicle, error)
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Vehicle, error)
	CreateMaintenanceRecord(ctx context.Context, record *domain.MaintenanceRecord) error
	ListMaintenanceRecords(ctx context.Context, vehicleID uuid.UUID) ([]domain.MaintenanceRecord, error)
	FindMaintenanceRecordByID(ctx context.Context, id uuid.UUID) (*domain.MaintenanceRecord, error)
	UpdateMaintenanceRecord(ctx context.Context, record *domain.MaintenanceRecord) error
	DeleteMaintenanceRecord(ctx context.Context, id uuid.UUID) error
}
