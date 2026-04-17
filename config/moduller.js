const MODULLER = [
  {
    grup: 'yonetim',
    ad: 'Yönetim',
    izinler: [
      { kod: 'yonetim.kullanicilar.goruntule', ad: 'Kullanıcıları Görüntüle' },
      { kod: 'yonetim.kullanicilar.ekle', ad: 'Kullanıcı Ekle' },
      { kod: 'yonetim.kullanicilar.guncelle', ad: 'Kullanıcı Güncelle' },
      { kod: 'yonetim.kullanicilar.sil', ad: 'Kullanıcı Sil' },
      { kod: 'yonetim.gruplar.goruntule', ad: 'Grupları Görüntüle' },
      { kod: 'yonetim.gruplar.ekle', ad: 'Grup Ekle' },
      { kod: 'yonetim.gruplar.guncelle', ad: 'Grup Güncelle' },
      { kod: 'yonetim.organizasyon.goruntule', ad: 'Organizasyonu Görüntüle' },
      { kod: 'yonetim.organizasyon.guncelle', ad: 'Organizasyonu Güncelle' },
      { kod: 'yonetim.ayarlar.goruntule', ad: 'Ayarları Görüntüle' },
      { kod: 'yonetim.ayarlar.guncelle', ad: 'Ayarları Güncelle' },
    ]
  },
  {
    grup: 'envanter',
    ad: 'Envanter',
    izinler: [
      { kod: 'envanter.ekipmanlar.goruntule', ad: 'Ekipmanları Görüntüle' },
      { kod: 'envanter.ekipmanlar.ekle', ad: 'Ekipman Ekle' },
      { kod: 'envanter.ekipmanlar.guncelle', ad: 'Ekipman Güncelle' },
      { kod: 'envanter.ekipmanlar.sil', ad: 'Ekipman Sil' },
      { kod: 'envanter.ekipmanlar.qr', ad: 'QR Kod Oluştur' },
      { kod: 'envanter.kategoriler.goruntule', ad: 'Kategorileri Görüntüle' },
      { kod: 'envanter.kategoriler.guncelle', ad: 'Kategori Güncelle' },
      { kod: 'envanter.depolar.goruntule', ad: 'Depoları Görüntüle' },
      { kod: 'envanter.depolar.guncelle', ad: 'Depo Güncelle' },
      { kod: 'envanter.zimmet.goruntule', ad: 'Zimmeti Görüntüle' },
      { kod: 'envanter.zimmet.ekle', ad: 'Zimmet Ekle' },
      { kod: 'envanter.zimmet.guncelle', ad: 'Zimmet Güncelle' },
    ]
  },
  {
    grup: 'personel',
    ad: 'Personel',
    izinler: [
      { kod: 'personel.kartlar.goruntule', ad: 'Personel Kartlarını Görüntüle' },
      { kod: 'personel.kartlar.ekle', ad: 'Personel Kartı Ekle' },
      { kod: 'personel.kartlar.guncelle', ad: 'Personel Kartı Güncelle' },
      { kod: 'personel.kartlar.sil', ad: 'Personel Kartı Sil' },
      { kod: 'personel.takimlar.goruntule', ad: 'Takımları Görüntüle' },
      { kod: 'personel.takimlar.guncelle', ad: 'Takım Güncelle' },
      { kod: 'personel.sertifikalar.goruntule', ad: 'Sertifikaları Görüntüle' },
      { kod: 'personel.sertifikalar.guncelle', ad: 'Sertifika Güncelle' },
      { kod: 'personel.egitimler.goruntule', ad: 'Eğitimleri Görüntüle' },
      { kod: 'personel.egitimler.guncelle', ad: 'Eğitim Güncelle' },
    ]
  },
  {
    grup: 'sayim',
    ad: 'Sayım',
    izinler: [
      { kod: 'sayim.gorevler.goruntule', ad: 'Sayım Görevlerini Görüntüle' },
      { kod: 'sayim.gorevler.ekle', ad: 'Sayım Görevi Ekle' },
      { kod: 'sayim.gorevler.guncelle', ad: 'Sayım Görevi Güncelle' },
      { kod: 'sayim.kitler.goruntule', ad: 'Kit Listelerini Görüntüle' },
      { kod: 'sayim.kitler.guncelle', ad: 'Kit Listesi Güncelle' },
    ]
  },
  {
    grup: 'operasyon',
    ad: 'Operasyon',
    izinler: [
      { kod: 'operasyon.liste.goruntule', ad: 'Operasyonları Görüntüle' },
      { kod: 'operasyon.liste.ekle', ad: 'Operasyon Ekle' },
      { kod: 'operasyon.liste.guncelle', ad: 'Operasyon Güncelle' },
      { kod: 'operasyon.liste.sil', ad: 'Operasyon Sil' },
      { kod: 'operasyon.tahsisler.goruntule', ad: 'Tahsisleri Görüntüle' },
      { kod: 'operasyon.tahsisler.guncelle', ad: 'Tahsis Güncelle' },
    ]
  },
  {
    grup: 'raporlar',
    ad: 'Raporlar',
    izinler: [
      { kod: 'raporlar.dashboard.goruntule', ad: 'Dashboard Görüntüle' },
      { kod: 'raporlar.pdf.goruntule', ad: 'PDF Rapor Oluştur' },
      { kod: 'raporlar.excel.goruntule', ad: 'Excel Rapor Oluştur' },
    ]
  }
];

module.exports = MODULLER;