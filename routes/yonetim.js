const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Organization = require('../models/Organization');
const Settings = require('../models/Settings');
const { girisGerekli, izinGerekli } = require('../middleware/auth');
const { qrOlustur } = require('./qr');
const { logoUpload } = require('../middleware/upload');

// Kullanıcı listesi
router.get('/kullanicilar', girisGerekli, izinGerekli('yonetim.kullanicilar.goruntule'), async (req, res) => {
  try {
    const kullanicilar = await User.find().populate('grup').populate('organizasyon').sort({ createdAt: -1 });
    const gruplar = await Group.find({ aktif: true });
    const organizasyonlar = await Organization.find({ aktif: true }).sort({ ad: 1 });
    res.render('yonetim/kullanicilar', {
      title: 'Kullanıcılar',
      kullanici: req.session.kullanici,
      kullanicilar,
      gruplar,
      organizasyonlar,
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
    const { ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, sifre, rol, grup, organizasyon } = req.body;
    const yeniKullanici = new User({ ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, sifre, rol, grup, organizasyon: organizasyon || null });
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
    const { ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, rol, grup, organizasyon, aktif } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      ad, soyad, kullaniciAdi, sicilNo, unvan, gorevYeri, email, rol, grup,
      organizasyon: organizasyon || null,
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
    const kullaniciSayilari = await User.aggregate([
      { $group: { _id: '$grup', sayi: { $sum: 1 } } }
    ]);
    const sayiMap = {};
    kullaniciSayilari.forEach(k => { if (k._id) sayiMap[k._id.toString()] = k.sayi; });
    const MODULLER = require('../config/moduller');
    res.render('yonetim/gruplar', {
      title: 'Gruplar',
      kullanici: req.session.kullanici,
      gruplar,
      MODULLER,
      sayiMap,
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

// Organizasyon listesi
router.get('/organizasyon', girisGerekli, izinGerekli('yonetim.organizasyon.goruntule'), async (req, res) => {
  try {
    const organizasyonlar = await Organization.find().populate('ust').sort({ ad: 1 });

    // Ağaç yapısı oluştur
    const agacYap = (liste, ustId = null) => {
      return liste
        .filter(o => String(o.ust ? o.ust._id : null) === String(ustId))
        .map(o => ({ ...o.toObject(), cocuklar: agacYap(liste, o._id) }));
    };
    const agac = agacYap(organizasyonlar);

    res.render('yonetim/organizasyon', {
      title: 'Organizasyon',
      kullanici: req.session.kullanici,
      organizasyonlar,
      agac,
      hata: null,
      basari: null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Organizasyon ekle
router.post('/organizasyon/ekle', girisGerekli, izinGerekli('yonetim.organizasyon.guncelle'), async (req, res) => {
  try {
    const { ad, tur, ust, kisaKod, dosyaAdindaKullan } = req.body;
    const yeni = new Organization({ 
      ad, tur, 
      ust: ust || null,
      kisaKod: kisaKod || '',
      dosyaAdindaKullan: dosyaAdindaKullan === 'on'
    });
    await yeni.save();
    res.redirect('/yonetim/organizasyon?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/organizasyon?hata=1');
  }
});

// Organizasyon güncelle
router.post('/organizasyon/guncelle/:id', girisGerekli, izinGerekli('yonetim.organizasyon.guncelle'), async (req, res) => {
  try {
    const { ad, tur, ust, kisaKod, dosyaAdindaKullan, aktif } = req.body;
    await Organization.findByIdAndUpdate(req.params.id, {
      ad, tur,
      ust: ust || null,
      kisaKod: kisaKod || '',
      dosyaAdindaKullan: dosyaAdindaKullan === 'on',
      aktif: aktif === 'on'
    });
    res.redirect('/yonetim/organizasyon?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/organizasyon?hata=1');
  }
});

// Organizasyon sil
router.post('/organizasyon/sil/:id', girisGerekli, izinGerekli('yonetim.organizasyon.guncelle'), async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.redirect('/yonetim/organizasyon?basari=1');
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/organizasyon?hata=1');
  }
});

// Organizasyon detay sayfası
router.get('/organizasyon/:id', girisGerekli, izinGerekli('yonetim.organizasyon.goruntule'), async (req, res) => {
  try {
    const birim = await Organization.findById(req.params.id).populate('ust');
    if (!birim) return res.redirect('/yonetim/organizasyon');

    const altBirimler = await Organization.find({ ust: req.params.id });
    const kullanicilar = await User.find({ organizasyon: req.params.id }).populate('grup');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qr = await qrOlustur('organizasyon', req.params.id, baseUrl);

    res.render('yonetim/organizasyon-detay', {
      title: birim.ad,
      kullanici: req.session.kullanici,
      birim,
      altBirimler,
      kullanicilar,
      qr
    });
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/organizasyon');
  }
});

// Grup detay sayfası
router.get('/gruplar/:id', girisGerekli, izinGerekli('yonetim.gruplar.goruntule'), async (req, res) => {
  try {
    const grup = await Group.findById(req.params.id);
    if (!grup) return res.redirect('/yonetim/gruplar');

    const kullanicilar = await User.find({ grup: req.params.id }).populate('organizasyon');
    const MODULLER = require('../config/moduller');

    res.render('yonetim/grup-detay', {
      title: grup.ad,
      kullanici: req.session.kullanici,
      grup,
      kullanicilar,
      MODULLER
    });
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/gruplar');
  }
});

// Kullanıcı detay sayfası
router.get('/kullanicilar/:kullaniciAdi', girisGerekli, izinGerekli('yonetim.kullanicilar.goruntule'), async (req, res) => {
  try {
    const k = await User.findOne({ kullaniciAdi: req.params.kullaniciAdi }).populate('grup').populate('organizasyon');
    if (!k) return res.redirect('/yonetim/kullanicilar');

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qr = await qrOlustur('kullanici', k._id, baseUrl);

    res.render('yonetim/kullanici-detay', {
      title: `${k.ad} ${k.soyad}`,
      kullanici: req.session.kullanici,
      k,
      qr
    });
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar');
  }
});

// Ayarlar sayfası
router.get('/ayarlar', girisGerekli, izinGerekli('yonetim.ayarlar.goruntule'), async (req, res) => {
  try {
    let ayarlar = await Settings.findOne();
    if (!ayarlar) ayarlar = await Settings.create({});
    res.render('yonetim/ayarlar', {
      title: 'Ayarlar',
      kullanici: req.session.kullanici,
      ayarlar,
      hata: null,
      basari: null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Ayarlar güncelle
router.post('/ayarlar', girisGerekli, izinGerekli('yonetim.ayarlar.guncelle'), logoUpload.single('logo'), async (req, res) => {
  try {
    const { sistemAdi, kurumAdi } = req.body;
    let ayarlar = await Settings.findOne();
    if (!ayarlar) ayarlar = new Settings();
    ayarlar.sistemAdi = sistemAdi;
    ayarlar.kurumAdi = kurumAdi;

    if (req.file) {
      ayarlar.logo = `/uploads/logo/${req.file.filename}`;
    }

    await ayarlar.save();
    res.render('yonetim/ayarlar', {
      title: 'Ayarlar',
      kullanici: req.session.kullanici,
      ayarlar,
      hata: null,
      basari: 'Ayarlar kaydedildi.'
    });
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/ayarlar');
  }
});

module.exports = router;