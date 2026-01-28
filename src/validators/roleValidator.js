'use strict';

const validateCreateRole = (req, res, next) => {
  const { value } = req.body;
  const errors = [];

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    errors.push('El value es requerido y debe ser un string válido');
  }

  if (value && value.length > 100) {
    errors.push('El value no puede exceder 100 caracteres');
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

const validateUpdateRole = (req, res, next) => {
  const { value } = req.body;
  const errors = [];

  if (value !== undefined) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push('El value debe ser un string válido');
    }

    if (value && value.length > 100) {
      errors.push('El value no puede exceder 100 caracteres');
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
  validateCreateRole,
  validateUpdateRole
};

