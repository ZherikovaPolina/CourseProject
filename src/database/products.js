import { getDatabase } from './db.js';

export function getAllProducts() {
  const database = getDatabase();

  const statement = database.prepare(`
    SELECT
      id,
      name,
      calories,
      protein,
      fat,
      carbs
    FROM products
    ORDER BY name COLLATE NOCASE ASC
  `);

  return statement.all();
}

export function getProductById(id) {
  const database = getDatabase();

  const statement = database.prepare(`
    SELECT
      id,
      name,
      calories,
      protein,
      fat,
      carbs
    FROM products
    WHERE id = ?
  `);

  return statement.get(id) ?? null;
}

export function getProductsCount() {
  const database = getDatabase();

  const statement = database.prepare(`
    SELECT COUNT(*) AS count
    FROM products
  `);

  return statement.get().count;
}

export function createProduct(product) {
  const database = getDatabase();

  const statement = database.prepare(`
    INSERT INTO products (
      name,
      calories,
      protein,
      fat,
      carbs
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    product.name,
    product.calories,
    product.protein,
    product.fat,
    product.carbs
  );

  return getProductById(Number(result.lastInsertRowid));
}

export function updateProduct(id, product) {
  const database = getDatabase();

  const statement = database.prepare(`
    UPDATE products
    SET
      name = ?,
      calories = ?,
      protein = ?,
      fat = ?,
      carbs = ?
    WHERE id = ?
  `);

  const result = statement.run(
    product.name,
    product.calories,
    product.protein,
    product.fat,
    product.carbs,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getProductById(id);
}
