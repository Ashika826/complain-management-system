const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  respondToComplaint,
  updateComplaintStatus,
  rateComplaint
} = require('../controllers/complaintController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Customer & Admin routes
router.post('/', createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaint);

// Admin-only routes
router.post('/:id/respond', respondToComplaint);
router.patch('/:id/status', requireAdmin, updateComplaintStatus);

// Customer-only routes
router.post('/:id/rate', rateComplaint);

module.exports = router;