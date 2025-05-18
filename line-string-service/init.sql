CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS line_strings (
  id SERIAL PRIMARY KEY,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  geom geometry(LineString, 4326) NOT NULL
);
