const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const httpError = require('../utils/httpError');

async function assignAsset(req, res, next) {
  try {
    const { assetId, employeeId, conditionNotes } = req.body;
    if (!assetId || !employeeId) {
      throw httpError(400, 'assetId and employeeId are required');
    }

    const asset = await Asset.findById(assetId);
    if (!asset) throw httpError(404, 'Asset not found');
    if (asset.status !== 'available') {
      throw httpError(409, `Asset is not available (current status: ${asset.status})`);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) throw httpError(404, 'Employee not found');
    if (employee.status !== 'active') {
      throw httpError(400, 'Cannot assign an asset to an inactive employee');
    }

    const assignment = await Assignment.create({
      assetId,
      employeeId,
      assignedDate: new Date(),
      returnedDate: null,
      conditionNotes: conditionNotes || '',
    });

    asset.status = 'assigned';
    await asset.save();

    res.status(201).json({ data: assignment });
  } catch (err) {
    next(err);
  }
}

async function returnAsset(req, res, next) {
  try {
    const { conditionNotes } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw httpError(404, 'Assignment not found');
    if (assignment.returnedDate) throw httpError(409, 'Assignment has already been returned');

    assignment.returnedDate = new Date();
    if (conditionNotes) assignment.conditionNotes = conditionNotes;
    await assignment.save();

    const asset = await Asset.findById(assignment.assetId);
    if (asset && asset.status === 'assigned') {
      asset.status = 'available';
      await asset.save();
    }

    res.json({ data: assignment });
  } catch (err) {
    next(err);
  }
}

async function myAssignments(req, res, next) {
  try {
    if (!req.user.employeeId) {
      return res.json({ data: [], count: 0 });
    }
    const assignments = await Assignment.find({
      employeeId: req.user.employeeId,
      returnedDate: null,
    })
      .populate('assetId')
      .sort({ assignedDate: -1 });
    res.json({ data: assignments, count: assignments.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { assignAsset, returnAsset, myAssignments };
