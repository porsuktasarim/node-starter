const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
    trim: true
  },
  kisaKod: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  dosyaAdindaKullan: {
    type: Boolean,
    default: false
  },
  ust: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  tur: {
    type: String,
    trim: true
  },
  aktif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);