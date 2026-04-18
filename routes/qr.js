const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const TIP_MODEL_MAP = {
  kullanici: 'User',
  organizasyon: 'Organization',
  ekipman: 'Equipment',
  operasyon: 'Operation',
  kit: 'Kit'
};

// QR kod oluştur
const qrOlustur = async (tip, hedefId, baseUrl) => {
  let qr = await QRCode.findOne({ tip, hedefId });
  if (!qr) {
    qr = await QRCode.create({
      kod: uuidv4().split('-')[0],
      tip,
      hedefId,
      tipModel: TIP_MODEL_MAP[tip]
    });
  }
  const url = `${baseUrl}/r/${qr.kod}`;
  const qrDataUrl = await qrcode.toDataURL(url, { width: 200 });
  return { url, qrDataUrl, kod: qr.kod };
};

// QR yönlendirme
router.get('/r/:kod', async (req, res) => {
  try {
    const qr = await QRCode.findOne({ kod: req.params.kod, aktif: true });
    if (!qr) return res.status(404).render('hata', {
      title: 'Bulunamadi',
      mesaj: 'QR kod gecersiz veya silinmis.',
      kullanici: req.session.kullanici || null
    });

    const yonlendirmeMap = {
      kullanici: `/yonetim/kullanicilar`,
      organizasyon: `/yonetim/organizasyon/${qr.hedefId}`,
      ekipman: `/envanter/ekipmanlar/${qr.hedefId}`,
      operasyon: `/operasyon/liste/${qr.hedefId}`,
      kit: `/sayim/kitler/${qr.hedefId}`
    };

    res.redirect(yonlendirmeMap[qr.tip] || '/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = { router, qrOlustur };