import React from 'react';

export default function ProgressRing({
  label,
  consumed,
  goal,
  unit,
  color,
}) {
  const percentage = goal > 0
    ? (consumed / goal) * 100
    : 0;

  const visiblePercentage = Math.min(100, Math.max(0, percentage));
  const remaining = Math.max(0, goal - consumed);
  const exceeded = Math.max(0, consumed - goal);

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference * (1 - visiblePercentage / 100);

  const round = value => Math.round(value * 10) / 10;

  return (
    <div className="progress-ring-item">
      <div className="progress-ring">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${label}: ${Math.round(percentage)}% від норми`}
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="progress-ring-track"
          />

          <circle
            cx="60"
            cy="60"
            r={radius}
            className="progress-ring-fill"
            stroke={exceeded > 0 ? '#c54848' : color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />

          <text
            x="60"
            y="65"
            textAnchor="middle"
            className="progress-ring-percent"
          >
            {Math.round(percentage)}%
          </text>
        </svg>
      </div>

      <h3>{label}</h3>

      <p className="progress-ring-values">
        {round(consumed)} / {round(goal)} {unit}
      </p>

      <p className={
        exceeded > 0
          ? 'progress-ring-exceeded'
          : 'progress-ring-remaining'
      }>
        {exceeded > 0
          ? `Перевищено на ${round(exceeded)} ${unit}`
          : `Залишилось ${round(remaining)} ${unit}`}
      </p>
    </div>
  );
}
