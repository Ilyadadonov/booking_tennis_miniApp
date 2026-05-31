-- Courts
CREATE TABLE IF NOT EXISTS courts (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

-- Slots
CREATE TABLE IF NOT EXISTS slots (
  id          SERIAL PRIMARY KEY,
  court_id    INTEGER NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  time_start  TIME NOT NULL,
  time_end    TIME NOT NULL,
  status      TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied')),
  UNIQUE (court_id, date, time_start)
);

CREATE INDEX IF NOT EXISTS slots_date_idx ON slots(date);
CREATE INDEX IF NOT EXISTS slots_court_date_idx ON slots(court_id, date);

-- Users
CREATE TABLE IF NOT EXISTS users (
  tg_id       BIGINT PRIMARY KEY,
  username    TEXT,
  first_name  TEXT NOT NULL,
  last_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  slot_id     INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  user_tg_id  BIGINT NOT NULL,
  user_name   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slot_id)
);

CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings(user_tg_id);

-- Seed: 2 courts
INSERT INTO courts (name, description) VALUES
  ('Корт №1', 'Хард-покрытие, освещение'),
  ('Корт №2', 'Грунт, освещение')
ON CONFLICT DO NOTHING;

-- Function to generate slots for a date range
CREATE OR REPLACE FUNCTION generate_slots(start_date DATE, end_date DATE)
RETURNS VOID AS $$
DECLARE
  d DATE;
  c INTEGER;
  h INTEGER;
BEGIN
  d := start_date;
  WHILE d <= end_date LOOP
    FOR c IN (SELECT id FROM courts) LOOP
      FOR h IN 8..20 LOOP
        INSERT INTO slots (court_id, date, time_start, time_end, status)
        VALUES (
          c,
          d,
          make_time(h, 0, 0),
          make_time(h + 1, 0, 0),
          'free'
        )
        ON CONFLICT (court_id, date, time_start) DO NOTHING;
      END LOOP;
    END LOOP;
    d := d + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate slots for the next 30 days from today
SELECT generate_slots(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');
