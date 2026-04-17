#!/bin/sh
echo "Veritabani kontrol ediliyor..."
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/akekos').then(async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Seed calistiriliyor...');
    const Group = require('./models/Group');
    const bcrypt = require('bcrypt');
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
      { kod: 'user', ad: 'Kullanici' },
    ];
    await Group.deleteMany({});
    const olusturulanGruplar = await Group.insertMany(gruplar);
    const adminGrubu = olusturulanGruplar.find(g => g.kod === 'admin');
    const admin = new User({
      ad: 'Admin',
      soyad: 'Kullanici',
      kullaniciAdi: 'admin',
      sicilNo: '00001',
      unvan: 'Sistem Yoneticisi',
      gorevYeri: 'Merkez',
      email: 'admin@example.com',
      sifre: 'admin',
      rol: 'admin',
      grup: adminGrubu._id
    });
    await admin.save();
    console.log('Seed tamamlandi.');
  } else {
    console.log('Veritabani dolu, seed atlandi.');
  }
  mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
" 
exec node index.js