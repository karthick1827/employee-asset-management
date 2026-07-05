const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    purchaseDate: { type: Date, required: true },
    warrantyExpiry: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'assigned', 'in-repair', 'retired'],
      default: 'available',
    },
  },
  { timestamps: true }
);

assetSchema.index({ assetTag: 'text', category: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
