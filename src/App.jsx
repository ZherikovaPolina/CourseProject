import React, { useEffect, useState } from 'react';
import { round, calculate } from './utils/calculations';

function App() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [grams, setGrams] = useState('100');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
const [editForm, setEditForm] = useState({
  name: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: ''
});
const [editError, setEditError] = useState('');
const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '', calories: '', protein: '', fat: '', carbs: ''
  });
  const [customError, setCustomError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  let cancelled = false;

  async function loadProducts() {
    try {
      if (!window.calorieAPI?.getProducts) {
        throw new Error('Electron API недоступний.');
      }

      const data = await window.calorieAPI.getProducts();

      if (!Array.isArray(data)) {
        throw new Error('Некоректна відповідь бази даних.');
      }

      if (!cancelled) {
        setProducts(data);
        setProductsError('');
      }
    } catch (error) {
      console.error('Помилка завантаження продуктів:', error);

      if (!cancelled) {
        setProductsError('Не вдалося завантажити продукти з бази даних.');
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  loadProducts();

  return () => {
    cancelled = true;
  };
}, []);

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


function startEditing(product) {
  if (product.is_custom !== 1) {
    return;
  }

  setEditingProduct(product);
  setEditForm({
    name: product.name,
    calories: String(product.calories),
    protein: String(product.protein),
    fat: String(product.fat),
    carbs: String(product.carbs)
  });
  setEditError('');
  setIsDropdownOpen(false);
}

function cancelEditing() {
  setEditingProduct(null);
  setEditError('');
}

function changeEditField(field, value) {
  setEditForm(previous => ({
    ...previous,
    [field]: value
  }));
  setEditError('');
}

async function saveEditedProduct(event) {
  event.preventDefault();

  if (!editingProduct || isSavingEdit) {
    return;
  }

  const name = editForm.name.trim();

  if (!name) {
    setEditError('Введіть назву продукту.');
    return;
  }

  const nutritionFields = [
    'calories',
    'protein',
    'fat',
    'carbs'
  ];

  for (const field of nutritionFields) {
    const value = editForm[field].trim();
    const number = Number(value);

    if (
      value === '' ||
      !Number.isFinite(number) ||
      number < 0
    ) {
      setEditError(
        'Усі харчові значення мають бути числами від 0.'
      );
      return;
    }
  }

  const updatedData = {
    name,
    calories: Number(editForm.calories),
    protein: Number(editForm.protein),
    fat: Number(editForm.fat),
    carbs: Number(editForm.carbs)
  };

  if (
    products.some(
      product =>
        product.id !== editingProduct.id &&
        product.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    setEditError('Продукт із такою назвою вже існує.');
    return;
  }

  setIsSavingEdit(true);

  try {
    const updated = await window.calorieAPI.updateProduct(
      editingProduct.id,
      updatedData
    );

    if (!updated) {
      throw new Error('Продукт не знайдено.');
    }

    setProducts(previous =>
      previous
        .map(product =>
          product.id === updated.id ? updated : product
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
    );

    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
      setSearch(updated.name);
    }

    setEditingProduct(null);
    setEditError('');
  } catch (error) {
    console.error('Помилка редагування:', error);
    setEditError(
      'Не вдалося зберегти зміни. Перевірте назву продукту.'
    );
  } finally {
    setIsSavingEdit(false);
  }
}

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

  function updateCustomProduct(field, value) {
    setCustomProduct(previous => ({ ...previous, [field]: value }));
    setCustomError('');
  }

  async function saveCustomProduct(event) {
    event.preventDefault();
    if (isSaving) return;

    const name = customProduct.name.trim();
    if (!name || name.length > 100) {
      setCustomError('Назва повинна містити від 1 до 100 символів.');
      return;
    }

    if (products.some(product => product.name.toLocaleLowerCase('uk') === name.toLocaleLowerCase('uk'))) {
      setCustomError('Продукт із такою назвою вже існує.');
      return;
    }

    const nutrition = {};
    for (const field of ['calories', 'protein', 'fat', 'carbs']) {
      const value = customProduct[field].trim();
      const number = Number(value);
      if (value === '' || !Number.isFinite(number) || number < 0 || number > 1000) {
        setCustomError('Усі харчові показники мають бути числами від 0 до 1000.');
        return;
      }
      nutrition[field] = number;
    }

    setIsSaving(true);
    setCustomError('');
    try {
      const created = await window.calorieAPI.createProduct({ name, ...nutrition });
      if (!created || typeof created.id !== 'number') {
        throw new Error('Некоректна відповідь бази даних.');
      }
      const updated = await window.calorieAPI.getProducts();
      if (!Array.isArray(updated)) {
        throw new Error('Не вдалося оновити список продуктів.');
      }
      setProducts(updated);
      setProductsError('');
      selectProduct(created);
      setCustomProduct({ name: '', calories: '', protein: '', fat: '', carbs: '' });
      setShowCustomForm(false);
    } catch (error) {
      console.error('Помилка збереження продукту:', error);
      setCustomError('Не вдалося зберегти продукт. Перевірте, чи немає продукту з такою назвою.');
    } finally {
      setIsSaving(false);
    }
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


{editingProduct && (
  <section className="card edit-product-card">
    <h2>Редагувати продукт</h2>

    <form onSubmit={saveEditedProduct}>
      <div className="field">
        <label htmlFor="edit-name">Назва продукту</label>
        <input
          id="edit-name"
          type="text"
          value={editForm.name}
          onChange={event =>
            changeEditField('name', event.target.value)
          }
        />
      </div>

      <div className="edit-nutrition-grid">
        {[
          ['calories', 'Калорійність (ккал)'],
          ['protein', 'Білки (г)'],
          ['fat', 'Жири (г)'],
          ['carbs', 'Вуглеводи (г)']
        ].map(([field, label]) => (
          <div className="field" key={field}>
            <label htmlFor={`edit-${field}`}>
              {label} на 100 г
            </label>
            <input
              id={`edit-${field}`}
              type="number"
              min="0"
              step="any"
              value={editForm[field]}
              onChange={event =>
                changeEditField(field, event.target.value)
              }
            />
          </div>
        ))}
      </div>

      {editError && (
        <p className="error" role="alert">
          {editError}
        </p>
      )}

      <div className="edit-form-actions">
        <button
          type="button"
          className="edit-cancel-button"
          onClick={cancelEditing}
          disabled={isSavingEdit}
        >
          Скасувати
        </button>

        <button
          type="submit"
          className="edit-save-button"
          disabled={isSavingEdit}
        >
          {isSavingEdit
            ? 'Збереження...'
            : 'Зберегти зміни'}
        </button>
      </div>
    </form>
  </section>
)}

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
                  {isLoading ? (
  <p className="dropdown-empty">
    Завантаження продуктів...
  </p>
) : productsError ? (
  <p className="dropdown-empty" role="alert">
    {productsError}
  </p>
) : filteredProducts.length > 0 ? (
                    
filteredProducts.map(product => (
  <div
    className="dropdown-product-row"
    key={product.id}
  >
    <button
      type="button"
      role="option"
      aria-selected={selectedProduct?.id === product.id}
      className="dropdown-item dropdown-product-select"
      onMouseDown={event => event.preventDefault()}
      onClick={() => selectProduct(product)}
    >
      <span>{product.name}</span>
      <small>
        {product.calories} ккал / 100 г
      </small>
    </button>

    {product.is_custom === 1 && (
      <button
        type="button"
        className="edit-product-button"
        onMouseDown={event => event.preventDefault()}
        onClick={() => startEditing(product)}
        aria-label={`Редагувати ${product.name}`}
      >
        Редагувати
      </button>
    )}
  </div>
))

                  ) : (
                    <p className="dropdown-empty">
                      Продукт не знайдено
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="custom-toggle-button"
              aria-expanded={showCustomForm}
              onClick={() => {
                setShowCustomForm(previous => !previous);
                setCustomError('');
                setIsDropdownOpen(false);
              }}
            >
              {showCustomForm ? 'Сховати форму' : '+ Створити власний продукт'}
            </button>

            {showCustomForm && (
              <form className="custom-product-form" onSubmit={saveCustomProduct}>
                <h3>Новий продукт</h3>
                <p className="custom-form-hint">Вкажіть харчову цінність на 100 г.</p>
                <div className="field">
                  <label htmlFor="custom-name">Назва продукту</label>
                  <input
                    id="custom-name"
                    type="text"
                    maxLength={100}
                    required
                    value={customProduct.name}
                    placeholder="Наприклад, Домашній салат"
                    onChange={event => updateCustomProduct('name', event.target.value)}
                  />
                </div>
                <div className="custom-fields-grid">
                  {[
                    { key: 'calories', label: 'Калорійність (ккал)' },
                    { key: 'protein', label: 'Білки (г)' },
                    { key: 'fat', label: 'Жири (г)' },
                    { key: 'carbs', label: 'Вуглеводи (г)' }
                  ].map(field => (
                    <div className="field" key={field.key}>
                      <label htmlFor={`custom-${field.key}`}>{field.label}</label>
                      <input
                        id={`custom-${field.key}`}
                        type="number"
                        min="0"
                        max="1000"
                        step="any"
                        required
                        value={customProduct[field.key]}
                        onChange={event => updateCustomProduct(field.key, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
                {customError && <p className="error" role="alert">{customError}</p>}
                <button type="submit" className="add-button" disabled={isSaving}>
                  {isSaving ? 'Збереження...' : 'Зберегти продукт'}
                </button>
              </form>
            )}

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
