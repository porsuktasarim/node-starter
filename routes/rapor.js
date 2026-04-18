const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Organization = require('../models/Organization');
const { girisGerekli } = require('../middleware/auth');
const { pdfOlustur, excelOlustur } = require('../utils/rapor');

// Kullanıcı listesi PDF
router.get('/kullanicilar/pdf', girisGerekli, async (req, res) => {
  try {
    const kullanicilar = await User.find().populate('grup').populate('organizasyon').sort({ ad: 1 });
    const kolonlar = ['Ad Soyad', 'Kullanici Adi', 'Sicil No', 'Unvan', 'Gorev Yeri', 'Organizasyon', 'Grup', 'Rol', 'Durum'];
    const satirlar = kullanicilar.map(k => [
      `${k.ad} ${k.soyad}`,
      k.kullaniciAdi,
      k.sicilNo,
      k.unvan || '—',
      k.gorevYeri || '—',
      k.organizasyon ? k.organizasyon.ad : '—',
      k.grup ? k.grup.ad : '—',
      k.rol,
      k.aktif ? 'Aktif' : 'Pasif'
    ]);
    pdfOlustur(res, 'Kullanici Listesi', kolonlar, satirlar);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Kullanıcı listesi Excel
router.get('/kullanicilar/excel', girisGerekli, async (req, res) => {
  try {
    const kullanicilar = await User.find().populate('grup').populate('organizasyon').sort({ ad: 1 });
    const kolonlar = ['Ad Soyad', 'Kullanici Adi', 'Sicil No', 'Unvan', 'Gorev Yeri', 'Organizasyon', 'Grup', 'Rol', 'Durum'];
    const satirlar = kullanicilar.map(k => [
      `${k.ad} ${k.soyad}`,
      k.kullaniciAdi,
      k.sicilNo,
      k.unvan || '—',
      k.gorevYeri || '—',
      k.organizasyon ? k.organizasyon.ad : '—',
      k.grup ? k.grup.ad : '—',
      k.rol,
      k.aktif ? 'Aktif' : 'Pasif'
    ]);
    await excelOlustur(res, 'Kullanici Listesi', kolonlar, satirlar);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Organizasyon listesi PDF
router.get('/organizasyon/pdf', girisGerekli, async (req, res) => {
  try {
    const organizasyonlar = await Organization.find().populate('ust').sort({ ad: 1 });
    const kolonlar = ['Ad', 'Tur', 'Ust Birim', 'Durum'];
    const satirlar = organizasyonlar.map(o => [
      o.ad,
      o.tur || '—',
      o.ust ? o.ust.ad : '—',
      o.aktif ? 'Aktif' : 'Pasif'
    ]);
    pdfOlustur(res, 'Organizasyon Listesi', kolonlar, satirlar);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Organizasyon listesi Excel
router.get('/organizasyon/excel', girisGerekli, async (req, res) => {
  try {
    const organizasyonlar = await Organization.find().populate('ust').sort({ ad: 1 });
    const kolonlar = ['Ad', 'Tur', 'Ust Birim', 'Durum'];
    const satirlar = organizasyonlar.map(o => [
      o.ad,
      o.tur || '—',
      o.ust ? o.ust.ad : '—',
      o.aktif ? 'Aktif' : 'Pasif'
    ]);
    await excelOlustur(res, 'Organizasyon Listesi', kolonlar, satirlar);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;