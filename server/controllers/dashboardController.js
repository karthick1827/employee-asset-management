const Asset = require('../models/Asset');

async function summary(req, res, next) {
  try {
    const [totalAssets, assignedCount, availableCount, inRepairCount, retiredCount] = await Promise.all([
      Asset.countDocuments({}),
      Asset.countDocuments({ status: 'assigned' }),
      Asset.countDocuments({ status: 'available' }),
      Asset.countDocuments({ status: 'in-repair' }),
      Asset.countDocuments({ status: 'retired' }),
    ]);

    const ninetyDaysOut = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const warrantyExpiringSoon = await Asset.find({
      warrantyExpiry: { $lte: ninetyDaysOut, $gte: new Date() },
      status: { $ne: 'retired' },
    }).sort({ warrantyExpiry: 1 });

    res.json({
      data: {
        totalAssets,
        assignedCount,
        availableCount,
        inRepairCount,
        retiredCount,
        warrantyExpiringSoon,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
