const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27018/node-starter';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('MongoDB bağlandı');

  const admin = new User({
    ad: 'Admin',
    soyad: 'Kullanıcı',
    kullaniciAdi: 'admin',
    sicilNo: '00001',
    unvan: 'Sistem Yöneticisi',
    gorevYeri: 'Merkez',
    email: 'admin@example.com',
    sifre: 'admin',
    rol: 'admin'
  });

  await admin.save();
  console.log('Admin kullanıcısı oluşturuldu');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});