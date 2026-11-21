import { getDatabase } from './db.js';

import {
  validateCalculationItem,
  validateEntryId
} from './validation.js';


const MEAL_TYPES = [
  'breakfast',
  'snack1',
  'lunch',
  'snack2',
  'dinner'
];

export function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validateEntryDate(date) {
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new Error('Некоректний формат дати.');
  }

  const [year, month, day] = date.split('-').map(Number);

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error('Такої дати не існує.');
  }

  return date;
}

export function validateMealType(mealType) {
  if (!MEAL_TYPES.includes(mealType)) {
    throw new Error('Некоректний прийом їжі.');
  }

  return mealType;
}


export function getCalculationItems(date = getLocalDate()) {
  const validDate = validateEntryDate(date);
  const database = getDatabase();

  return database.prepare(`
    SELECT
      id AS entryId,
      product_id AS productId,
      name,
      grams,
      calories,
      protein,
      fat,
      carbs,
      entry_date AS entryDate,
      meal_type AS mealType
    FROM calculation_items
    WHERE entry_date = ?
    ORDER BY rowid ASC
  `).all(validDate);
}




export function saveCalculationItem(item) {
  const valid = validateCalculationItem(item);

  const entryDate = validateEntryDate(
    item.entryDate ?? getLocalDate()
  );

  const mealType = validateMealType(
    item.mealType ?? 'breakfast'
  );

  const database = getDatabase();

  database.prepare(`
    INSERT INTO calculation_items (
      id,
      product_id,
      name,
      grams,
      calories,
      protein,
      fat,
      carbs,
      entry_date,
      meal_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    valid.entryId,
    valid.productId,
    valid.name,
    valid.grams,
    valid.calories,
    valid.protein,
    valid.fat,
    valid.carbs,
    entryDate,
    mealType
  );

  return {
    ...valid,
    entryDate,
    mealType
  };
}



export function deleteCalculationItem(entryId) {
  validateEntryId(entryId);

  const database = getDatabase();

  const result = database.prepare(`
    DELETE FROM calculation_items
    WHERE id = ?
  `).run(entryId);

  return result.changes > 0;
}


export function clearCalculationItems(date = getLocalDate()) {
  const validDate = validateEntryDate(date);
  const database = getDatabase();

  database.prepare(`
    DELETE FROM calculation_items
    WHERE entry_date = ?
  `).run(validDate);

  return true;
}
