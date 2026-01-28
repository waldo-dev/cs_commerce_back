'use strict';

const express = require('express');
const router = express.Router();
const userStoreController = require('../controllers/userStoreController');
const { authenticate } = require('../middleware/auth');
const {
  validateAssociateUserStore,
  validateUpdateUserStore
} = require('../validators/userStoreValidator');
const {
  validateAddCustomerToStore
} = require('../validators/customerStoreValidator');

router.get('/', authenticate, userStoreController.getUserStores);

router.get('/user/:user_id', authenticate, userStoreController.getStoresByUser);

router.get('/user', authenticate, userStoreController.getStoresByUser);

router.get('/store/:store_id', authenticate, userStoreController.getUsersByStore);

router.post('/add-customer', authenticate, validateAddCustomerToStore, userStoreController.addCustomerToStore);

router.post('/', authenticate, validateAssociateUserStore, userStoreController.associateUserStore);

router.put('/:id', authenticate, validateUpdateUserStore, userStoreController.updateUserStore);

router.delete('/:id', authenticate, userStoreController.removeUserStore);

module.exports = router;

