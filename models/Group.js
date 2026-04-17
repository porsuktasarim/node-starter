const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  kod: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ad: {
    type: String,
    required: true,
    trim: true
  },
  izinler: [{
    type: String,
    trim: true
  }],
  aktif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);