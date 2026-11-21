const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose: -300,
  maintain: 0,
  gain: 300,
};

function roundToOne(value) {
  return Math.round(value * 10) / 10;
}

export function calculateDailyGoals(profile) {
  const {
    sex,
    age,
    height,
    weight,
    activity,
    goal,
  } = profile ?? {};

  if (!['female', 'male'].includes(sex)) {
    throw new Error('Оберіть стать для розрахунку.');
  }

  if (!Number.isInteger(age) || age < 18 || age > 120) {
    throw new Error('Вік має бути від 18 до 120 років.');
  }

  if (
    !Number.isFinite(height) ||
    height < 100 ||
    height > 250
  ) {
    throw new Error('Зріст має бути від 100 до 250 см.');
  }

  if (
    !Number.isFinite(weight) ||
    weight < 25 ||
    weight > 400
  ) {
    throw new Error('Вага має бути від 25 до 400 кг.');
  }

  if (!Object.hasOwn(ACTIVITY_FACTORS, activity)) {
    throw new Error('Оберіть рівень фізичної активності.');
  }

  if (!Object.hasOwn(GOAL_ADJUSTMENTS, goal)) {
    throw new Error('Оберіть мету.');
  }

  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    (sex === 'male' ? 5 : -161);

  const maintenanceCalories = bmr * ACTIVITY_FACTORS[activity];

  const calories = Math.round(
    maintenanceCalories + GOAL_ADJUSTMENTS[goal]
  );

  if (calories < 1200) {
    throw new Error(
      'Розрахована калорійність надто низька. ' +
      'Змініть мету або зверніться до фахівця.'
    );
  }

  const protein = roundToOne((calories * 0.2) / 4);
  const fat = roundToOne((calories * 0.3) / 9);
  const carbs = roundToOne((calories * 0.5) / 4);

  return {
    calories,
    protein,
    fat,
    carbs,
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
  };
}

export function calculateRemaining(consumed, goals) {
  const nutrients = ['calories', 'protein', 'fat', 'carbs'];

  const result = {};

  for (const nutrient of nutrients) {
    const used = consumed?.[nutrient];
    const target = goals?.[nutrient];

    if (!Number.isFinite(used) || used < 0) {
      throw new Error(`Некоректне споживання: ${nutrient}`);
    }

    if (!Number.isFinite(target) || target <= 0) {
      throw new Error(`Некоректна денна ціль: ${nutrient}`);
    }

    result[nutrient] = {
      consumed: roundToOne(used),
      goal: roundToOne(target),
      remaining: roundToOne(Math.max(0, target - used)),
      exceeded: roundToOne(Math.max(0, used - target)),
      percentage: roundToOne((used / target) * 100),
    };
  }

  return result;
}
