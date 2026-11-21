import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  initializeDatabase,
  closeDatabase,
  getDatabase
} from '../src/database/db.js';

import {
  getCalculationItems,
  saveCalculationItem,
  clearCalculationItems,
  validateEntryDate,
  validateMealType
} from '../src/database/calculationItems.js';

function withDatabase(callback) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'caloriecalc-diary-')
  );

  try {
    initializeDatabase(directory);
    callback();
  } finally {
    closeDatabase();
    fs.rmSync(directory, {
      recursive: true,
      force: true
    });
  }
}

function makeItem(entryId, entryDate, mealType) {
  return {
    entryId,
    productId: null,
    name: 'Яблуко',
    grams: 100,
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    entryDate,
    mealType
  };
}

test('перевірка правильного формату дати', () => {
  assert.equal(
    validateEntryDate('2026-11-21'),
    '2026-11-21'
  );

  assert.throws(() => validateEntryDate('21-11-2026'));
  assert.throws(() => validateEntryDate('2026-02-30'));
});

test('перевірка прийомів їжі', () => {
  assert.equal(validateMealType('breakfast'), 'breakfast');
  assert.equal(validateMealType('snack1'), 'snack1');
  assert.equal(validateMealType('lunch'), 'lunch');
  assert.equal(validateMealType('snack2'), 'snack2');
  assert.equal(validateMealType('dinner'), 'dinner');

  assert.throws(() => validateMealType('midnight'));
});

test('записи різних днів зберігаються окремо', () => {
  withDatabase(() => {
    saveCalculationItem(
      makeItem('entry-1', '2026-11-20', 'breakfast')
    );

    saveCalculationItem(
      makeItem('entry-2', '2026-11-21', 'lunch')
    );

    const yesterday = getCalculationItems('2026-11-20');
    const today = getCalculationItems('2026-11-21');

    assert.equal(yesterday.length, 1);
    assert.equal(today.length, 1);

    assert.equal(yesterday[0].mealType, 'breakfast');
    assert.equal(today[0].mealType, 'lunch');
  });
});

test('очищення одного дня не видаляє інший', () => {
  withDatabase(() => {
    saveCalculationItem(
      makeItem('entry-1', '2026-11-20', 'breakfast')
    );

    saveCalculationItem(
      makeItem('entry-2', '2026-11-21', 'dinner')
    );

    clearCalculationItems('2026-11-21');

    assert.equal(
      getCalculationItems('2026-11-21').length,
      0
    );

    assert.equal(
      getCalculationItems('2026-11-20').length,
      1
    );
  });
});

test('запис зберігає дату та прийом їжі', () => {
  withDatabase(() => {
    const item = saveCalculationItem(
      makeItem('entry-1', '2026-11-21', 'snack1')
    );

    assert.equal(item.entryDate, '2026-11-21');
    assert.equal(item.mealType, 'snack1');

    const saved = getCalculationItems('2026-11-21')[0];

    assert.equal(saved.entryDate, '2026-11-21');
    assert.equal(saved.mealType, 'snack1');
  });
});

test('таблиця має нові колонки', () => {
  withDatabase(() => {
    const columns = getDatabase()
      .prepare('PRAGMA table_info(calculation_items)')
      .all()
      .map(column => column.name);

    assert.ok(columns.includes('entry_date'));
    assert.ok(columns.includes('meal_type'));
  });
});
