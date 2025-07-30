const express = require('express');
const router = express.Router();
const { changePassword, sendResetLink, verifyOTP, resetPassword} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

// Routes
router.put('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', sendResetLink);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
