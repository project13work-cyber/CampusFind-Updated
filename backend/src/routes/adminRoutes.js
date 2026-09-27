const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllReports,
  approveReport,
  rejectReport,
  approveClaim,
  rejectClaim,
  recordHandover,
  getUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly guarded
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/reports', getAllReports);
router.put('/reports/:id/approve', approveReport);
router.put('/reports/:id/reject', rejectReport);
router.put('/claims/:id/approve', approveClaim);
router.put('/claims/:id/reject', rejectClaim);
router.put('/items/:id/returned', recordHandover);
router.get('/users', getUsers);

module.exports = router;
