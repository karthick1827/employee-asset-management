const Employee = require('../models/Employee');
const Assignment = require('../models/Assignment');
const httpError = require('../utils/httpError');

async function listEmployees(req, res, next) {
  try {
    const { search, department, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
      ];
    }

    if (req.user.role === 'staff') {
      if (!req.user.employeeId) return res.json({ data: [], count: 0 });
      filter._id = req.user.employeeId;
    }

    const employees = await Employee.find(filter).sort({ name: 1 });
    res.json({ data: employees, count: employees.length });
  } catch (err) {
    next(err);
  }
}

async function getEmployee(req, res, next) {
  try {
    if (req.user.role === 'staff' && String(req.user.employeeId) !== req.params.id) {
      throw httpError(403, 'Staff can only view their own employee record');
    }
    const employee = await Employee.findById(req.params.id);
    if (!employee) throw httpError(404, 'Employee not found');
    res.json({ data: employee });
  } catch (err) {
    next(err);
  }
}

async function createEmployee(req, res, next) {
  try {
    const { employeeId, name, department, designation, email, status } = req.body;
    if (!employeeId || !name || !department || !designation || !email) {
      throw httpError(400, 'employeeId, name, department, designation and email are required');
    }
    const existing = await Employee.findOne({ $or: [{ employeeId }, { email: email.toLowerCase() }] });
    if (existing) throw httpError(409, 'Employee with this employeeId or email already exists');

    const employee = await Employee.create({
      employeeId,
      name,
      department,
      designation,
      email: email.toLowerCase(),
      status: status || 'active',
    });
    res.status(201).json({ data: employee });
  } catch (err) {
    next(err);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const { name, department, designation, email, status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, department, designation, email, status },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!employee) throw httpError(404, 'Employee not found');
    res.json({ data: employee });
  } catch (err) {
    next(err);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const activeAssignment = await Assignment.findOne({ employeeId: req.params.id, returnedDate: null });
    if (activeAssignment) {
      throw httpError(409, 'Employee has active asset assignments; return them before deactivating');
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!employee) throw httpError(404, 'Employee not found');
    res.json({ data: employee });
  } catch (err) {
    next(err);
  }
}

async function getEmployeeHistory(req, res, next) {
  try {
    if (req.user.role === 'staff' && String(req.user.employeeId) !== req.params.id) {
      throw httpError(403, 'Staff can only view their own assignment history');
    }
    const history = await Assignment.find({ employeeId: req.params.id })
      .populate('assetId')
      .sort({ assignedDate: -1 });
    res.json({ data: history, count: history.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeHistory,
};
