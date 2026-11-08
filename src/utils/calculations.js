export function round(number) {
  return Math.round(number * 10) / 10;
}

export function calculate(product, grams) {
  return {
    calories: product.calories * grams / 100,
    protein: product.protein * grams / 100,
    fat: product.fat * grams / 100,
    carbs: product.carbs * grams / 100
  };
}
