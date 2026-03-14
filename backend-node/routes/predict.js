const express = require('express');
const router = express.Router();

const { predictUrban } = require('../controllers/predictController');

router.post('/predict', predictUrban);

module.exports = router;