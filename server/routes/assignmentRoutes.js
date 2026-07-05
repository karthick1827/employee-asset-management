const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { assignAsset, returnAsset, myAssignments } = require('../controllers/assignmentController');

const router = express.Router();

router.use(authenticate);

router.get('/my', requireRole(['staff']), myAssignments);
router.post('/', requireRole(['admin']), assignAsset);
router.patch('/:id/return', requireRole(['admin']), returnAsset);

module.exports = router;
