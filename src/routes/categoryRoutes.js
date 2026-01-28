'use strict';

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateCategory,
  validateUpdateCategory
} = require('../validators/categoryValidator');

router.get('/', authenticate, categoryController.getAllCategories);
router.get('/:id', authenticate, categoryController.getCategoryById);
router.post('/', authenticate, validateCreateCategory, categoryController.createCategory);
router.put('/:id', authenticate, validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;

