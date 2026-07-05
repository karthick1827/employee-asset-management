const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { summary } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticate);
router.get('/summary', requireRole(['admin', 'hr']), summary);

module.exports = router;
