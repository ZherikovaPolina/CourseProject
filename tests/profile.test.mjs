import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  initializeDatabase,
  closeDatabase,
} from '../src/database/db.js';

import {
  getUserProfile,
  saveUserProfile,
} from '../src/database/profile.js';

const validProfile = {
  sex: 'female',
  age: 25,
  height: 165,
  weight: 60,
  activity: 'moderate',
  goal: 'maintain',
};

function withTestDatabase(callback) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'caloriecalc-profile-')
  );

  try {
    initializeDatabase(directory);
    return callback();
  } finally {
    closeDatabase();
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('новий профіль спочатку відсутній', () => {
  withTestDatabase(() => {
    assert.equal(getUserProfile(), null);
  });
});

test('збереження профілю працює', () => {
  withTestDatabase(() => {
    const saved = saveUserProfile(validProfile);

    assert.equal(saved.sex, 'female');
    assert.equal(saved.age, 25);
    assert.equal(saved.weight, 60);
    assert.equal(saved.dailyGoals.calories, 2085);
  });
});

test('профіль можна оновити', () => {
  withTestDatabase(() => {
    saveUserProfile(validProfile);

    const updated = saveUserProfile({
      ...validProfile,
      weight: 65,
    });

    assert.equal(updated.weight, 65);
    assert.equal(getUserProfile().weight, 65);
  });
});

test('можна встановити власну ціль білків', () => {
  withTestDatabase(() => {
    const saved = saveUserProfile({
      ...validProfile,
      proteinGoal: 100,
    });

    assert.equal(saved.proteinGoal, 100);
    assert.equal(saved.dailyGoals.protein, 100);
  });
});

test('некоректний профіль не зберігається', () => {
  withTestDatabase(() => {
    assert.throws(() => {
      saveUserProfile({
        ...validProfile,
        age: 12,
      });
    });

    assert.equal(getUserProfile(), null);
  });
});

test('профіль зберігається після повторного відкриття бази', () => {
  withTestDatabase(() => {
    saveUserProfile(validProfile);

    closeDatabase();


test('профіль зберігається після повторного відкриття бази', () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'caloriecalc-profile-reopen-')
  );

  try {
    initializeDatabase(directory);
    saveUserProfile(validProfile);

    closeDatabase();
    initializeDatabase(directory);

    const restored = getUserProfile();

    assert.equal(restored.age, 25);
    assert.equal(restored.weight, 60);
  } finally {
    closeDatabase();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
  });
});
