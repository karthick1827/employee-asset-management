const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    issueDescription: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    reportedDate: { type: Date, required: true, default: Date.now },
    resolvedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
