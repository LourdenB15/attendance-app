-- Up Migration
ALTER TABLE check_in_attempts DROP COLUMN matched_name;
-- Down Migration
ALTER TABLE check_in_attempts ADD COLUMN matched_name VARCHAR(255);