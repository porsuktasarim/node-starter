const multer = require('multer');
const path = require('path');
const { dosyaOnekiOlustur } = require('../utils/rapor');

const fotografStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/fotograf');
  },
  filename: async (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);
      const organizasyonId = req.body.organizasyon || req.session.kullanici?.organizasyonId;
      const onek = await dosyaOnekiOlustur(organizasyonId);
      const sira = Date.now();
      cb(null, `${onek}_fotograf_${sira}${ext}`);
    } catch (err) {
      cb(err);
    }
  }
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/logo');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});

const belgeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/belge');
  },
  filename: async (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);
      const organizasyonId = req.body.organizasyon || req.session.kullanici?.organizasyonId;
      const onek = await dosyaOnekiOlustur(organizasyonId);
      const tur = req.body.belgeTuru || 'belge';
      const sira = Date.now();
      cb(null, `${onek}_${tur}_${sira}${ext}`);
    } catch (err) {
      cb(err);
    }
  }
});

const resimFiltre = (req, file, cb) => {
  const izinliTipler = /jpeg|jpg|png|gif|webp/;
  const mimetype = izinliTipler.test(file.mimetype);
  const extname = izinliTipler.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Sadece resim dosyasi yukleyebilirsiniz.'));
};

const fotografUpload = multer({ storage: fotografStorage, fileFilter: resimFiltre });
const logoUpload = multer({ storage: logoStorage, fileFilter: resimFiltre });
const belgeUpload = multer({ storage: belgeStorage });

module.exports = { fotografUpload, logoUpload, belgeUpload };