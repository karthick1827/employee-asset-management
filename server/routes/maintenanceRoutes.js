const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { openTicket, resolveTicket, listTickets } = require('../controllers/maintenanceController');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole(['admin']), listTickets);
router.post('/', requireRole(['admin']), openTicket);
router.patch('/:id/resolve', requireRole(['admin']), resolveTicket);

module.exports = router;
