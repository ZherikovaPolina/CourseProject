import { getDatabase } from './db.js';

import {
  validateCalculationItem,
  validateEntryId
} from './validation.js';

export function getCalculationItems() {
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
      carbs
    FROM calculation_items
    ORDER BY rowid ASC
  `).all();
}


export function saveCalculationItem(item) {
  const valid = validateCalculationItem(item);
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
      carbs
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    valid.entryId,
    valid.productId,
    valid.name,
    valid.grams,
    valid.calories,
    valid.protein,
    valid.fat,
    valid.carbs
  );

  return valid;
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

export function clearCalculationItems() {
  const database = getDatabase();

  database.prepare(`
    DELETE FROM calculation_items
  `).run();

  return true;
}
