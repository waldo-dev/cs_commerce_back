'use strict';

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, paymentController.getAllPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.post('/', authenticate, paymentController.createPayment);
router.put('/:id', authenticate, paymentController.updatePayment);
router.delete('/:id', authenticate, paymentController.deletePayment);

module.exports = router;

