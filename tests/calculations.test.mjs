
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculate,
  round
} from '../src/utils/calculations.js';

const apple = {
  name: 'Яблуко',
  calories: 52,
  protein: 0.3,
  fat: 0.2,
  carbs: 13.8
};

const banana = {
  name: 'Банан',
  calories: 89,
  protein: 1.1,
  fat: 0.3,
  carbs: 22.8
};

test('Розрахунок калорій для 100 г яблука', () => {
  const result = calculate(apple, 100);

  assert.equal(result.calories, 52);
});

test('Розрахунок калорій для 200 г яблука', () => {
  const result = calculate(apple, 200);

  assert.equal(result.calories, 104);
});

test('Розрахунок калорій для 50 г банана', () => {
  const result = calculate(banana, 50);

  assert.equal(result.calories, 44.5);
});

test('Розрахунок білків, жирів і вуглеводів', () => {
  const result = calculate(apple, 200);

  assert.equal(round(result.protein), 0.6);
  assert.equal(round(result.fat), 0.4);
  assert.equal(round(result.carbs), 27.6);
});

test('Розрахунок для 0 г продукту', () => {
  const result = calculate(apple, 0);

  assert.equal(result.calories, 0);
  assert.equal(result.protein, 0);
  assert.equal(result.fat, 0);
  assert.equal(result.carbs, 0);
});

test('Округлення до одного знака після коми', () => {
  assert.equal(round(52.345), 52.3);
  assert.equal(round(44.56), 44.6);
  assert.equal(round(100), 100);
});

test('Розрахунок дробової кількості грамів', () => {
  const result = calculate(apple, 0.5);

  assert.equal(round(result.calories), 0.3);
});

test('Розрахунок загальної калорійності двох продуктів', () => {
  const appleResult = calculate(apple, 200);
  const bananaResult = calculate(banana, 100);

  const totalCalories =
    appleResult.calories + bananaResult.calories;

  assert.equal(totalCalories, 193);
});
