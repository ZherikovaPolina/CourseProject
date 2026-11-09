import { products } from '../data/products.js';

export function seedProducts(database) {
  const insertProduct = database.prepare(`
    INSERT OR IGNORE INTO products (
      name,
      calories,
      protein,
      fat,
      carbs
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');

  try {
    for (const product of products) {
      insertProduct.run(
        product.name,
        product.calories,
        product.protein,
        product.fat,
        product.carbs
      );
    }

    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}