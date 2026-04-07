ALTER TABLE maintenance_records
    DROP COLUMN IF EXISTS category;

ALTER TABLE maintenance_records
    ADD COLUMN next_service_km   INT,
    ADD COLUMN next_service_date DATE;
