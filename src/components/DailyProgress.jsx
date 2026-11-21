import React, { useEffect, useState } from 'react';
import ProgressRing from './ProgressRing';

export default function DailyProgress({ totals }) {
  const [goals, setGoals] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      try {
        const profile =
          await window.calorieAPI.getUserProfile();

        if (!cancelled) {
          setGoals(profile?.dailyGoals ?? null);
          setError('');
        }
      } catch (err) {
        console.error('Помилка завантаження цілей:', err);

        if (!cancelled) {
          setError('Не вдалося завантажити денні цілі.');
        }
      }
    }

    loadGoals();

    // Оновлюємо цілі після збереження профілю.
    function handleProfileUpdated(event) {
      if (!cancelled) {
        setGoals(event.detail?.dailyGoals ?? null);
      }
    }

    window.addEventListener(
      'caloriecalc:profile-updated',
      handleProfileUpdated
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        'caloriecalc:profile-updated',
        handleProfileUpdated
      );
    };
  }, []);

  return (
    <section className="card daily-progress-card">
      <h2>Мій прогрес</h2>

      {error && <p className="error" role="alert">{error}</p>}

      {!goals && !error && (
        <p className="progress-empty">
          Заповни «Мій профіль», щоб побачити
          персональний прогрес.
        </p>
      )}

      {goals && (
        <div className="daily-progress-grid">
          <ProgressRing
            label="Калорії"
            consumed={totals.calories}
            goal={goals.calories}
            unit="ккал"
            color="#438566"
          />

          <ProgressRing
            label="Білки"
            consumed={totals.protein}
            goal={goals.protein}
            unit="г"
            color="#6a91c5"
          />

          <ProgressRing
            label="Жири"
            consumed={totals.fat}
            goal={goals.fat}
            unit="г"
            color="#d5a34e"
          />

          <ProgressRing
            label="Вуглеводи"
            consumed={totals.carbs}
            goal={goals.carbs}
            unit="г"
            color="#a27ac2"
          />
        </div>
      )}
    </section>
  );
}
