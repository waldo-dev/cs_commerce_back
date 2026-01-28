'use strict';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

const validateRegister = (req, res, next) => {
  const { name, email, password, company_id } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('El nombre es requerido');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('El email es requerido y debe tener un formato válido');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('La contraseña es requerida y debe tener al menos 6 caracteres');
  }

  if (!company_id) {
    errors.push('El company_id es requerido');
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

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('El email es requerido y debe tener un formato válido');
  }

  if (!password) {
    errors.push('La contraseña es requerida');
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

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('La contraseña actual es requerida');
  }

  if (!newPassword || !isValidPassword(newPassword)) {
    errors.push('La nueva contraseña es requerida y debe tener al menos 6 caracteres');
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
  validateRegister,
  validateLogin,
  validateChangePassword,
  isValidEmail,
  isValidPassword
};

