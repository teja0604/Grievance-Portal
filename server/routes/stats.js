const express = require('express');
const router = express.Router();
const { getComplaintStats } = require('../controllers/complaintController');
const { getUserStats } = require('../controllers/authController');

// Get complaint statistics (public)
router.get('/complaints', getComplaintStats);

// Get user statistics (public)
router.get('/users', getUserStats);

module.exports = router;