export function validateId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Некоректний ID продукту.');
  }

  return id;
}

export function validateName(name) {
  if (typeof name !== 'string') {
    throw new Error('Назва має бути текстом.');
  }

  const trimmed = name.trim();

  if (trimmed.length === 0 || trimmed.length > 100) {
    throw new Error('Назва має містити від 1 до 100 символів.');
  }

  return trimmed;
}

export function validateNumber(value, field, allowZero = true) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    (!allowZero && value === 0)
  ) {
    throw new Error(`Некоректне значення поля: ${field}.`);
  }

  return value;
}

export function validateProduct(product) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    throw new Error('Некоректні дані продукту.');
  }

  return {
    name: validateName(product.name),
    calories: validateNumber(product.calories, 'Калорії'),
    protein: validateNumber(product.protein, 'Білки'),
    fat: validateNumber(product.fat, 'Жири'),
    carbs: validateNumber(product.carbs, 'Вуглеводи')
  };
}

export function validateEntryId(entryId) {
  if (
    typeof entryId !== 'string' ||
    entryId.trim().length === 0 ||
    entryId.length > 100
  ) {
    throw new Error('Некоректний ID запису.');
  }

  return entryId;
}

export function validateCalculationItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error('Некоректні дані розрахунку.');
  }

  return {
    entryId: validateEntryId(item.entryId),
    productId:
      item.productId == null ? null : validateId(item.productId),
    name: validateName(item.name),
    grams: validateNumber(item.grams, 'Грами', false),
    calories: validateNumber(item.calories, 'Калорії'),
    protein: validateNumber(item.protein, 'Білки'),
    fat: validateNumber(item.fat, 'Жири'),
    carbs: validateNumber(item.carbs, 'Вуглеводи')
  };
}
