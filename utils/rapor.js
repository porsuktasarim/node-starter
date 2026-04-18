const Organization = require('../models/Organization');

// Organizasyon hiyerarşisinden dosya adı öneki oluştur
const dosyaOnekiOlustur = async (organizasyonId) => {
  if (!organizasyonId) return '';
  
  const hiyerarsi = [];
  let mevcut = await Organization.findById(organizasyonId);
  
  while (mevcut) {
    if (mevcut.dosyaAdindaKullan && mevcut.kisaKod) {
      hiyerarsi.unshift(mevcut.kisaKod);
    }
    if (mevcut.ust) {
      mevcut = await Organization.findById(mevcut.ust);
    } else {
      break;
    }
  }
  
  return hiyerarsi.join('');
};

module.exports.dosyaOnekiOlustur = dosyaOnekiOlustur;

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// PDF oluştur
const pdfOlustur = (res, baslik, kolonlar, satirlar) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${baslik}.pdf"`);
  doc.pipe(res);

  // Başlık
  doc.fontSize(16).font('Helvetica-Bold').text(baslik, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, { align: 'center' });
  doc.moveDown(1);

  // Tablo başlıkları
  const colWidth = (doc.page.width - 80) / kolonlar.length;
  let x = 40;
  const headerY = doc.y;

  doc.rect(40, headerY, doc.page.width - 80, 20).fill('#333333');
  kolonlar.forEach(kol => {
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
      .text(kol, x + 3, headerY + 5, { width: colWidth - 6, lineBreak: false });
    x += colWidth;
  });

  doc.moveDown(0.1);

  // Satırlar
  satirlar.forEach((satir, i) => {
    const rowY = doc.y + 5;
    if (i % 2 === 0) {
      doc.rect(40, rowY - 3, doc.page.width - 80, 18).fill('#f5f5f5');
    }
    x = 40;
    satir.forEach(hucre => {
      doc.fillColor('black').fontSize(8).font('Helvetica')
        .text(String(hucre || '—'), x + 3, rowY, { width: colWidth - 6, lineBreak: false });
      x += colWidth;
    });
    doc.moveDown(0.6);

    // Sayfa taşması kontrolü
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
    }
  });

  doc.end();
};

// Excel oluştur
const excelOlustur = async (res, baslik, kolonlar, satirlar) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(baslik);

  // Başlık satırı
  sheet.addRow(kolonlar);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF333333' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Veri satırları
  satirlar.forEach((satir, i) => {
    const row = sheet.addRow(satir.map(h => h || '—'));
    if (i % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
  });

  // Kolon genişlikleri
  sheet.columns.forEach(col => {
    col.width = 20;
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${baslik}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { pdfOlustur, excelOlustur, dosyaOnekiOlustur };