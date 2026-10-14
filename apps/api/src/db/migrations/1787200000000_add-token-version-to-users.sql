-- Up Migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;

-- Down Migration
ALTER TABLE users DROP COLUMN IF EXISTS token_version;
