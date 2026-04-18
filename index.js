const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');

const authRoutes = require('./routes/auth');
const yonetimRoutes = require('./routes/yonetim');
const { router: qrRoutes } = require('./routes/qr');
const raporRoutes = require('./routes/rapor');

const app = express();
const PORT = process.env.PORT || 55154;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB bağlantısı
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27018/node-starter';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB bağlandı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Session
app.use(session({
  secret: 'gizli-anahtar-bunu-degistir',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27018/node-starter' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Rotalar
app.use('/', authRoutes);
app.use('/yonetim', yonetimRoutes);
app.use('/', qrRoutes);
app.use('/rapor', raporRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  if (!req.session.kullanici) return res.redirect('/giris');
  res.render('index', { title: 'Ana Sayfa', kullanici: req.session.kullanici });
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});