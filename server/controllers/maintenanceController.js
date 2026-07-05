const MaintenanceTicket = require('../models/MaintenanceTicket');
const Asset = require('../models/Asset');
const Assignment = require('../models/Assignment');
const httpError = require('../utils/httpError');

async function openTicket(req, res, next) {
  try {
    const { assetId, issueDescription } = req.body;
    if (!assetId || !issueDescription) {
      throw httpError(400, 'assetId and issueDescription are required');
    }

    const asset = await Asset.findById(assetId);
    if (!asset) throw httpError(404, 'Asset not found');
    if (asset.status === 'retired') {
      throw httpError(409, 'Cannot open a maintenance ticket for a retired asset');
    }

    // Auto-return an active assignment, then pull the asset out of circulation (AD-2).
    const activeAssignment = await Assignment.findOne({ assetId, returnedDate: null });
    if (activeAssignment) {
      activeAssignment.returnedDate = new Date();
      activeAssignment.conditionNotes = activeAssignment.conditionNotes
        ? `${activeAssignment.conditionNotes}; pulled for repair`
        : 'pulled for repair';
      await activeAssignment.save();
    }

    asset.status = 'in-repair';
    await asset.save();

    const ticket = await MaintenanceTicket.create({
      assetId,
      issueDescription,
      status: 'open',
      reportedDate: new Date(),
    });

    res.status(201).json({ data: ticket });
  } catch (err) {
    next(err);
  }
}

async function resolveTicket(req, res, next) {
  try {
    const ticket = await MaintenanceTicket.findById(req.params.id);
    if (!ticket) throw httpError(404, 'Maintenance ticket not found');
    if (ticket.status === 'resolved') throw httpError(409, 'Ticket is already resolved');

    ticket.status = 'resolved';
    ticket.resolvedDate = new Date();
    await ticket.save();

    const asset = await Asset.findById(ticket.assetId);
    if (asset && asset.status === 'in-repair') {
      asset.status = 'available';
      await asset.save();
    }

    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
}

async function listTickets(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const tickets = await MaintenanceTicket.find(filter).populate('assetId').sort({ reportedDate: -1 });
    res.json({ data: tickets, count: tickets.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { openTicket, resolveTicket, listTickets };
