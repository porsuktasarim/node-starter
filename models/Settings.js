const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  sistemAdi: {
    type: String,
    default: 'AKEKOS'
  },
  kurumAdi: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: 'https://www.tarimorman.gov.tr/IcerikResimleri/BakanlikLogolariPng/LogoKirmizi_Tarim.png'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);