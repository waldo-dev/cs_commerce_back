'use strict';

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateRole,
  validateUpdateRole
} = require('../validators/roleValidator');

router.get('/', authenticate, roleController.getAllRoles);

router.get('/:id', authenticate, roleController.getRoleById);

router.post('/', authenticate, validateCreateRole, roleController.createRole);

router.put('/:id', authenticate, validateUpdateRole, roleController.updateRole);

router.delete('/:id', authenticate, roleController.deleteRole);

module.exports = router;

