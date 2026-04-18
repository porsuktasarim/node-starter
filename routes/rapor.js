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
      .populate('organizasyon')
      .populate('grup');
    
    if (!k) return res.redirect('/yonetim/kullanicilar');

    const Settings = require('../models/Settings');
    const ayarlar = await Settings.findOne() || { kurumAdi: 'AKEKOS', logo: '', telefon: '' };
    
    const QRCode = require('../models/QRCode');
    const qrcode = require('qrcode');
    const qr = await QRCode.findOne({ tip: 'kullanici', hedefId: k._id });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrUrl = qr ? `${baseUrl}/r/${qr.kod}` : baseUrl;
    const qrDataUrl = await qrcode.toDataURL(qrUrl, { width: 120 });

    const PDFDocument = require('pdfkit');
    const fontPath = `public/fonts/${ayarlar.fontAdi || 'MYRIADPRO-REGULAR.OTF'}`;
    const fontKalinPath = `public/fonts/${ayarlar.fontKalin || 'MYRIADPRO-BOLD.OTF'}`;
    const doc = new PDFDocument({ 
      size: [155.91, 241.42], // 5.5 x 8.5 cm in points
      margin: 10
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kimlik-${k.kullaniciAdi}.pdf"`);
    doc.pipe(res);

    // ÖN YÜZ
    // QR Kod üstte
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrBuffer, (155.91 - 80) / 2, 10, { width: 80 });

    // Logo ve kurum adı
    doc.moveDown(0.2);
    doc.fontSize(7).font(fontKalinPath)
      .text(ayarlar.kurumAdi || 'AKEKOS', 10, 100, { align: 'center', width: 135.91 });

    // Çizgi
    doc.moveTo(10, 112).lineTo(145.91, 112).stroke();

    // Fotoğraf ve bilgiler
    if (k.fotograf) {
      try {
        doc.image(`public${k.fotograf}`, 10, 118, { width: 50, height: 60 });
      } catch(e) {}
    }

    const bilgiX = 70;
    doc.fontSize(9).font(fontKalinPath)
      .text(`${k.ad} ${k.soyad}`, bilgiX, 118, { width: 75 });
    doc.fontSize(7).font(fontPath)
      .text(`Sicil: ${k.sicilNo}`, bilgiX, 132, { width: 75 })
      .text(k.unvan || '', bilgiX, 142, { width: 75 })
      .text(k.organizasyon ? k.organizasyon.ad : '', bilgiX, 152, { width: 75 });

    // Seri no
    doc.fontSize(6).font(fontPath)
      .text(`Kart No: ${k.kartSeriNo}`, 10, 185, { align: 'center', width: 135.91 });

    // ARKA YÜZ - yeni sayfa
    doc.addPage({ size: [155.91, 241.42], margin: 10 });

    // QR üstte
    doc.image(qrBuffer, (155.91 - 80) / 2, 10, { width: 80 });

    // Uyarı metni
    const uyari = `Bu kartın tüm hakları ${ayarlar.kurumAdi || 'AKEKOS'}'e aittir. Personelin kurumdan ve/veya ekipten ayrılması durumunda kartın iadesi zorunludur. Kartın kaybolması ya da bulunması halinde ${ayarlar.telefon || '___'} nolu telefona bildiriniz.`;
    
    doc.fontSize(6.5).font(fontPath)
      .text(uyari, 10, 100, { width: 135.91, align: 'justify' });

    // T.C. Kimlik No, veriliş tarihi, seri no
    doc.moveTo(10, 185).lineTo(145.91, 185).stroke();
    doc.fontSize(6.5).font(fontPath)
      .text(`T.C.: ${k.tcKimlikNo || '___________'}`, 10, 190, { width: 135.91 })
      .text(`Veriliş: ${k.kartVerilisTarihi ? new Date(k.kartVerilisTarihi).toLocaleDateString('tr-TR') : '___'}   Seri: ${k.kartSeriNo}`, 10, 200, { width: 135.91 });

    doc.end();
  } catch (err) {
    console.error(err);
    res.redirect('/yonetim/kullanicilar');
  }
});

module.exports = router;