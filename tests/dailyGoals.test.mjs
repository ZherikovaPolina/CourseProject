import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDailyGoals,
  calculateRemaining,
} from '../src/utils/dailyGoals.js';

const profile = {
  sex: 'female',
  age: 25,
  height: 165,
  weight: 60,
  activity: 'moderate',
  goal: 'maintain',
};

test('розраховує денну норму калорій', () => {
  const result = calculateDailyGoals(profile);

  assert.equal(result.bmr, 1345);
  assert.equal(result.calories, 2085);
});

test('розраховує цілі БЖВ', () => {
  const result = calculateDailyGoals(profile);

  assert.equal(result.protein, 104.3);
  assert.equal(result.fat, 69.5);
  assert.equal(result.carbs, 260.6);
});

test('мета схуднення зменшує калорійність', () => {
  const maintain = calculateDailyGoals(profile);

  const lose = calculateDailyGoals({
    ...profile,
    goal: 'lose',
  });

  assert.equal(maintain.calories - lose.calories, 300);
});

test('мета набору ваги збільшує калорійність', () => {
  const maintain = calculateDailyGoals(profile);

  const gain = calculateDailyGoals({
    ...profile,
    goal: 'gain',
  });

  assert.equal(gain.calories - maintain.calories, 300);
});

test('відхиляє некоректний вік', () => {
  assert.throws(() =>
    calculateDailyGoals({
      ...profile,
      age: 15,
    })
  );
});

test('відхиляє невідомий рівень активності', () => {
  assert.throws(() =>
    calculateDailyGoals({
      ...profile,
      activity: 'unknown',
    })
  );
});

test('розраховує спожите та залишок', () => {
  const result = calculateRemaining(
    {
      calories: 500,
      protein: 10,
      fat: 20,
      carbs: 60,
    },
    {
      calories: 2000,
      protein: 100,
      fat: 70,
      carbs: 250,
    }
  );

  assert.equal(result.protein.consumed, 10);
  assert.equal(result.protein.remaining, 90);
  assert.equal(result.protein.percentage, 10);
  assert.equal(result.calories.remaining, 1500);
});

test('показує перевищення денної норми', () => {
  const result = calculateRemaining(
    {
      calories: 2200,
      protein: 120,
      fat: 80,
      carbs: 270,
    },
    {
      calories: 2000,
      protein: 100,
      fat: 70,
      carbs: 250,
    }
  );

  assert.equal(result.calories.remaining, 0);
  assert.equal(result.calories.exceeded, 200);
  assert.equal(result.calories.percentage, 110);
});
