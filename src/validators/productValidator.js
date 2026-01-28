'use strict';

const validateCreateProduct = (req, res, next) => {
  const { name, price, store_id } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('El nombre es requerido y debe ser un string válido');
  }

  if (name && name.length > 120) {
    errors.push('El nombre no puede exceder 120 caracteres');
  }

  if (price === undefined || price === null) {
    errors.push('El precio es requerido');
  }

  if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
    errors.push('El precio debe ser un número válido mayor o igual a 0');
  }

  if (!store_id) {
    errors.push('store_id es requerido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

const validateUpdateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('El nombre debe ser un string válido');
    }
    if (name && name.length > 120) {
      errors.push('El nombre no puede exceder 120 caracteres');
    }
  }

  if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
    errors.push('El precio debe ser un número válido mayor o igual a 0');
  }

  if (stock !== undefined && (isNaN(stock) || parseInt(stock) < 0)) {
    errors.push('El stock debe ser un número entero válido mayor o igual a 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors
    });
  }

  next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct
};

