const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

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

// Ana sayfa
app.get('/', (req, res) => {
  res.render('index', { title: 'Node Starter' });
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});