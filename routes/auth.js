const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Giriş sayfası
router.get('/giris', (req, res) => {
  res.render('auth/giris', { hata: null });
});

// Giriş işlemi
router.post('/giris', async (req, res) => {
  try {
    const { kullaniciAdi, sifre } = req.body;
    const kullanici = await User.findOne({ kullaniciAdi });

    if (!kullanici || !await kullanici.sifreKontrol(sifre)) {
      return res.render('auth/giris', { hata: 'Kullanıcı adı veya şifre hatalı.' });
    }

    if (!kullanici.aktif) {
      return res.render('auth/giris', { hata: 'Hesabınız aktif değil.' });
    }

    req.session.kullanici = {
      id: kullanici._id,
      ad: kullanici.ad,
      soyad: kullanici.soyad,
      kullaniciAdi: kullanici.kullaniciAdi,
      sicilNo: kullanici.sicilNo,
      unvan: kullanici.unvan,
      gorevYeri: kullanici.gorevYeri,
      email: kullanici.email,
      rol: kullanici.rol
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/giris', { hata: 'Bir hata oluştu.' });
  }
});

// Çıkış
router.get('/cikis', (req, res) => {
  req.session.destroy();
  res.redirect('/giris');
});

module.exports = router;