'use strict';

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateCustomer,
  validateUpdateCustomer
} = require('../validators/customerValidator');

router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.post('/', authenticate, validateCreateCustomer, customerController.createCustomer);
router.put('/:id', authenticate, validateUpdateCustomer, customerController.updateCustomer);
router.delete('/:id', authenticate, customerController.deleteCustomer);

module.exports = router;

