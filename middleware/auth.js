const Group = require('../models/Group');

// Giriş kontrolü
const girisGerekli = (req, res, next) => {
  if (!req.session.kullanici) {
    return res.redirect('/giris');
  }
  next();
};

// İzin kontrolü
const izinGerekli = (izinKodu) => {
  return async (req, res, next) => {
    const kullanici = req.session.kullanici;

    // Admin rolü her şeye erişebilir
    if (kullanici.rol === 'admin') return next();

    // Grup izinlerini kontrol et
    if (!kullanici.grupId) {
      return res.status(403).render('hata', { 
        title: 'Erişim Engellendi',
        mesaj: 'Bu sayfaya erişim yetkiniz yok.',
        kullanici 
      });
    }

    const grup = await Group.findById(kullanici.grupId);
    if (!grup || !grup.izinler.includes(izinKodu)) {
      return res.status(403).render('hata', { 
        title: 'Erişim Engellendi',
        mesaj: 'Bu sayfaya erişim yetkiniz yok.',
        kullanici 
      });
    }

    next();
  };
};

module.exports = { girisGerekli, izinGerekli };