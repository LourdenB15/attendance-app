-- Up Migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Down Migration
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
