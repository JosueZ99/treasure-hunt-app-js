const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');

// JWT Middleware (Corrected Import)
const verifyToken = require('../middlewares/auth');

// Auth Routes (Public and Protected)
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/user-data', verifyToken, authController.getUserData);

// Game Routes (Protected with JWT Token)
router.get('/leaderboard', verifyToken, gameController.getLeaderboard);
router.post('/scan-qr', verifyToken, gameController.scanQrCode);
router.get('/get_challenge/:token', verifyToken, gameController.getChallenge);
router.post('/validate_answer/:token', verifyToken, gameController.validateAnswer);
router.post('/update_user_progress/:token', verifyToken, gameController.updateUserProgress);
router.get('/get_next_hint/:token', verifyToken, gameController.getNextHint);

module.exports = router;
