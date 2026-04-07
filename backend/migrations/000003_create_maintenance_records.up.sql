CREATE TABLE IF NOT EXISTS maintenance_records (
    id                UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id        UUID           NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    date              DATE           NOT NULL,
    km                INT            NOT NULL,
    description       TEXT           NOT NULL,
    mechanic          TEXT           NOT NULL,
    cost              NUMERIC(12, 2) NOT NULL DEFAULT 0,
    next_service_km   INT,
    next_service_date DATE,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
