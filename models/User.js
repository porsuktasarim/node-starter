const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
    trim: true
  },
  soyad: {
    type: String,
    required: true,
    trim: true
  },
  kullaniciAdi: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sicilNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  unvan: {
    type: String,
    trim: true
  },
  gorevYeri: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  sifre: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'kullanici'],
    default: 'kullanici'
  },
  grup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  organizasyon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  fotograf: {
    type: String,
    default: null
  },
  aktif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Kaydetmeden önce şifreyi hashle
userSchema.pre('save', async function() {
  if (!this.isModified('sifre')) return;
  this.sifre = await bcrypt.hash(this.sifre, 10);
});

// Şifre doğrulama metodu
userSchema.methods.sifreKontrol = async function(girilenSifre) {
  return await bcrypt.compare(girilenSifre, this.sifre);
};

module.exports = mongoose.model('User', userSchema);