import { getDatabase } from './db.js';
import {
  validateId,
  validateProduct
} from './validation.js';

export function getAllProducts() {
  const database = getDatabase();

  const statement = database.prepare(`
    SELECT
      id,
      name,
      calories,
      protein,
      fat,
      carbs,
      is_custom
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
      carbs,
      is_custom
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
  const valid = validateProduct(product);
  const database = getDatabase();

 
const duplicate = getAllProducts().some(
  existing =>
    existing.name.toLocaleLowerCase('uk') ===
    valid.name.toLocaleLowerCase('uk')
);

if (duplicate) {
  throw new Error('Продукт із такою назвою вже існує.');
}

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
    valid.name,
    valid.calories,
    valid.protein,
    valid.fat,
    valid.carbs
  );

  return getProductById(Number(result.lastInsertRowid));
}



export function updateProduct(id, product) {
  validateId(id);
  const valid = validateProduct(product);
  const database = getDatabase();


const duplicate = getAllProducts().some(
  existing =>
    existing.id !== id &&
    existing.name.toLocaleLowerCase('uk') ===
      valid.name.toLocaleLowerCase('uk')
);


  if (duplicate) {
    throw new Error('Продукт із такою назвою вже існує.');
  }

  const statement = database.prepare(`
    UPDATE products
    SET
      name = ?,
      calories = ?,
      protein = ?,
      fat = ?,
      carbs = ?
    WHERE id = ? AND is_custom = 1
  `);

  const result = statement.run(
    valid.name,
    valid.calories,
    valid.protein,
    valid.fat,
    valid.carbs,
    id
  );

  if (result.changes === 0) {
    return null;
  }

  return getProductById(id);
}


export function deleteProduct(id) {
  validateId(id);

  const database = getDatabase();

  const statement = database.prepare(`
    DELETE FROM products
    WHERE id = ? AND is_custom = 1
  `);

  const result = statement.run(id);

  return result.changes > 0;
}
