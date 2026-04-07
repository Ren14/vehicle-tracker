package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type VehicleRepository struct {
	pool *pgxpool.Pool
}

func NewVehicleRepository(pool *pgxpool.Pool) *VehicleRepository {
	return &VehicleRepository{pool: pool}
}

func (r *VehicleRepository) Create(ctx context.Context, vehicle *domain.Vehicle) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO vehicles (id, user_id, make, model, year, license_plate, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		vehicle.ID, vehicle.UserID, vehicle.Make, vehicle.Model,
		vehicle.Year, vehicle.LicensePlate, vehicle.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("inserting vehicle: %w", err)
	}
	return nil
}

func (r *VehicleRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Vehicle, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, make, model, year, license_plate, created_at
		 FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("querying vehicles: %w", err)
	}
	defer rows.Close()

	var vehicles []domain.Vehicle
	for rows.Next() {
		var v domain.Vehicle
		if err := rows.Scan(&v.ID, &v.UserID, &v.Make, &v.Model, &v.Year, &v.LicensePlate, &v.CreatedAt); err != nil {
			return nil, fmt.Errorf("scanning vehicle: %w", err)
		}
		vehicles = append(vehicles, v)
	}
	return vehicles, rows.Err()
}

func (r *VehicleRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Vehicle, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT id, user_id, make, model, year, license_plate, created_at
		 FROM vehicles WHERE id = $1`,
		id,
	)
	var v domain.Vehicle
	if err := row.Scan(&v.ID, &v.UserID, &v.Make, &v.Model, &v.Year, &v.LicensePlate, &v.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("scanning vehicle: %w", err)
	}
	return &v, nil
}

func (r *VehicleRepository) CreateMaintenanceRecord(ctx context.Context, record *domain.MaintenanceRecord) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO maintenance_records
		    (id, vehicle_id, date, km, description, mechanic, cost, category, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		record.ID, record.VehicleID, record.Date, record.Km,
		record.Description, record.Mechanic, record.Cost, record.Category, record.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("inserting maintenance record: %w", err)
	}
	return nil
}

func (r *VehicleRepository) ListMaintenanceRecords(ctx context.Context, vehicleID uuid.UUID) ([]domain.MaintenanceRecord, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, vehicle_id, date, km, description, mechanic, cost, category, created_at
		 FROM maintenance_records
		 WHERE vehicle_id = $1
		 ORDER BY date DESC, km DESC`,
		vehicleID,
	)
	if err != nil {
		return nil, fmt.Errorf("querying maintenance records: %w", err)
	}
	defer rows.Close()

	var records []domain.MaintenanceRecord
	for rows.Next() {
		var rec domain.MaintenanceRecord
		if err := rows.Scan(
			&rec.ID, &rec.VehicleID, &rec.Date, &rec.Km,
			&rec.Description, &rec.Mechanic, &rec.Cost, &rec.Category, &rec.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scanning maintenance record: %w", err)
		}
		records = append(records, rec)
	}
	return records, rows.Err()
}

func (r *VehicleRepository) FindMaintenanceRecordByID(ctx context.Context, id uuid.UUID) (*domain.MaintenanceRecord, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT id, vehicle_id, date, km, description, mechanic, cost, category, created_at
		 FROM maintenance_records WHERE id = $1`,
		id,
	)
	var rec domain.MaintenanceRecord
	if err := row.Scan(
		&rec.ID, &rec.VehicleID, &rec.Date, &rec.Km,
		&rec.Description, &rec.Mechanic, &rec.Cost, &rec.Category, &rec.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("scanning maintenance record: %w", err)
	}
	return &rec, nil
}

func (r *VehicleRepository) UpdateMaintenanceRecord(ctx context.Context, record *domain.MaintenanceRecord) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE maintenance_records
		 SET date = $1, km = $2, description = $3, mechanic = $4,
		     cost = $5, category = $6
		 WHERE id = $7`,
		record.Date, record.Km, record.Description, record.Mechanic,
		record.Cost, record.Category, record.ID,
	)
	if err != nil {
		return fmt.Errorf("updating maintenance record: %w", err)
	}
	return nil
}

func (r *VehicleRepository) DeleteMaintenanceRecord(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM maintenance_records WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("deleting maintenance record: %w", err)
	}
	return nil
}
