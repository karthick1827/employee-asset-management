const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeHistory,
} = require('../controllers/employeeController');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole(['admin', 'hr', 'staff']), listEmployees);
router.post('/', requireRole(['admin', 'hr']), createEmployee);
router.get('/:id', requireRole(['admin', 'hr', 'staff']), getEmployee);
router.put('/:id', requireRole(['admin', 'hr']), updateEmployee);
router.delete('/:id', requireRole(['admin', 'hr']), deleteEmployee);
router.get('/:id/history', requireRole(['admin', 'hr', 'staff']), getEmployeeHistory);

module.exports = router;
