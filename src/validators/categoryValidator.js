'use strict';

const validateCreateCategory = (req, res, next) => {
  const { name, store_id } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('El nombre es requerido y debe ser un string válido');
  }

  if (name && name.length > 120) {
    errors.push('El nombre no puede exceder 120 caracteres');
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

const validateUpdateCategory = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('El nombre debe ser un string válido');
    }
    if (name && name.length > 120) {
      errors.push('El nombre no puede exceder 120 caracteres');
    }
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
  validateCreateCategory,
  validateUpdateCategory
};

