CREATE TABLE IF NOT EXISTS vehicles (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    make          TEXT        NOT NULL,
    model         TEXT        NOT NULL,
    year          INT         NOT NULL,
    license_plate TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
