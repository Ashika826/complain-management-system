const express = require('express');
const { getHomepageData } = require('../controllers/homepageController');

const router = express.Router();

// Public route for homepage data
router.get('/data', getHomepageData);

module.exports = router;