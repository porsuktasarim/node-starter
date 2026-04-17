const mongoose = require('mongoose');
const User = require('./models/User');
const Group = require('./models/Group');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27018/node-starter';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('MongoDB bağlandı');

  // Grupları oluştur
  const gruplar = [
    { kod: 'admin', ad: 'Admin' },
    { kod: 'admin01', ad: 'Admin 01' },
    { kod: 'admin02', ad: 'Admin 02' },
    { kod: 'admin03', ad: 'Admin 03' },
    { kod: 'admin04', ad: 'Admin 04' },
    { kod: 'admin05', ad: 'Admin 05' },
    { kod: 'admin06', ad: 'Admin 06' },
    { kod: 'admin07', ad: 'Admin 07' },
    { kod: 'admin08', ad: 'Admin 08' },
    { kod: 'admin09', ad: 'Admin 09' },
    { kod: 'admin10', ad: 'Admin 10' },
    { kod: 'user', ad: 'Kullanıcı' },
  ];

  await Group.deleteMany({});
  const olusturulanGruplar = await Group.insertMany(gruplar);
  console.log('Gruplar oluşturuldu');

  // Admin grubunu bul
  const adminGrubu = olusturulanGruplar.find(g => g.kod === 'admin');

  // Admin kullanıcısını güncelle veya oluştur
  await User.deleteMany({});
  const admin = new User({
    ad: 'Admin',
    soyad: 'Kullanıcı',
    kullaniciAdi: 'admin',
    sicilNo: '00001',
    unvan: 'Sistem Yöneticisi',
    gorevYeri: 'Merkez',
    email: 'admin@example.com',
    sifre: 'admin',
    rol: 'admin',
    grup: adminGrubu._id
  });

  await admin.save();
  console.log('Admin kullanıcısı oluşturuldu');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});