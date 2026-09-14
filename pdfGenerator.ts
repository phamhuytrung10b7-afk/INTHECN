import { jsPDF } from 'jspdf';
import { Employee, CardDesignConfig, PrintSettings } from './types';
import { generateCardDataUrl } from './cardCanvas';

export async function generatePrintPdf(
  employees: Employee[],
  config: CardDesignConfig,
  printSettings: PrintSettings,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const cardWidthMm = 85;
  const cardHeightMm = 55;
  const cols = 2;
  const rows = printSettings.cardsPerPage === 8 ? 4 : 5;
  const cardsPerPage = cols * rows;

  const a4Width = 210;
  const a4Height = 297;

  // Calculate balanced margins and spacing
  const gapX = (a4Width - cols * cardWidthMm) / (cols + 1);
  const gapY = (a4Height - rows * cardHeightMm) / (rows + 1);

  const totalEmployees = employees.length;
  let currentCardIndex = 0;

  for (let i = 0; i < totalEmployees; i++) {
    const pageCardIndex = i % cardsPerPage;

    if (i > 0 && pageCardIndex === 0) {
      doc.addPage();
    }

    const col = pageCardIndex % cols;
    const row = Math.floor(pageCardIndex / cols);

    const x = gapX + col * (cardWidthMm + gapX);
    const y = gapY + row * (cardHeightMm + gapY);

    if (onProgress) {
      onProgress(i + 1, totalEmployees);
    }

    // Render 300 DPI image data url
    const cardDataUrl = await generateCardDataUrl(employees[i], config);
    doc.addImage(cardDataUrl, 'PNG', x, y, cardWidthMm, cardHeightMm, undefined, 'FAST');

    // Draw crop/cutting marks if enabled
    if (printSettings.showCropMarks) {
      const markLength = 3; // 3mm
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);

      // Top-Left corner
      doc.line(x - markLength, y, x, y);
      doc.line(x, y - markLength, x, y);

      // Top-Right corner
      doc.line(x + cardWidthMm, y, x + cardWidthMm + markLength, y);
      doc.line(x + cardWidthMm, y - markLength, x + cardWidthMm, y);

      // Bottom-Left corner
      doc.line(x - markLength, y + cardHeightMm, x, y + cardHeightMm);
      doc.line(x, y + cardHeightMm, x, y + cardHeightMm + markLength);

      // Bottom-Right corner
      doc.line(x + cardWidthMm, y + cardHeightMm, x + cardWidthMm + markLength, y + cardHeightMm);
      doc.line(x + cardWidthMm, y + cardHeightMm, x + cardWidthMm, y + cardHeightMm + markLength);
    }

    currentCardIndex++;
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Trang ${p}/${totalPages} - Mẫu thẻ nhân viên Sunhouse (Chuẩn CR80 85x55mm) - In ở tỷ lệ 100% (Actual Size)`,
      a4Width / 2,
      a4Height - 5,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
