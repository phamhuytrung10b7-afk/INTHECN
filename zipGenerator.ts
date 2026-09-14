import JSZip from 'jszip';
import { Employee, CardDesignConfig } from './types';
import { generateCardDataUrl } from './cardCanvas';

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function generateCardsZip(
  employees: Employee[],
  config: CardDesignConfig,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('The_Nhan_Vien_Sunhouse_300DPI');
  const total = employees.length;

  for (let i = 0; i < total; i++) {
    const emp = employees[i];
    if (onProgress) {
      onProgress(i + 1, total);
    }

    const dataUrl = await generateCardDataUrl(emp, config);
    const base64Data = dataUrl.split(',')[1];
    const safeName = sanitizeFilename(emp.hoTen || 'Nhan_Vien');
    const filename = `${emp.maNV || 'NV'}_${safeName}.png`;

    folder?.file(filename, base64Data, { base64: true });
  }

  // Add README text file in zip
  folder?.file(
    'Thong_Tin_In_An.txt',
    `DỰ ÁN TẠO THẺ NHÂN VIÊN SUNHOUSE
- Số lượng thẻ: ${employees.length}
- Kích thước thẻ: 85mm x 55mm (Chuẩn CR80 / ID-1)
- Độ phân giải: 300 DPI (1004 x 650 pixels)
- Màu sắc chủ đạo: Đỏ Sunhouse (#E30613), Cam (#E87722)
- Xuất bản tự động bởi Trình Tạo Thẻ Nhân Viên Sunhouse`
  );

  return zip.generateAsync({ type: 'blob' });
}
