-- Up Migration
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Down Migration
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users DROP COLUMN google_id;
