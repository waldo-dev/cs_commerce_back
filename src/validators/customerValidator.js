'use strict';

const isValidEmail = (email) => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCreateCustomer = (req, res, next) => {
  const { store_id, email } = req.body;
  const errors = [];

  if (!store_id) {
    errors.push('store_id es requerido');
  }

  if (email && !isValidEmail(email)) {
    errors.push('El email debe tener un formato válido');
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

const validateUpdateCustomer = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (email && !isValidEmail(email)) {
    errors.push('El email debe tener un formato válido');
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
  validateCreateCustomer,
  validateUpdateCustomer
};

