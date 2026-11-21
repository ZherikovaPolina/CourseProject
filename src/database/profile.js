import { getDatabase } from './db.js';
import { calculateDailyGoals } from '../utils/dailyGoals.js';

export function getUserProfile() {
  const db = getDatabase();

  const profile = db.prepare(`
    SELECT
      sex,
      age,
      height,
      weight,
      activity,
      goal,
      protein_goal AS proteinGoal,
      fat_goal AS fatGoal,
      carbs_goal AS carbsGoal
    FROM user_profile
    WHERE id = 1
  `).get();

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    dailyGoals: getProfileDailyGoals(profile),
  };
}

export function getProfileDailyGoals(profile) {
  const calculated = calculateDailyGoals(profile);

  return {
    ...calculated,
    protein: profile.proteinGoal ?? calculated.protein,
    fat: profile.fatGoal ?? calculated.fat,
    carbs: profile.carbsGoal ?? calculated.carbs,
  };
}

export function saveUserProfile(profile) {
  calculateDailyGoals(profile);

  const proteinGoal = validateOptionalGoal(
    profile.proteinGoal,
    'білків'
  );
  const fatGoal = validateOptionalGoal(
    profile.fatGoal,
    'жирів'
  );
  const carbsGoal = validateOptionalGoal(
    profile.carbsGoal,
    'вуглеводів'
  );

  const db = getDatabase();

  db.prepare(`
    INSERT INTO user_profile (
      id,
      sex,
      age,
      height,
      weight,
      activity,
      goal,
      protein_goal,
      fat_goal,
      carbs_goal
    )
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      sex = excluded.sex,
      age = excluded.age,
      height = excluded.height,
      weight = excluded.weight,
      activity = excluded.activity,
      goal = excluded.goal,
      protein_goal = excluded.protein_goal,
      fat_goal = excluded.fat_goal,
      carbs_goal = excluded.carbs_goal
  `).run(
    profile.sex,
    profile.age,
    profile.height,
    profile.weight,
    profile.activity,
    profile.goal,
    proteinGoal,
    fatGoal,
    carbsGoal
  );

  return getUserProfile();
}

function validateOptionalGoal(value, name) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(
      `Денна ціль ${name} має бути додатним числом.`
    );
  }

  return value;
}
