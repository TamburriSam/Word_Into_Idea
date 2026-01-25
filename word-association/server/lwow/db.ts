import "server-only";

import path from "path";
import Database from "better-sqlite3";

let _db: Database.Database | null = null;

export type AssocRow = {
  cue: string;
  letter: string;
  assoc1: string;
  assoc2: string;
};

export function getLwowDb() {
  if (_db) return _db;

  const dbPath =
    process.env.LWOW_DB_PATH ??
    path.join(process.cwd(), "data", "lwow", "lwow.sqlite");

  _db = new Database(dbPath, {
    readonly: true,
    fileMustExist: true,
  });

  return _db;
}

export function getAssocByCue(cue: string): AssocRow | null {
  const db = getLwowDb();
  const stmt = db.prepare(
    `SELECT cue, letter, assoc1, assoc2
     FROM associations
     WHERE cue = ?
     LIMIT 1`,
  );
  return (stmt.get(cue) as AssocRow | undefined) ?? null;
}

export function getRandomAssocByLetter(letter: string): AssocRow | null {
  const db = getLwowDb();
  const stmt = db.prepare(
    `SELECT cue, letter, assoc1, assoc2
     FROM associations
     WHERE letter = ?
     ORDER BY random()
     LIMIT 1`,
  );
  return (stmt.get(letter) as AssocRow | undefined) ?? null;
}

export function countRows(): number {
  const db = getLwowDb();
  const row = db.prepare(`SELECT count(*) AS n FROM associations`).get() as {
    n: number;
  };
  return row.n ?? 0;
}
