'use strict';

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateStore,
  validateUpdateStore
} = require('../validators/storeValidator');

router.get('/', authenticate, storeController.getAllStores);

router.get('/:id', authenticate, storeController.getStoreById);

router.post('/', authenticate, validateCreateStore, storeController.createStore);

router.put('/:id', authenticate, validateUpdateStore, storeController.updateStore);

router.delete('/:id', authenticate, storeController.deleteStore);

module.exports = router;

