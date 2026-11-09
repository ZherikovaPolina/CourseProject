
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { seedProducts } from './seed.js';

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

  const db = new DatabaseSync(databasePath);

  try {
    db.exec('PRAGMA journal_mode = WAL;');

    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        calories REAL NOT NULL CHECK (calories >= 0),
        protein REAL NOT NULL CHECK (protein >= 0),
        fat REAL NOT NULL CHECK (fat >= 0),
        carbs REAL NOT NULL CHECK (carbs >= 0)
      );
    `);

    seedProducts(db);

    database = db;

    return database;
  } catch (error) {
    db.close();
    throw error;
  }
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
