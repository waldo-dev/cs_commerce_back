'use strict';

const validateCreateOrder = (req, res, next) => {
  const { store_id, items } = req.body;
  const errors = [];

  if (!store_id) {
    errors.push('store_id es requerido');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('La orden debe tener al menos un item');
  }

  if (items && Array.isArray(items)) {
    items.forEach((item, index) => {
      if (!item.product_id) {
        errors.push(`Item ${index + 1}: product_id es requerido`);
      }
      if (item.quantity !== undefined && (isNaN(item.quantity) || parseInt(item.quantity) <= 0)) {
        errors.push(`Item ${index + 1}: quantity debe ser un número mayor a 0`);
      }
    });
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

const validateUpdateOrder = (req, res, next) => {
  const { status, payment_status } = req.body;
  const errors = [];

  const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  const validPaymentStatuses = ['unpaid', 'paid', 'refunded', 'partial'];

  if (status && !validStatuses.includes(status)) {
    errors.push(`status debe ser uno de: ${validStatuses.join(', ')}`);
  }

  if (payment_status && !validPaymentStatuses.includes(payment_status)) {
    errors.push(`payment_status debe ser uno de: ${validPaymentStatuses.join(', ')}`);
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
  validateCreateOrder,
  validateUpdateOrder
};

