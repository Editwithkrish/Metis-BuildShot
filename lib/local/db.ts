import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | undefined;

export function db() {
  if (!database) {
    const directory = join(process.cwd(), ".metis");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const connection = new DatabaseSync(join(directory, "metis.sqlite"));
    connection.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS profiles (
        account_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        settings TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL REFERENCES profiles(account_id) ON DELETE CASCADE,
        full_name TEXT NOT NULL,
        dob TEXT,
        gender TEXT NOT NULL,
        initial_weight TEXT NOT NULL,
        initial_height TEXT NOT NULL,
        relationship_type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS growth_logs (
        id INTEGER PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        weight REAL NOT NULL,
        height REAL,
        logged_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id INTEGER PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        meal_type TEXT NOT NULL,
        food_name TEXT NOT NULL,
        quantity TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL,
        logged_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS patients_owner ON patients(owner_id);
      CREATE INDEX IF NOT EXISTS growth_patient_date ON growth_logs(patient_id, logged_at);
      CREATE INDEX IF NOT EXISTS nutrition_patient_date ON nutrition_logs(patient_id, logged_at);
    `);
    database = connection;
  }
  return database;
}

export function transaction<T>(write: (connection: DatabaseSync) => T): T {
  const connection = db();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const result = write(connection);
    connection.exec("COMMIT");
    return result;
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}
