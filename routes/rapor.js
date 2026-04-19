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

// Kimlik kartı PDF
router.get('/kimlik-karti/:kullaniciAdi', girisGerekli, async (req, res) => {
  try {
    const k = await User.findOne({ kullaniciAdi: req.params.kullaniciAdi })
      .populate({ path: 'organizasyon', populate: { path: 'ust' } })
      .populate('grup');

    if (!k) return res.redirect('/yonetim/kullanicilar');

    const Settings = require('../models/Settings');
    const ayarlar = await Settings.findOne() || { kurumAdi: '', logo: '', telefon: '', fontAdi: 'MYRIADPRO-REGULAR.OTF' };

    const QRCodeModel = require('../models/QRCode');
    const qrcode = require('qrcode');
    const qr = await QRCodeModel.findOne({ tip: 'kullanici', hedefId: k._id });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrUrl = qr ? `${baseUrl}/r/${qr.kod}` : baseUrl;
    const qrDataUrl = await qrcode.toDataURL(qrUrl, { width: 150 });

    // Görselleri base64'e çevir
    const fs = require('fs');
    const path = require('path');

    const gorselBase64 = (dosyaYolu) => {
      try {
        const tam = path.join(__dirname, '..', 'public', dosyaYolu);
        const data = fs.readFileSync(tam);
        const ext = path.extname(dosyaYolu).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mime};base64,${data.toString('base64')}`;
      } catch (e) {
        return '';
      }
    };

    const logoUrl = ayarlar.logo ? gorselBase64(ayarlar.logo.replace('/uploads/', 'uploads/')) : gorselBase64('uploads/logo/LogoBeyaz_Tarim.png');
    const bayrakUrl = gorselBase64('uploads/logo/BayrakBeyaz_Tarim.png');
    const fotografUrl = k.fotograf ? gorselBase64(k.fotograf.replace('/uploads/', 'uploads/')) : '';

    // HTML render
    const ejs = require('ejs');
    const html = await ejs.renderFile(
      path.join(__dirname, '..', 'views', 'pdf-sablonlar', 'kimlik-karti.ejs'),
      { kullanici: k, ayarlar, qrDataUrl, logoUrl, bayrakUrl, fotografUrl }
    );

    // Puppeteer ile PDF
    const chromium = require('chromium');
    const puppeteer = require('puppeteer-core');

    const browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH || chromium.path,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.setViewport({ width: 208, height: 322, deviceScaleFactor: 1 });
    const pdf = await page.pdf({
      width: '208px',
      height: '322px',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kimlik-${k.kullaniciAdi}.pdf"`);
    res.end(pdf);

  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar');
  }
});

module.exports = router;