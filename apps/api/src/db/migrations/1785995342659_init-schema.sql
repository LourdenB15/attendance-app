-- Up Migration
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('STUDENT', 'PROFESSOR', 'ADMIN');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'DROPPED');
CREATE TYPE enrollment_source AS ENUM ('SELF_ENROLLED', 'PROFESSOR_ADDED');
CREATE TYPE session_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE biometric_enrollment_status AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT');
CREATE TYPE attendance_source AS ENUM ('LIVENESS', 'MANUAL_OVERRIDE');
CREATE TYPE check_in_outcome AS ENUM ('SUCCESS', 'FAILURE', 'ERROR');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    semester VARCHAR(12) NOT NULL,
    join_code VARCHAR(12) NOT NULL UNIQUE,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX classes_professor_id_idx ON classes(professor_id);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status enrollment_status NOT NULL DEFAULT 'ACTIVE',
    enrolled_via enrollment_source NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (class_id, student_id)
);

CREATE INDEX enrollments_student_id_idx ON enrollments(student_id);

CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    opened_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    label VARCHAR(255),
    status session_status NOT NULL DEFAULT 'OPEN',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX attendance_sessions_one_open_per_class_idx
    ON attendance_sessions(class_id) WHERE status = 'OPEN';
CREATE INDEX attendance_sessions_class_id_idx ON attendance_sessions(class_id);

CREATE TABLE biometric_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    liveness_external_id UUID NOT NULL UNIQUE,
    status biometric_enrollment_status NOT NULL DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX biometric_enrollments_one_active_per_student_idx
    ON biometric_enrollments(student_id) WHERE revoked_at IS NULL;
CREATE INDEX biometric_enrollments_student_id_idx ON biometric_enrollments(student_id);

CREATE TABLE check_in_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    outcome check_in_outcome NOT NULL,
    similarity NUMERIC(5,4),
    confidence_level VARCHAR(10),
    matched_name VARCHAR(255),
    identity_match BOOLEAN NOT NULL DEFAULT false,
    saas_raw_response JSONB
);

CREATE INDEX check_in_attempts_session_student_idx ON check_in_attempts(session_id, student_id);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status attendance_status NOT NULL DEFAULT 'ABSENT',
    source attendance_source NOT NULL,
    check_in_attempt_id UUID REFERENCES check_in_attempts(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    override_reason VARCHAR(255),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, student_id),
    UNIQUE (check_in_attempt_id)
);

CREATE INDEX attendance_records_student_id_idx ON attendance_records(student_id);

-- Down Migration
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS check_in_attempts;
DROP TABLE IF EXISTS biometric_enrollments;
DROP TABLE IF EXISTS attendance_sessions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS check_in_outcome;
DROP TYPE IF EXISTS attendance_source;
DROP TYPE IF EXISTS attendance_status;
DROP TYPE IF EXISTS biometric_enrollment_status;
DROP TYPE IF EXISTS session_status;
DROP TYPE IF EXISTS enrollment_source;
DROP TYPE IF EXISTS enrollment_status;
DROP TYPE IF EXISTS user_role;