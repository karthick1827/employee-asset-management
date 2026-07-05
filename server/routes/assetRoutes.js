const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  retireAsset,
  getAssetHistory,
  getAssetMaintenance,
} = require('../controllers/assetController');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole(['admin', 'hr', 'staff']), listAssets);
router.post('/', requireRole(['admin']), createAsset);
router.get('/:id', requireRole(['admin', 'hr', 'staff']), getAsset);
router.put('/:id', requireRole(['admin']), updateAsset);
router.delete('/:id', requireRole(['admin']), retireAsset);
router.get('/:id/history', requireRole(['admin', 'hr']), getAssetHistory);
router.get('/:id/maintenance', requireRole(['admin', 'hr', 'staff']), getAssetMaintenance);

module.exports = router;
