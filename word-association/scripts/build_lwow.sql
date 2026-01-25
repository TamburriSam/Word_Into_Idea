-- LWOW SQLite build script (4-column CSV: letter,cue,assoc1,assoc2)
-- Run from project root:
--   rm -f data/lwow/lwow.sqlite
--   sqlite3 data/lwow/lwow.sqlite < scripts/build_lwow.sql

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS raw_import;
DROP TABLE IF EXISTS associations;

CREATE TABLE raw_import (
  letter TEXT,
  cue    TEXT,
  assoc1 TEXT,
  assoc2 TEXT
);

CREATE TABLE associations (
  cue    TEXT PRIMARY KEY,
  letter TEXT NOT NULL,
  assoc1 TEXT NOT NULL,
  assoc2 TEXT NOT NULL
);

CREATE INDEX idx_associations_letter ON associations(letter);

.mode csv
.import data/lwow/llama.csv raw_import

-- Normalize + dedupe (your CSV has repeats)
INSERT OR REPLACE INTO associations (cue, letter, assoc1, assoc2)
SELECT
  lower(trim(cue)),
  lower(trim(letter)),
  lower(trim(assoc1)),
  lower(trim(assoc2))
FROM raw_import
WHERE cue IS NOT NULL AND trim(cue) <> '';

-- Remove CSV header row(s) if present
DELETE FROM associations WHERE cue IN ('r1','cue');

DROP TABLE raw_import;

SELECT 'rows' AS label, count(*) AS value FROM associations;
SELECT 'sample' AS label, cue || ' -> ' || assoc1 || ', ' || assoc2 AS value
FROM associations
LIMIT 5;
