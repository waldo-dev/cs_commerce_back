'use strict';

const validateAssociateUserStore = (req, res, next) => {
  const { user_id, store_id } = req.body;
  const errors = [];

  if (!user_id) {
    errors.push('user_id es requerido');
  }

  if (!store_id) {
    errors.push('store_id es requerido');
  }

  if (user_id && isNaN(user_id)) {
    errors.push('user_id debe ser un número válido');
  }

  if (store_id && isNaN(store_id)) {
    errors.push('store_id debe ser un número válido');
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

const validateUpdateUserStore = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  const validStatuses = ['active', 'inactive', 'suspended'];

  if (status && !validStatuses.includes(status)) {
    errors.push(`status debe ser uno de: ${validStatuses.join(', ')}`);
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
  validateAssociateUserStore,
  validateUpdateUserStore
};

