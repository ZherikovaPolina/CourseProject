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
  getProductsCount,
  createProduct,
  updateProduct,
  deleteProduct
} from '../src/database/products.js';

import {
  getCalculationItems,
  saveCalculationItem,
  deleteCalculationItem,
  clearCalculationItems
} from '../src/database/calculationItems.js';


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

test('створення власного продукту працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const product = createProduct({
      name: 'Тестова страва',
      calories: 150,
      protein: 10,
      fat: 5,
      carbs: 20
    });

    assert.ok(product.id > 0);
    assert.equal(product.name, 'Тестова страва');
    assert.equal(product.calories, 150);
    assert.equal(product.is_custom, 1);
    assert.equal(getProductsCount(), 41);
  } finally {
    cleanup(directory);
  }
});

test('редагування власного продукту працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const product = createProduct({
      name: 'Тестовий обід',
      calories: 200,
      protein: 12,
      fat: 8,
      carbs: 25
    });

    const updated = updateProduct(product.id, {
      name: 'Оновлений обід',
      calories: 250,
      protein: 15,
      fat: 10,
      carbs: 30
    });

    assert.equal(updated.name, 'Оновлений обід');
    assert.equal(updated.calories, 250);
    assert.equal(updated.protein, 15);
    assert.equal(getProductById(product.id).name, 'Оновлений обід');
  } finally {
    cleanup(directory);
  }
});

test('стандартний продукт не можна редагувати', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const standard = getAllProducts().find(
      product => product.is_custom === 0
    );

    assert.ok(standard);

    const result = updateProduct(standard.id, {
      name: 'Змінений стандартний продукт',
      calories: 999,
      protein: 0,
      fat: 0,
      carbs: 0
    });

    assert.equal(result, null);
    assert.equal(getProductById(standard.id).name, standard.name);
  } finally {
    cleanup(directory);
  }
});

test('видалення власного продукту працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const product = createProduct({
      name: 'Продукт для видалення',
      calories: 100,
      protein: 5,
      fat: 3,
      carbs: 12
    });

    assert.equal(deleteProduct(product.id), true);
    assert.equal(getProductById(product.id), null);
    assert.equal(getProductsCount(), 40);
  } finally {
    cleanup(directory);
  }
});

test('стандартний продукт не можна видалити', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const standard = getAllProducts().find(
      product => product.is_custom === 0
    );

    assert.ok(standard);

    assert.equal(deleteProduct(standard.id), false);
    assert.ok(getProductById(standard.id));
    assert.equal(getProductsCount(), 40);
  } finally {
    cleanup(directory);
  }
});

function createTestCalculationItem(id = 'test-entry-1') {
  return {
    entryId: id,
    productId: 1,
    name: 'Тестове яблуко',
    grams: 200,
    calories: 104,
    protein: 0.6,
    fat: 0.4,
    carbs: 28
  };
}

test('додавання продукту до розрахунку працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    const item = createTestCalculationItem();

    saveCalculationItem(item);

    const savedItems = getCalculationItems();

    assert.equal(savedItems.length, 1);
    assert.equal(savedItems[0].entryId, item.entryId);
    assert.equal(savedItems[0].name, 'Тестове яблуко');
    assert.equal(savedItems[0].grams, 200);
    assert.equal(savedItems[0].calories, 104);
  } finally {
    cleanup(directory);
  }
});

test('розрахунки зберігаються після повторного відкриття бази', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    saveCalculationItem(createTestCalculationItem());

    closeDatabase();
    initializeDatabase(directory);

    const savedItems = getCalculationItems();

    assert.equal(savedItems.length, 1);
    assert.equal(savedItems[0].name, 'Тестове яблуко');
    assert.equal(savedItems[0].grams, 200);
  } finally {
    cleanup(directory);
  }
});

test('видалення одного запису розрахунку працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    saveCalculationItem(createTestCalculationItem('entry-1'));
    saveCalculationItem(createTestCalculationItem('entry-2'));

    const deleted = deleteCalculationItem('entry-1');

    assert.equal(deleted, true);

    const savedItems = getCalculationItems();

    assert.equal(savedItems.length, 1);
    assert.equal(savedItems[0].entryId, 'entry-2');
  } finally {
    cleanup(directory);
  }
});

test('очищення всього списку розрахунків працює', () => {
  const directory = createTestDirectory();

  try {
    initializeDatabase(directory);

    saveCalculationItem(createTestCalculationItem('entry-1'));
    saveCalculationItem(createTestCalculationItem('entry-2'));

    clearCalculationItems();

    assert.equal(getCalculationItems().length, 0);
  } finally {
    cleanup(directory);
  }
});
