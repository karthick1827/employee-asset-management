const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    assignedDate: { type: Date, required: true, default: Date.now },
    returnedDate: { type: Date, default: null },
    conditionNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

assignmentSchema.index({ assetId: 1, returnedDate: 1 });
assignmentSchema.index({ employeeId: 1, returnedDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
