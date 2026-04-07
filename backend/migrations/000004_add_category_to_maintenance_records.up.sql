ALTER TABLE maintenance_records
    ADD COLUMN category TEXT NOT NULL DEFAULT 'otros';

ALTER TABLE maintenance_records
    DROP COLUMN IF EXISTS next_service_km,
    DROP COLUMN IF EXISTS next_service_date;
