import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  initializeDatabase,
  closeDatabase
} from '../src/database/db.js';

import {
  getAllProducts,
  getProductById,
  getProductsCount
} from '../src/database/products.js';

function createTestDirectory() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), 'caloriecalc-test-')
  );
}

function cleanup(directory) {
  closeDatabase();

  fs.rmSync(directory, {
    recursive: true,
    force: true
  });
}

test('база даних створюється успішно', () => {
  const directory = createTestDirectory();

  try {
    const database = initializeDatabase(directory);

    assert.ok(database);

    const table = database.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = 'products'
    `).get();

    assert.equal(table.name, 'products');
  } finally {
    cleanup(directory);
  }
});

test('база містить 40 продуктів', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    assert.equal(getProductsCount(), 40);
  } finally {
    cleanup(directory);
  }
});

test('отримання всіх продуктів працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const products = getAllProducts();

    assert.equal(products.length, 40);
    assert.ok(products.every(product => product.id > 0));
    assert.ok(products.every(product => product.name));
  } finally {
    cleanup(directory);
  }
});

test('пошук продукту за ID працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const products = getAllProducts();
    const firstProduct = products[0];

    const foundProduct = getProductById(firstProduct.id);

    assert.equal(foundProduct.id, firstProduct.id);
    assert.equal(foundProduct.name, firstProduct.name);
  } finally {
    cleanup(directory);
  }
});

test('пошук неіснуючого продукту повертає null', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const product = getProductById(-1);

    assert.equal(product, null);
  } finally {
    cleanup(directory);
  }
});

test('повторне заповнення бази не створює дублікатів', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);
    assert.equal(getProductsCount(), 40);

    closeDatabase();

    initializeDatabase(directory);
    assert.equal(getProductsCount(), 40);
  } finally {
    cleanup(directory);
  }
});
