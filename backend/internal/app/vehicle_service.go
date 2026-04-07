package app

import (
	"context"
	"fmt"
	"time"

	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/Ren14/vehicle-tracker/backend/internal/ports"
	"github.com/google/uuid"
)

type VehicleService struct {
	vehicleRepo ports.VehicleRepository
}

func NewVehicleService(vehicleRepo ports.VehicleRepository) *VehicleService {
	return &VehicleService{vehicleRepo: vehicleRepo}
}

func (s *VehicleService) CreateVehicle(
	ctx context.Context,
	userID uuid.UUID,
	vehicleMake, model string,
	year int,
	licensePlate string,
) (*domain.Vehicle, error) {
	vehicle := &domain.Vehicle{
		ID:           uuid.New(),
		UserID:       userID,
		Make:         vehicleMake,
		Model:        model,
		Year:         year,
		LicensePlate: licensePlate,
		CreatedAt:    time.Now().UTC(),
	}
	if err := s.vehicleRepo.Create(ctx, vehicle); err != nil {
		return nil, fmt.Errorf("creating vehicle: %w", err)
	}
	return vehicle, nil
}

func (s *VehicleService) GetVehiclesByUser(ctx context.Context, userID uuid.UUID) ([]domain.Vehicle, error) {
	vehicles, err := s.vehicleRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("fetching vehicles: %w", err)
	}
	return vehicles, nil
}

func (s *VehicleService) CreateMaintenanceRecord(
	ctx context.Context,
	vehicleID, userID uuid.UUID,
	date time.Time,
	km int,
	description, mechanic string,
	cost float64,
	category string,
) (*domain.MaintenanceRecord, error) {
	vehicle, err := s.vehicleRepo.FindByID(ctx, vehicleID)
	if err != nil {
		return nil, fmt.Errorf("finding vehicle: %w", err)
	}
	if vehicle.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	record := &domain.MaintenanceRecord{
		ID:          uuid.New(),
		VehicleID:   vehicleID,
		Date:        date,
		Km:          km,
		Description: description,
		Mechanic:    mechanic,
		Cost:        cost,
		Category:    category,
		CreatedAt:   time.Now().UTC(),
	}
	if err := s.vehicleRepo.CreateMaintenanceRecord(ctx, record); err != nil {
		return nil, fmt.Errorf("creating maintenance record: %w", err)
	}
	return record, nil
}

func (s *VehicleService) ListMaintenanceRecords(
	ctx context.Context,
	vehicleID, userID uuid.UUID,
) ([]domain.MaintenanceRecord, error) {
	vehicle, err := s.vehicleRepo.FindByID(ctx, vehicleID)
	if err != nil {
		return nil, fmt.Errorf("finding vehicle: %w", err)
	}
	if vehicle.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	records, err := s.vehicleRepo.ListMaintenanceRecords(ctx, vehicleID)
	if err != nil {
		return nil, fmt.Errorf("listing maintenance records: %w", err)
	}
	return records, nil
}

func (s *VehicleService) UpdateMaintenanceRecord(
	ctx context.Context,
	recordID, userID uuid.UUID,
	date time.Time,
	km int,
	description, mechanic string,
	cost float64,
	category string,
) (*domain.MaintenanceRecord, error) {
	record, err := s.vehicleRepo.FindMaintenanceRecordByID(ctx, recordID)
	if err != nil {
		return nil, fmt.Errorf("finding record: %w", err)
	}

	vehicle, err := s.vehicleRepo.FindByID(ctx, record.VehicleID)
	if err != nil {
		return nil, fmt.Errorf("finding vehicle: %w", err)
	}
	if vehicle.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	record.Date = date
	record.Km = km
	record.Description = description
	record.Mechanic = mechanic
	record.Cost = cost
	record.Category = category

	if err := s.vehicleRepo.UpdateMaintenanceRecord(ctx, record); err != nil {
		return nil, fmt.Errorf("updating record: %w", err)
	}
	return record, nil
}

func (s *VehicleService) DeleteMaintenanceRecord(
	ctx context.Context,
	recordID, userID uuid.UUID,
) error {
	record, err := s.vehicleRepo.FindMaintenanceRecordByID(ctx, recordID)
	if err != nil {
		return fmt.Errorf("finding record: %w", err)
	}

	vehicle, err := s.vehicleRepo.FindByID(ctx, record.VehicleID)
	if err != nil {
		return fmt.Errorf("finding vehicle: %w", err)
	}
	if vehicle.UserID != userID {
		return domain.ErrUnauthorized
	}

	if err := s.vehicleRepo.DeleteMaintenanceRecord(ctx, recordID); err != nil {
		return fmt.Errorf("deleting record: %w", err)
	}
	return nil
}
