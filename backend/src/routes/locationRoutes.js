const express = require('express');
const router = express.Router();
const { getLocations, createLocation } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getLocations);
router.post('/', protect, authorize('ADMIN'), createLocation);

module.exports = router;
