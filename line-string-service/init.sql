-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS streets (
  id SERIAL PRIMARY KEY,
  street_id INTEGER UNIQUE NOT NULL,
  street_name TEXT NOT NULL,
  street_hebrew_name TEXT,
  street_english_name TEXT,
  city_name TEXT,
  region_name TEXT
);

CREATE TABLE IF NOT EXISTS street_geometry (
  street_id INTEGER PRIMARY KEY REFERENCES streets(street_id),
  geom geometry(LineString, 4326) NOT NULL
);

-- 3. Indexes for text fields
CREATE INDEX IF NOT EXISTS idx_city_name ON streets(city_name);
CREATE INDEX IF NOT EXISTS idx_region_name ON streets(region_name);
-- Optional: for case-insensitive search
CREATE INDEX IF NOT EXISTS idx_lower_city_name ON streets(LOWER(city_name));
-- Optional: for trigram fuzzy/pattern match
CREATE INDEX IF NOT EXISTS idx_trgm_city_name ON streets USING GIST (city_name gist_trgm_ops);

-- 4. Spatial index on geometry
CREATE INDEX IF NOT EXISTS idx_geom ON street_geometry USING GIST (geom);
