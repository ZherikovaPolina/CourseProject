import React from 'react';
import { round } from '../utils/calculations';

export const MEALS = [
  { id: 'breakfast', title: 'Сніданок', icon: '☀️' },
  { id: 'snack1', title: 'Перекус 1', icon: '🍎' },
  { id: 'lunch', title: 'Обід', icon: '🍽️' },
  { id: 'snack2', title: 'Перекус 2', icon: '🥜' },
  { id: 'dinner', title: 'Вечеря', icon: '🌙' },
];

export default function MealSections({
  items,
  onDelete,
  onAddToMeal,
  disabled,
}) {
  return (
    <div className="meal-sections">
      {MEALS.map(meal => {
        const mealItems = items.filter(
          item => item.mealType === meal.id
        );

        const calories = mealItems.reduce(
          (sum, item) => sum + item.calories,
          0
        );

        return (
          <section className="meal-section" key={meal.id}>
            <div className="meal-section-heading">
              <div className="meal-section-title">
                <span>{meal.icon}</span>
                <h3>{meal.title}</h3>
              </div>

              <span className="meal-section-calories">
                {round(calories)} ккал
              </span>
            </div>

            {mealItems.length === 0 ? (
              <p className="meal-section-empty">
                Продукти ще не додано
              </p>
            ) : (
              mealItems.map(item => (
                <div className="list-item" key={item.entryId}>
                  <div className="item-info">
                    <strong>{item.name}</strong>
                    <span>
                      {item.grams} г · {round(item.calories)} ккал
                    </span>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    aria-label={`Видалити ${item.name}`}
                    disabled={disabled}
                    onClick={() => onDelete(item.entryId)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            <button
  type="button"
  className="meal-add-button"
  disabled={disabled}
  onClick={() => onAddToMeal(meal.id)}
>
  <span aria-hidden="true">＋</span>
  Додати продукт
</button>
          </section>
        );
      })}
    </div>
  );
}
