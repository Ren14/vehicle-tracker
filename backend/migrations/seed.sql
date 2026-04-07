-- ==============================================================
-- Seed: Chevrolet Cruze 2017 — 11 maintenance records
-- ==============================================================
-- Prerequisites:
--   1. Run migrations 001–003 first.
--   2. Register your account via the API:
--        POST /api/v1/auth/register
--        {"email":"demo@example.com","password":"demo1234"}
--   3. Execute this file against your database.
-- ==============================================================

DO $$
DECLARE
    v_user_id    UUID;
    v_vehicle_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM   users
    WHERE  email = 'demo@example.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION
            'User demo@example.com not found. '
            'Register first via POST /api/v1/auth/register';
    END IF;

    -- ── Vehicle ─────────────────────────────────────────────────
    INSERT INTO vehicles (id, user_id, make, model, year, license_plate)
    VALUES (v_vehicle_id, v_user_id, 'Chevrolet', 'Cruze', 2017, 'AC123VT')
    ON CONFLICT (id) DO NOTHING;

    -- ── Maintenance records ──────────────────────────────────────
    INSERT INTO maintenance_records
        (vehicle_id, date, km, description, mechanic, cost, next_service_km)
    VALUES
        (v_vehicle_id, '2022-03-10', 70000,
         'Oil change Valvoline 5w30 Dexos 1 Gen 2 and Original Filters',
         'QuickLube', 0, NULL),

        (v_vehicle_id, '2023-03-15', 80000,
         'Oil change Liquy Moly 5w30 and Original Filters',
         'Mauri Moreno', 0, NULL),

        (v_vehicle_id, '2023-09-10', 86000,
         'Original Spark Plug Replacement',
         'Mauri Moreno', 0, NULL),

        (v_vehicle_id, '2023-12-11', 90000,
         'Full service 90000km - Oil change YPF Elaion 5w30, oil filter, air filter, '
         'cabin filter, accessory belt, belt tensioner, unit inspection',
         'Yacopinni', 237620, NULL),

        (v_vehicle_id, '2024-07-06', 99000,
         'Complete ceramic treatment',
         'Lucas Cantos', 0, NULL),

        -- next oil change at 125 000 km (interval 25 k)
        (v_vehicle_id, '2024-08-28', 100000,
         'Oil change Valvoline 5w30 Dexos 1 Gen 2 and Original Filters',
         'ProLube Costanera', 0, 125000),

        (v_vehicle_id, '2024-11-17', 102000,
         'Pirelli P7 tire replacement + Wheel alignment and balancing',
         'Neumaticos cordillera Chile', 0, NULL),

        -- next coolant flush at 164 000 km (interval 60 k)
        (v_vehicle_id, '2025-01-03', 104000,
         'Full fluid check, front axle, brakes, electrical. '
         'Complete coolant flush with Total Rosa',
         'San Sebastian', 0, 164000),

        -- next oil change at 154 639 km (interval 45 k)
        (v_vehicle_id, '2025-03-28', 109639,
         'Oil change Valvoline 5w30 Dexos 1 Gen 3 and Original Filters',
         'San Sebastian', 0, 154639),

        -- next alignment at 144 660 km (interval 35 k)
        (v_vehicle_id, '2025-04-01', 109660,
         'Wheel alignment and balancing',
         'Neumaticos Rodeo', 0, 144660),

        -- next wheel-nut check at 149 660 km (interval 40 k)
        (v_vehicle_id, '2025-04-01', 109660,
         'Anti-theft wheel nuts',
         'Neumaticos Rodeo', 0, 149660);

END $$;
