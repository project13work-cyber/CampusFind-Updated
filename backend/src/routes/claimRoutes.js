const express = require('express');
const router = express.Router();
const { createClaim, getClaims, getClaimById } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('proofImages', 3), createClaim);
router.get('/', protect, getClaims);
router.get('/:id', protect, getClaimById);

module.exports = router;
