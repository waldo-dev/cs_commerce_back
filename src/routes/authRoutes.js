'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateChangePassword
} = require('../validators/authValidator');

router.post('/register', validateRegister, authController.register);

router.post('/login', validateLogin, authController.login);

router.get('/verify', authenticate, authController.verifyToken);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, authController.updateProfile);

router.put('/change-password', authenticate, validateChangePassword, authController.changePassword);

module.exports = router;

