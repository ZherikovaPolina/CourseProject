import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { seedProducts } from './seed.js';
import { products as defaultProducts } from '../data/products.js';

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
        carbs REAL NOT NULL CHECK (carbs >= 0),
        is_custom INTEGER NOT NULL DEFAULT 1
          CHECK (is_custom IN (0, 1))
      );
    `);

    const columns = db.prepare(
      'PRAGMA table_info(products)'
    ).all();

    if (!columns.some(column => column.name === 'is_custom')) {
      db.exec(`
        ALTER TABLE products
        ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 1
      `);
    }

    const markDefault = db.prepare(`
      UPDATE products
      SET is_custom = 0
      WHERE name = ?
    `);

    for (const product of defaultProducts) {
      markDefault.run(product.name);
    }

    seedProducts(db);



    db.exec(`
      CREATE TABLE IF NOT EXISTS calculation_items (
        id TEXT PRIMARY KEY,
        product_id INTEGER,
        name TEXT NOT NULL,
        grams REAL NOT NULL CHECK (grams > 0),
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        fat REAL NOT NULL,
        carbs REAL NOT NULL,
        entry_date TEXT NOT NULL
          CHECK (
            entry_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
          ),
        meal_type TEXT NOT NULL DEFAULT 'breakfast'
          CHECK (
            meal_type IN (
              'breakfast',
              'snack1',
              'lunch',
              'snack2',
              'dinner'
            )
          )
      );
    `);

    const calculationColumns = db.prepare(
      'PRAGMA table_info(calculation_items)'
    ).all();

    const migrationDate = new Date().toLocaleDateString('en-CA');

    if (
      !calculationColumns.some(
        column => column.name === 'entry_date'
      )
    ) {
      db.exec(`
        ALTER TABLE calculation_items
        ADD COLUMN entry_date TEXT
      `);

      db.prepare(`
        UPDATE calculation_items
        SET entry_date = ?
        WHERE entry_date IS NULL
      `).run(migrationDate);
    }

    if (
      !calculationColumns.some(
        column => column.name === 'meal_type'
      )
    ) {
      db.exec(`
        ALTER TABLE calculation_items
        ADD COLUMN meal_type TEXT NOT NULL DEFAULT 'breakfast'
      `);
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_calculation_items_date
      ON calculation_items(entry_date);
    `);


    for (const product of defaultProducts) {
      markDefault.run(product.name);
    }


    db.exec(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sex TEXT NOT NULL CHECK (sex IN ('female', 'male')),
        age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 120),
        height REAL NOT NULL CHECK (height BETWEEN 100 AND 250),
        weight REAL NOT NULL CHECK (weight BETWEEN 25 AND 400),
        activity TEXT NOT NULL CHECK (
          activity IN (
            'sedentary',
            'light',
            'moderate',
            'active',
            'veryActive'
          )
        ),
        goal TEXT NOT NULL CHECK (
          goal IN ('lose', 'maintain', 'gain')
        ),
        protein_goal REAL,
        fat_goal REAL,
        carbs_goal REAL
      );
    `);

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
