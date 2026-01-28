'use strict';

const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');

router.post('/', seedController.seedDatabase);

router.post('/renato', seedController.seedRenatoStore);

module.exports = router;

