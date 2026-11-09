import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let database = null;

export function initializeDatabase(userDataPath) {
  if (database) {
    return database;
  }

  const databaseDirectory = path.join(userDataPath, 'database');

  fs.mkdirSync(databaseDirectory, { recursive: true });

  const databasePath = path.join(
    databaseDirectory,
    'caloriecalc.db'
  );

database = new DatabaseSync(databasePath);

database.exec('PRAGMA journal_mode = WAL;');

  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      calories REAL NOT NULL CHECK (calories >= 0),
      protein REAL NOT NULL CHECK (protein >= 0),
      fat REAL NOT NULL CHECK (fat >= 0),
      carbs REAL NOT NULL CHECK (carbs >= 0)
    );
  `);

  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error('Базу даних ще не ініціалізовано.');
  }

  return database;
}

export function closeDatabase() {
  if (database) {
    database.close();
    database = null;
  }
}
