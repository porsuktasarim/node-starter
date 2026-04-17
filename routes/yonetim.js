const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const { girisGerekli, izinGerekli } = require('../middleware/auth');

// Kullanıcı listesi
router.get('/kullanicilar', girisGerekli, izinGerekli('yonetim.kullanicilar.goruntule'), async (req, res) => {
  try {
    const kullanicilar = await User.find().populate('grup').sort({ createdAt: -1 });
    const gruplar = await Group.find({ aktif: true });
    res.render('yonetim/kullanicilar', {
      title: 'Kullanıcılar',
      kullanici: req.session.kullanici,
      kullanicilar,
      gruplar,
      hata: null,
      basari: null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Kullanıcı ekle
router.post('/kullanicilar/ekle', girisGerekli, izinGerekli('yonetim.kullanicilar.ekle'), async (req, res) => {
  try {
    const { ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, sifre, rol, grup } = req.body;
    const yeniKullanici = new User({ ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, sifre, rol, grup });
    await yeniKullanici.save();
    res.redirect('/yonetim/kullanicilar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar?hata=1');
  }
});

// Kullanıcı güncelle
router.post('/kullanicilar/guncelle/:id', girisGerekli, izinGerekli('yonetim.kullanicilar.guncelle'), async (req, res) => {
  try {
    const { ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, rol, grup, aktif } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, rol, grup,
      aktif: aktif === 'on'
    });
    res.redirect('/yonetim/kullanicilar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar?hata=1');
  }
});

// Kullanıcı sil
router.post('/kullanicilar/sil/:id', girisGerekli, izinGerekli('yonetim.kullanicilar.sil'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/yonetim/kullanicilar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar?hata=1');
  }
});

// Grup listesi
router.get('/gruplar', girisGerekli, izinGerekli('yonetim.gruplar.goruntule'), async (req, res) => {
  try {
    const gruplar = await Group.find().sort({ kod: 1 });
    const MODULLER = require('../config/moduller');
    res.render('yonetim/gruplar', {
      title: 'Gruplar',
      kullanici: req.session.kullanici,
      gruplar,
      MODULLER,
      hata: null,
      basari: null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Grup güncelle
router.post('/gruplar/guncelle/:id', girisGerekli, izinGerekli('yonetim.gruplar.guncelle'), async (req, res) => {
  try {
    const { ad, izinler } = req.body;
    await Group.findByIdAndUpdate(req.params.id, {
      ad,
      izinler: izinler ? (Array.isArray(izinler) ? izinler : [izinler]) : []
    });
    res.redirect('/yonetim/gruplar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/gruplar?hata=1');
}
});

// Grup ekle
router.post('/gruplar/ekle', girisGerekli, izinGerekli('yonetim.gruplar.ekle'), async (req, res) => {
  try {
    const { kod, ad } = req.body;
    const yeniGrup = new Group({ kod, ad, izinler: [] });
    await yeniGrup.save();
    res.redirect('/yonetim/gruplar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/gruplar?hata=1');
  }
});

// Grup sil
router.post('/gruplar/sil/:id', girisGerekli, izinGerekli('yonetim.gruplar.guncelle'), async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.redirect('/yonetim/gruplar?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/gruplar?hata=1');
  }
});

module.exports = router;