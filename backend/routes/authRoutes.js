const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { register, login, googleAuth, loginWithGoogle, getUserProfile, verifyOtp } = require('../controllers/authController');

router.post('/signup', register);
router.post('/login', login);
router.post('/google', googleAuth); // For Google login/signup
router.post('/google-login', loginWithGoogle);
router.get('/me', authenticateToken, getUserProfile);
router.post('/verify-otp', verifyOtp);

module.exports = router;
