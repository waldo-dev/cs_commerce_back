'use strict';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateAddCustomerToStore = (req, res, next) => {
  const { store_id, email, password, company_id } = req.body;
  const errors = [];

  if (!store_id) {
    errors.push('store_id es requerido');
  }

  if (!email) {
    errors.push('email es requerido');
  }

  if (email && !isValidEmail(email)) {
    errors.push('El email debe tener un formato válido');
  }

  if (req.user && req.user.role === 'administrador de plataforma' && company_id && isNaN(company_id)) {
    errors.push('company_id debe ser un número válido');
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
  validateAddCustomerToStore
};

