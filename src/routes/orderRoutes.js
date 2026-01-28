'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateOrder
} = require('../validators/orderValidator');

router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);
router.put('/:id', authenticate, validateUpdateOrder, orderController.updateOrder);
router.delete('/:id', authenticate, orderController.deleteOrder);

module.exports = router;

