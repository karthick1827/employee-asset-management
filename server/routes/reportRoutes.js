const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const Asset = require('../models/Asset');
const Assignment = require('../models/Assignment');

const router = express.Router();

function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

router.get('/asset-allocation.csv', authenticate, requireRole(['admin']), async (req, res, next) => {
  try {
    const assets = await Asset.find({}).sort({ assetTag: 1 });
    const activeAssignments = await Assignment.find({ returnedDate: null }).populate('employeeId');
    const holderByAssetId = new Map(
      activeAssignments.map((a) => [String(a.assetId), a.employeeId ? a.employeeId.name : ''])
    );

    const header = ['Asset Tag', 'Category', 'Status', 'Current Holder', 'Purchase Date', 'Warranty Expiry'];
    const rows = assets.map((asset) => [
      asset.assetTag,
      asset.category,
      asset.status,
      holderByAssetId.get(String(asset._id)) || '',
      asset.purchaseDate ? asset.purchaseDate.toISOString().slice(0, 10) : '',
      asset.warrantyExpiry ? asset.warrantyExpiry.toISOString().slice(0, 10) : '',
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="asset-allocation.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
