import { getDatabase } from './db.js';

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
    item.entryId,
    item.productId ?? null,
    item.name,
    item.grams,
    item.calories,
    item.protein,
    item.fat,
    item.carbs
  );

  return item;
}

export function deleteCalculationItem(entryId) {
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
