'use strict';

const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, shipmentController.getAllShipments);
router.get('/:id', authenticate, shipmentController.getShipmentById);
router.post('/', authenticate, shipmentController.createShipment);
router.put('/:id', authenticate, shipmentController.updateShipment);
router.delete('/:id', authenticate, shipmentController.deleteShipment);

module.exports = router;

