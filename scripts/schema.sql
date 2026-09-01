CREATE TABLE IF NOT EXISTS properties (
  id           SERIAL PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('buy', 'rent')),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  address      TEXT,
  description  TEXT,
  phone        TEXT,
  price        NUMERIC,
  rent         NUMERIC,
  deposit      NUMERIC,
  meter        NUMERIC,
  images       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_meter ON properties (meter);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties (slug);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_updated_at ON properties;
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
