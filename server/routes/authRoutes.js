const express = require('express');
const { login, register, me } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/login', login);
router.post('/register', authenticate, requireRole(['admin']), register);
router.get('/me', authenticate, me);

module.exports = router;
