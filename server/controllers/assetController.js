const Asset = require('../models/Asset');
const Assignment = require('../models/Assignment');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const httpError = require('../utils/httpError');

async function listAssets(req, res, next) {
  try {
    const { search, category, status, warrantyWithinDays } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { assetTag: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
      ];
    }
    if (warrantyWithinDays) {
      const days = Number(warrantyWithinDays);
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      filter.warrantyExpiry = { $lte: until, $gte: new Date() };
    }

    const assets = await Asset.find(filter).sort({ assetTag: 1 });
    res.json({ data: assets, count: assets.length });
  } catch (err) {
    next(err);
  }
}

async function getAsset(req, res, next) {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) throw httpError(404, 'Asset not found');
    res.json({ data: asset });
  } catch (err) {
    next(err);
  }
}

async function createAsset(req, res, next) {
  try {
    const { assetTag, category, brand, model, purchaseDate, warrantyExpiry } = req.body;
    if (!assetTag || !category || !purchaseDate || !warrantyExpiry) {
      throw httpError(400, 'assetTag, category, purchaseDate and warrantyExpiry are required');
    }
    const existing = await Asset.findOne({ assetTag });
    if (existing) throw httpError(409, 'Asset with this assetTag already exists');

    const asset = await Asset.create({
      assetTag,
      category,
      brand,
      model,
      purchaseDate,
      warrantyExpiry,
      status: 'available',
    });
    res.status(201).json({ data: asset });
  } catch (err) {
    next(err);
  }
}

// AD-2: status is never writable through this route; it is only mutated by
// assignmentController (assign/return) and maintenanceController (open/resolve).
async function updateAsset(req, res, next) {
  try {
    const { status, ...rest } = req.body;
    const { category, brand, model, purchaseDate, warrantyExpiry, assetTag } = rest;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { assetTag, category, brand, model, purchaseDate, warrantyExpiry },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!asset) throw httpError(404, 'Asset not found');
    res.json({ data: asset });
  } catch (err) {
    next(err);
  }
}

async function retireAsset(req, res, next) {
  try {
    const activeAssignment = await Assignment.findOne({ assetId: req.params.id, returnedDate: null });
    if (activeAssignment) {
      throw httpError(409, 'Asset is currently assigned; return it before retiring');
    }
    const asset = await Asset.findByIdAndUpdate(req.params.id, { status: 'retired' }, { new: true });
    if (!asset) throw httpError(404, 'Asset not found');
    res.json({ data: asset });
  } catch (err) {
    next(err);
  }
}

async function getAssetHistory(req, res, next) {
  try {
    const history = await Assignment.find({ assetId: req.params.id })
      .populate('employeeId')
      .sort({ assignedDate: -1 });
    res.json({ data: history, count: history.length });
  } catch (err) {
    next(err);
  }
}

async function getAssetMaintenance(req, res, next) {
  try {
    const tickets = await MaintenanceTicket.find({ assetId: req.params.id }).sort({ reportedDate: -1 });
    res.json({ data: tickets, count: tickets.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  retireAsset,
  getAssetHistory,
  getAssetMaintenance,
};
