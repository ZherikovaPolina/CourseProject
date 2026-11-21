import React from 'react';

function shiftDate(date, days) {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, '0'),
    String(next.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export default function DiaryDatePicker({ date, onChange }) {
  return (
    <section className="card diary-date-card">
      <div className="diary-date-heading">
        <div>
          <h2>Щоденник харчування</h2>
          <p>Обери день, щоб переглянути або додати продукти.</p>
        </div>
      </div>

      <div className="diary-date-controls">
        <button
          type="button"
          className="diary-date-arrow"
          aria-label="Попередній день"
          onClick={() => onChange(shiftDate(date, -1))}
        >
          ‹
        </button>

        <input
          type="date"
          aria-label="Дата щоденника"
          value={date}
          onChange={event => {
            if (event.target.value) {
              onChange(event.target.value);
            }
          }}
        />

        <button
          type="button"
          className="diary-date-arrow"
          aria-label="Наступний день"
          onClick={() => onChange(shiftDate(date, 1))}
        >
          ›
        </button>

        <button
          type="button"
          className="diary-today-button"
          onClick={() => onChange(getToday())}
        >
          Сьогодні
        </button>
      </div>
    </section>
  );
}

function getToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}
