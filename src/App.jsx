import React, { useState } from 'react';
import { products } from './data/products';
import { round, calculate } from './utils/calculations';

function App() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [grams, setGrams] = useState('100');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.trim().toLowerCase())
  );


const weight = Number(grams);

function validateWeight(value) {
  if (value.trim() === '') {
    return 'Введіть кількість грамів.';
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'Введіть правильне числове значення.';
  }

  if (number <= 0) {
    return 'Кількість грамів повинна бути більшою за 0.';
  }

  if (number > 10000) {
    return 'Максимальна кількість — 10 000 г.';
  }

  return '';
}

const weightError = validateWeight(grams);
const validWeight = weightError === '';

  const preview =
    selectedProduct && validWeight
      ? calculate(selectedProduct, weight)
      : null;

  function selectProduct(product) {
    setSelectedProduct(product);
    setSearch(product.name);
    setIsDropdownOpen(false);
    setError('');
  }

  function addProduct() {
    if (!selectedProduct) {
      setError('Спочатку виберіть продукт.');
      return;
    }

if (!validWeight) {
  setError(weightError);
  return;
}
    const result = calculate(selectedProduct, weight);

    setItems(previous => [
      ...previous,
      {
        ...result,
        entryId: crypto.randomUUID(),
        name: selectedProduct.name,
        grams: weight
      }
    ]);

    setSearch('');
    setSelectedProduct(null);
    setIsDropdownOpen(false);
    setGrams('100');
    setError('');
  }

  function removeProduct(entryId) {
    setItems(previous =>
      previous.filter(item => item.entryId !== entryId)
    );
  }

  function clearProducts() {
    setItems([]);
  }

  const totals = items.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      fat: total.fat + item.fat,
      carbs: total.carbs + item.carbs
    }),
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    }
  );

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">C</div>
          <span>CalorieCalc</span>
        </div>
      </header>

      <main className="container">
        <div className="page-title">
          <h1>Калькулятор калорій</h1>
          <p>
            Розрахунок калорійності та харчової цінності продуктів
          </p>
        </div>

        <div className="content">
          <section className="card">
            <h2>Додати продукт</h2>

            <div className="field product-field">
              <label htmlFor="product-search">
                Продукт
              </label>

              <div className="product-select">
                <input
                  id="product-search"
                  type="text"
                  placeholder="Оберіть продукт зі списку"
                  value={search}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-controls="product-options"
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={event => {
                    setSearch(event.target.value);
                    setSelectedProduct(null);
                    setIsDropdownOpen(true);
                    setError('');
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                  onBlur={() => {
                    setIsDropdownOpen(false);
                  }}
                />

                <button
                  type="button"
                  className="dropdown-arrow"
                  aria-label="Показати список продуктів"
                  aria-expanded={isDropdownOpen}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setIsDropdownOpen(previous => !previous);
                  }}
                >
                  ▾
                </button>
              </div>

              {isDropdownOpen && (
                <div
                  className="dropdown-list"
                  id="product-options"
                  role="listbox"
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={
                          selectedProduct?.id === product.id
                        }
                        className="dropdown-item"
                        key={product.id}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => selectProduct(product)}
                      >
                        <span>{product.name}</span>
                        <small>
                          {product.calories} ккал / 100 г
                        </small>
                      </button>
                    ))
                  ) : (
                    <p className="dropdown-empty">
                      Продукт не знайдено
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="product-weight">
                Кількість (г)
              </label>

              
                <input
                id="product-weight"
                type="number"
                min="0.01"
                max="10000"
                step="any"
                value={grams}
                aria-invalid={!validWeight}
                onChange={event => {
                    setGrams(event.target.value);
                    setError('');
                }}
                />

                {!validWeight && (
                <p className="weight-error">
                    {weightError}
                </p>
                )}

            </div>

            <div className="nutrition">
              <h3>Харчова цінність</h3>

              <div className="calories">
                {preview ? round(preview.calories) : '—'}
                <span> ккал</span>
              </div>

              <div className="nutrition-values">
                <div>
                  <span>Білки</span>
                  <strong>
                    {preview ? round(preview.protein) : '—'} г
                  </strong>
                </div>

                <div>
                  <span>Жири</span>
                  <strong>
                    {preview ? round(preview.fat) : '—'} г
                  </strong>
                </div>

                <div>
                  <span>Вуглеводи</span>
                  <strong>
                    {preview ? round(preview.carbs) : '—'} г
                  </strong>
                </div>
              </div>
            </div>

            {error && (
              <p className="error">{error}</p>
            )}

            <button
              className="add-button"
              type="button"
              onClick={addProduct}
            >
              Додати продукт
            </button>
          </section>

          <section className="card">
            <div className="list-header">
              <h2>Список продуктів</h2>

              <div className="list-actions">
                <span className="count">
                  {items.length}
                </span>

                {items.length > 0 && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={clearProducts}
                  >
                    Очистити список
                  </button>
                )}
              </div>
            </div>

            <div className="product-list">
              {items.length === 0 ? (
                <p className="empty-list">
                  Ви ще не додали жодного продукту.
                </p>
              ) : (
                items.map(item => (
                  <div
                    className="list-item"
                    key={item.entryId}
                  >
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.grams} г ·{' '}
                        {round(item.calories)} ккал
                      </span>
                    </div>

                    <button
                      className="delete-button"
                      type="button"
                      aria-label={`Видалити ${item.name}`}
                      onClick={() =>
                        removeProduct(item.entryId)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="total">
              <h3>Загальний результат</h3>

              <div className="total-calories">
                {round(totals.calories)}
                <span> ккал</span>
              </div>

              <div className="total-values">
                <div>
                  <span>Білки</span>
                  <strong>
                    {round(totals.protein)} г
                  </strong>
                </div>

                <div>
                  <span>Жири</span>
                  <strong>
                    {round(totals.fat)} г
                  </strong>
                </div>

                <div>
                  <span>Вуглеводи</span>
                  <strong>
                    {round(totals.carbs)} г
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
