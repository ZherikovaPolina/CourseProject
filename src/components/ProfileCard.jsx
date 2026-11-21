import React, { useEffect, useState } from 'react';

const initialProfile = {
  sex: 'female',
  age: '',
  height: '',
  weight: '',
  activity: 'moderate',
  goal: 'maintain',
};

export default function ProfileCard() {
  const [profile, setProfile] = useState(initialProfile);
  const [dailyGoals, setDailyGoals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        if (!window.calorieAPI?.getUserProfile) {
          throw new Error('API профілю недоступний.');
        }

        const saved = await window.calorieAPI.getUserProfile();

        if (!cancelled && saved) {
          setProfile({
            sex: saved.sex,
            age: String(saved.age),
            height: String(saved.height),
            weight: String(saved.weight),
            activity: saved.activity,
            goal: saved.goal,
          });

          setDailyGoals(saved.dailyGoals);
        }
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
        if (!cancelled) {
          setError('Не вдалося завантажити профіль.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field, value) {
    setProfile(previous => ({
      ...previous,
      [field]: value,
    }));
    setError('');
    setSuccess('');
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (isSaving) return;

    const age = Number(profile.age);
    const height = Number(profile.height);
    const weight = Number(profile.weight);

    if (
      profile.age.trim() === '' ||
      !Number.isInteger(age) ||
      age < 18 ||
      age > 120
    ) {
      setError('Вік має бути цілим числом від 18 до 120 років.');
      return;
    }

    if (
      profile.height.trim() === '' ||
      !Number.isFinite(height) ||
      height < 100 ||
      height > 250
    ) {
      setError('Зріст має бути від 100 до 250 см.');
      return;
    }

    if (
      profile.weight.trim() === '' ||
      !Number.isFinite(weight) ||
      weight < 25 ||
      weight > 400
    ) {
      setError('Вага має бути від 25 до 400 кг.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!window.calorieAPI?.saveUserProfile) {
        throw new Error('API збереження профілю недоступний.');
      }

      const saved = await window.calorieAPI.saveUserProfile({
        sex: profile.sex,
        age,
        height,
        weight,
        activity: profile.activity,
        goal: profile.goal,
      });

      setDailyGoals(saved.dailyGoals);
      window.dispatchEvent(
  new CustomEvent('caloriecalc:profile-updated', {
    detail: { dailyGoals: saved.dailyGoals },
  })
);
      setSuccess('Профіль успішно збережено!');
    } catch (err) {
      console.error('Помилка збереження профілю:', err);
      setError(
        'Не вдалося зберегти профіль. Перевір параметри.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="card profile-card">
      <div className="profile-heading">
        <div>
          <h2>Мій профіль</h2>
          <p>
            Персональний розрахунок добової норми калорій і БЖВ
          </p>
        </div>
        <span className="profile-icon">♡</span>
      </div>

      {isLoading ? (
        <p className="profile-muted">Завантаження профілю...</p>
      ) : (
        <form onSubmit={saveProfile}>
          <div className="profile-fields">
            <div className="field">
              <label htmlFor="profile-sex">Стать</label>
              <select
                id="profile-sex"
                value={profile.sex}
                onChange={event =>
                  updateField('sex', event.target.value)
                }
              >
                <option value="female">Жіноча</option>
                <option value="male">Чоловіча</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="profile-age">Вік (років)</label>
              <input
                id="profile-age"
                type="number"
                min="18"
                max="120"
                step="1"
                required
                placeholder="Наприклад, 21"
                value={profile.age}
                onChange={event =>
                  updateField('age', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="profile-height">Зріст (см)</label>
              <input
                id="profile-height"
                type="number"
                min="100"
                max="250"
                step="any"
                required
                placeholder="Наприклад, 165"
                value={profile.height}
                onChange={event =>
                  updateField('height', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="profile-weight">Вага (кг)</label>
              <input
                id="profile-weight"
                type="number"
                min="25"
                max="400"
                step="any"
                required
                placeholder="Наприклад, 60"
                value={profile.weight}
                onChange={event =>
                  updateField('weight', event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="profile-activity">
                Фізична активність
              </label>
              <select
                id="profile-activity"
                value={profile.activity}
                onChange={event =>
                  updateField('activity', event.target.value)
                }
              >
                <option value="sedentary">
                  Мінімальна (сидячий спосіб життя)
                </option>
                <option value="light">
                  Низька (1–3 тренування на тиждень)
                </option>
                <option value="moderate">
                  Помірна (3–5 тренувань на тиждень)
                </option>
                <option value="active">
                  Висока (6–7 тренувань на тиждень)
                </option>
                <option value="veryActive">
                  Дуже висока (інтенсивні навантаження)
                </option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="profile-goal">Мета</label>
              <select
                id="profile-goal"
                value={profile.goal}
                onChange={event =>
                  updateField('goal', event.target.value)
                }
              >
                <option value="lose">Схуднення</option>
                <option value="maintain">Підтримання ваги</option>
                <option value="gain">Набір ваги</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="error" role="alert">{error}</p>
          )}

          {success && (
            <p className="profile-success" role="status">
              {success}
            </p>
          )}

          <button
            className="profile-save-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? 'Збереження...'
              : 'Розрахувати та зберегти'}
          </button>
        </form>
      )}

      {dailyGoals && (
        <div className="profile-results">
          <h3>Твоя денна норма</h3>

          <div className="profile-results-grid">
            <div className="profile-result profile-result-main">
              <span>Калорії</span>
              <strong>{dailyGoals.calories}</strong>
              <small>ккал / день</small>
            </div>

            <div className="profile-result">
              <span>Білки</span>
              <strong>{dailyGoals.protein}</strong>
              <small>г / день</small>
            </div>

            <div className="profile-result">
              <span>Жири</span>
              <strong>{dailyGoals.fat}</strong>
              <small>г / день</small>
            </div>

            <div className="profile-result">
              <span>Вуглеводи</span>
              <strong>{dailyGoals.carbs}</strong>
              <small>г / день</small>
            </div>
          </div>

          <p className="profile-disclaimer">
            Розрахунок орієнтовний і не замінює
            індивідуальної консультації фахівця.
          </p>
        </div>
      )}
    </section>
  );
}
