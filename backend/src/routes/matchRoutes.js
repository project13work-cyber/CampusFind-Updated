const express = require('express');
const router = express.Router();
const { getMatches, getMatchById } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMatches);
router.get('/:id', protect, getMatchById);

module.exports = router;
