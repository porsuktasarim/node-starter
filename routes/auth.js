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
      rol: kullanici.rol,
      grupId: kullanici.grup
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

// Profil sayfası
router.get('/profil', (req, res) => {
  if (!req.session.kullanici) return res.redirect('/giris');
  res.render('auth/profil', {
    title: 'Profilim',
    kullanici: req.session.kullanici,
    hata: null,
    basari: null
  });
});

// Profil güncelle
router.post('/profil', async (req, res) => {
  try {
    const { ad, soyad, email, mevcutSifre, yeniSifre } = req.body;
    const kullanici = await User.findById(req.session.kullanici.id);

    if (!kullanici) return res.redirect('/giris');

    // Şifre değişikliği istendiyse kontrol et
    if (yeniSifre) {
      const dogru = await kullanici.sifreKontrol(mevcutSifre);
      if (!dogru) {
        return res.render('auth/profil', {
          title: 'Profilim',
          kullanici: req.session.kullanici,
          hata: 'Mevcut şifre hatalı.',
          basari: null
        });
      }
      kullanici.sifre = yeniSifre;
    }

    kullanici.ad = ad;
    kullanici.soyad = soyad;
    kullanici.email = email;
    await kullanici.save();

    // Session güncelle
    req.session.kullanici.ad = ad;
    req.session.kullanici.soyad = soyad;
    req.session.kullanici.email = email;

    res.render('auth/profil', {
      title: 'Profilim',
      kullanici: req.session.kullanici,
      hata: null,
      basari: 'Profil başarıyla güncellendi.'
    });
  } catch (err) {
    console.error(err);
    res.render('auth/profil', {
      title: 'Profilim',
      kullanici: req.session.kullanici,
      hata: 'Bir hata oluştu.',
      basari: null
    });
  }
});

module.exports = router;