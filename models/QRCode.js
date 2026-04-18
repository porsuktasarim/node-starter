const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  kod: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tip: {
    type: String,
    enum: ['kullanici', 'organizasyon', 'ekipman', 'operasyon', 'kit'],
    required: true
  },
  hedefId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tipModel'
  },
  tipModel: {
    type: String,
    enum: ['User', 'Organization', 'Equipment', 'Operation', 'Kit'],
    required: true
  },
  aktif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);