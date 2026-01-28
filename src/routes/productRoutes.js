'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct
} = require('../validators/productValidator');

router.get('/', authenticate, productController.getAllProducts);
router.get('/:id', authenticate, productController.getProductById);
router.post('/', authenticate, validateCreateProduct, productController.createProduct);
router.put('/:id', authenticate, validateUpdateProduct, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;

