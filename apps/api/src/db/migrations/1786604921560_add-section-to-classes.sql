-- Up Migration
ALTER TABLE classes ADD COLUMN section VARCHAR(10) NOT NULL;
ALTER TABLE classes
  ADD CONSTRAINT classes_professor_name_semester_section_key
  UNIQUE (professor_id, name, semester, section);

-- Down Migration
ALTER TABLE classes DROP CONSTRAINT classes_professor_name_semester_section_key;
ALTER TABLE classes DROP COLUMN section;
