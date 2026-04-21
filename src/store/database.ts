// SQLite helper — all fast history + weight log read/write operations go through this module
import * as SQLite from 'expo-sqlite';
import { FastRecord, WeightEntry } from '../types';

let _db: SQLite.SQLiteDatabase | null = null;

// Opens the DB once and creates the fasts table if it doesn't exist
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('waterfastbuddy.db');
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS fasts (
        id          TEXT PRIMARY KEY NOT NULL,
        startTime   TEXT NOT NULL,
        endTime     TEXT NOT NULL,
        targetHours REAL NOT NULL,
        actualHours REAL NOT NULL,
        completed   INTEGER NOT NULL DEFAULT 0,
        notes       TEXT,
        name        TEXT
      );
      CREATE TABLE IF NOT EXISTS weight_entries (
        id       TEXT PRIMARY KEY NOT NULL,
        date     TEXT NOT NULL,
        weightKg REAL NOT NULL
      );
    `);
  }
  return _db;
}

export async function insertFast(fast: FastRecord): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO fasts
       (id, startTime, endTime, targetHours, actualHours, completed, notes, name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fast.id,
      fast.startTime,
      fast.endTime,
      fast.targetHours,
      fast.actualHours,
      fast.completed ? 1 : 0,
      fast.notes ?? null,
      fast.name ?? null,
    ],
  );
}

export async function getAllFasts(): Promise<FastRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM fasts ORDER BY startTime DESC',
  );
  return rows.map((r) => ({
    id: r.id as string,
    startTime: r.startTime as string,
    endTime: r.endTime as string,
    targetHours: r.targetHours as number,
    actualHours: r.actualHours as number,
    completed: !!r.completed,
    notes: (r.notes as string) ?? undefined,
    name: (r.name as string) ?? undefined,
  }));
}

export async function deleteFastById(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM fasts WHERE id = ?', [id]);
}

// ── Weight entries ─────────────────────────────────────────────────────────────

export async function insertWeightEntry(entry: WeightEntry): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO weight_entries (id, date, weightKg) VALUES (?, ?, ?)`,
    [entry.id, entry.date, entry.weightKg],
  );
}

export async function getAllWeightEntries(): Promise<WeightEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM weight_entries ORDER BY date ASC',
  );
  return rows.map((r) => ({
    id: r.id as string,
    date: r.date as string,
    weightKg: r.weightKg as number,
  }));
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM weight_entries WHERE id = ?', [id]);
}
