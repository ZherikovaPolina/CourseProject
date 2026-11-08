
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

const round = (number) => Math.round(number * 10) / 10;

function App() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [grams, setGrams] = useState('100');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const filteredProducts = search.trim()
    ? products.filter(product =>
        product.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const weight = Number(grams);

  function calculate(product, amount) {
    return {
      calories: round(product.calories * amount / 100),
      protein: round(product.protein * amount / 100),
      fat: round(product.fat * amount / 100),
      carbs: round(product.carbs * amount / 100)
    };
  }

  const validWeight = grams.trim() !== '' &&
    Number.isFinite(weight) && weight > 0;

  const preview = selectedProduct && validWeight
    ? calculate(selectedProduct, weight)
    : null;

  function addProduct() {
    if (!selectedProduct) {
      setError('Спочатку виберіть продукт.');
      return;
    }

    if (!validWeight) {
      setError('Введіть правильну кількість грамів.');
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
    setGrams('100');
    setError('');
  }

  function removeProduct(entryId) {
    setItems(previous =>
      previous.filter(item => item.entryId !== entryId)
    );
  }

  const totals = items.reduce((total, item) => ({
    calories: total.calories + item.calories,
    protein: total.protein + item.protein,
    fat: total.fat + item.fat,
    carbs: total.carbs + item.carbs
  }), {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });

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

            <div className="field">
              <label htmlFor="product-search">Назва продукту</label>
              <input
                id="product-search"
                type="text"
                placeholder="Введіть назву продукту"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setSelectedProduct(null);
                  setError('');
                }}
              />
            </div>

            {search.trim() && !selectedProduct && (
              <div className="search-results">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <button
                      type="button"
                      className="search-item"
                      key={product.id}
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
                ) : (
                  <p className="no-results">Продукт не знайдено</p>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="product-weight">Кількість (г)</label>
              <input
                id="product-weight"
                type="number"
                min="0.1"
                step="any"
                value={grams}
                onChange={event => {
                  setGrams(event.target.value);
                  setError('');
                }}
              />
            </div>

            <div className="nutrition">
              <h3>Харчова цінність</h3>

              <div className="calories">
                {preview ? preview.calories : '—'}
                <span> ккал</span>
              </div>

              <div className="nutrition-values">
                <div>
                  <span>Білки</span>
                  <strong>{preview ? preview.protein : '—'} г</strong>
                </div>
                <div>
                  <span>Жири</span>
                  <strong>{preview ? preview.fat : '—'} г</strong>
                </div>
                <div>
                  <span>Вуглеводи</span>
                  <strong>{preview ? preview.carbs : '—'} г</strong>
                </div>
              </div>
            </div>

            {error && <p className="error">{error}</p>}

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
              <span className="count">{items.length}</span>
            </div>

            <div className="product-list">
              {items.length === 0 ? (
                <p className="empty-list">
                  Ви ще не додали жодного продукту.
                </p>
              ) : (
                items.map(item => (
                  <div className="list-item" key={item.entryId}>
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.grams} г · {item.calories} ккал
                      </span>
                    </div>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => removeProduct(item.entryId)}
                      aria-label={`Видалити ${item.name}`}
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
                  <strong>{round(totals.protein)} г</strong>
                </div>
                <div>
                  <span>Жири</span>
                  <strong>{round(totals.fat)} г</strong>
                </div>
                <div>
                  <span>Вуглеводи</span>
                  <strong>{round(totals.carbs)} г</strong>
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
