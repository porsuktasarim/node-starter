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
  },
  telefon: {
    type: String,
    default: ''
  },
  fontAdi: {
    type: String,
    default: 'MYRIADPRO-REGULAR.OTF'
  },
  fontKalin: {
    type: String,
    default: 'MYRIADPRO-BOLD.OTF'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);