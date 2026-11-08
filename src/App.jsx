
import React, { useState } from 'react';

const products = [
  { id: 1, name: 'Яблуко', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 },
  { id: 2, name: 'Банан', calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8 },
  { id: 3, name: 'Куряче філе', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  { id: 4, name: 'Рис варений', calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2 },
  { id: 5, name: 'Яйце куряче', calories: 155, protein: 12.6, fat: 10.6, carbs: 1.1 },
  { id: 6, name: 'Молоко', calories: 60, protein: 3.2, fat: 3.3, carbs: 4.8 },
  { id: 7, name: 'Гречка варена', calories: 110, protein: 3.6, fat: 1.3, carbs: 21.3 },
  { id: 8, name: 'Вівсянка', calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3 }
];

const round = (value) => Math.round(value * 10) / 10;

function App() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [grams, setGrams] = useState('100');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const weight = Number(grams);

  const calculate = (product, amount) => ({
    calories: round(product.calories * amount / 100),
    protein: round(product.protein * amount / 100),
    fat: round(product.fat * amount / 100),
    carbs: round(product.carbs * amount / 100)
  });

  const preview = selectedProduct && Number.isFinite(weight) && weight > 0
    ? calculate(selectedProduct, weight)
    : null;

  const totals = items.reduce((total, item) => ({
    calories: total.calories + item.calories,
    protein: total.protein + item.protein,
    fat: total.fat + item.fat,
    carbs: total.carbs + item.carbs
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  function addProduct() {
    if (!selectedProduct) {
      setError('Спочатку виберіть продукт.');
      return;
    }

    if (!grams.trim() || !Number.isFinite(weight) || weight <= 0) {
      setError('Введіть правильну кількість грамів.');
      return;
    }

    const values = calculate(selectedProduct, weight);

    setItems(previous => [
      ...previous,
      {
        ...values,
        entryId: crypto.randomUUID(),
        name: selectedProduct.name,
        grams: weight
      }
    ]);

    setSelectedProduct(null);
    setSearch('');
    setGrams('100');
    setError('');
  }

  function removeProduct(entryId) {
    setItems(previous => previous.filter(item => item.entryId !== entryId));
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CalorieCalc</h2>
            <p>Контроль харчування</p>
          </div>
        </div>

        <div className="navigation">
          <div className="nav-item active">◉ &nbsp; Калькулятор</div>
          <div className="nav-item">▤ &nbsp; Мої продукти</div>
        </div>
      </aside>

      <main className="main">
        <header className="page-header">
          <div>
            <p className="eyebrow">ГОЛОВНА СТОРІНКА</p>
            <h1>Калькулятор калорій</h1>
            <p className="subtitle">
              Обирайте продукти та розраховуйте їхню харчову цінність.
            </p>
          </div>
        </header>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <span className="step">01</span>
              <div>
                <h2>Додати продукт</h2>
                <p>Знайдіть продукт і вкажіть його кількість.</p>
              </div>
            </div>

            <label htmlFor="search">Пошук продукту</label>
            <input
              id="search"
              type="text"
              placeholder="Наприклад, яблуко"
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setSelectedProduct(null);
                setError('');
              }}
            />

            <div className="product-results">
              {filteredProducts.length === 0 ? (
                <p className="empty">Продуктів не знайдено.</p>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    className={`product-option ${
                      selectedProduct?.id === product.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      setSelectedProduct(product);
                      setSearch(product.name);
                      setError('');
                    }}
                  >
                    <span>{product.name}</span>
                    <small>{product.calories} ккал / 100 г</small>
                  </button>
                ))
              )}
            </div>

            <label htmlFor="grams">Кількість продукту (г)</label>
            <input
              id="grams"
              type="number"
              min="0.1"
              step="any"
              value={grams}
              onChange={event => {
                setGrams(event.target.value);
                setError('');
              }}
            />

            <div className="preview">
              <h3>Харчова цінність</h3>
              <div className="nutrition-grid">
                <div><strong>{preview?.calories ?? '—'}</strong><span>Ккал</span></div>
                <div><strong>{preview?.protein ?? '—'}</strong><span>Білки, г</span></div>
                <div><strong>{preview?.fat ?? '—'}</strong><span>Жири, г</span></div>
                <div><strong>{preview?.carbs ?? '—'}</strong><span>Вуглеводи, г</span></div>
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button className="primary-button" onClick={addProduct}>
              + Додати до списку
            </button>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <span className="step">02</span>
              <div>
                <h2>Вибрані продукти</h2>
                <p>Список продуктів для загального розрахунку.</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-list">
                <div className="empty-icon">▤</div>
                <h3>Список поки порожній</h3>
                <p>Додайте перший продукт, щоб побачити результат.</p>
              </div>
            ) : (
              <div className="selected-list">
                {items.map(item => (
                  <div className="selected-item" key={item.entryId}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.grams} г · {item.calories} ккал</p>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeProduct(item.entryId)}
                      aria-label={`Видалити ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="total-section">
              <h3>Загальний результат</h3>
              <div className="total-calories">
                <strong>{round(totals.calories)}</strong>
                <span>ккал</span>
              </div>
              <div className="macro-row">
                <div><span>Білки</span><strong>{round(totals.protein)} г</strong></div>
                <div><span>Жири</span><strong>{round(totals.fat)} г</strong></div>
                <div><span>Вуглеводи</span><strong>{round(totals.carbs)} г</strong></div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
