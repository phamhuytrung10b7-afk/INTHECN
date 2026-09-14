import React, { useState } from 'react';
import { FileDown, Archive, Sliders, CheckCircle2, Printer, ShieldAlert } from 'lucide-react';
import { Employee, CardDesignConfig, PrintSettings } from './types';
import { generatePrintPdf } from './pdfGenerator';
import { generateCardsZip } from './zipGenerator';

interface ExportPanelProps {
  employees: Employee[];
  config: CardDesignConfig;
  onUpdateConfig: (config: CardDesignConfig) => void;
  printSettings: PrintSettings;
  onUpdatePrintSettings: (settings: PrintSettings) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  employees,
  config,
  onUpdateConfig,
  printSettings,
  onUpdatePrintSettings,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);

  // Handle PDF generation
  const handleExportPdf = async () => {
    if (employees.length === 0) return;
    setIsGeneratingPdf(true);
    setProgressText('Đang khởi tạo bản in PDF A4...');

    try {
      const blob = await generatePrintPdf(
        employees,
        config,
        printSettings,
        (current, total) => {
          setProgressText(`Đang xử lý thẻ in ${current}/${total}...`);
        }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_Sach_The_Sunhouse_In_A4_${printSettings.cardsPerPage}the_trang.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setProgressText('Đã tải xuống file PDF in ấn!');
      setTimeout(() => setProgressText(null), 4000);
    } catch (err) {
      console.error('Lỗi tạo PDF:', err);
      alert('Có lỗi xảy ra trong quá trình tạo PDF. Vui lòng kiểm tra lại ảnh nhân viên.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle ZIP generation
  const handleExportZip = async () => {
    if (employees.length === 0) return;
    setIsGeneratingZip(true);
    setProgressText('Đang nén các tệp ảnh 300 DPI...');

    try {
      const blob = await generateCardsZip(
        employees,
        config,
        (current, total) => {
          setProgressText(`Đang kết xuất ảnh thẻ ${current}/${total}...`);
        }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Trang_The_Nhan_Vien_Sunhouse_PNG_300DPI.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setProgressText('Đã tải xuống file nén ZIP!');
      setTimeout(() => setProgressText(null), 4000);
    } catch (err) {
      console.error('Lỗi tạo ZIP:', err);
      alert('Có lỗi xảy ra khi nén file ZIP.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-600" />
            Cấu hình & Xuất Bản In Ấn (A4 / ZIP)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động ghép trang A4 với vạch cắt chuẩn hoặc tải gói ảnh thẻ rời phục vụ xưởng in ấn
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200">
          Tổng số: {employees.length} thẻ
        </span>
      </div>

      {progressText && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-800 animate-in fade-in">
          <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
          <span className="font-semibold">{progressText}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Tiêu đề Header:</label>
          <input
            type="text"
            value={config.headerTitle}
            onChange={(e) => onUpdateConfig({ ...config, headerTitle: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Số thẻ trên 1 trang A4:</label>
          <select
            value={printSettings.cardsPerPage}
            onChange={(e) =>
              onUpdatePrintSettings({
                ...printSettings,
                cardsPerPage: Number(e.target.value) as 8 | 10,
              })
            }
            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value={8}>8 thẻ / trang (2 x 4) - Lề rộng, dễ cắt nhất</option>
            <option value={10}>10 thẻ / trang (2 x 5) - Tiết kiệm giấy in</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Định dạng mã QR:</label>
          <select
            value={config.qrType}
            onChange={(e) =>
              onUpdateConfig({
                ...config,
                qrType: e.target.value as any,
              })
            }
            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          >
            <option value="id_only">Chỉ chứa Mã nhân viên (VD: 600000478)</option>
            <option value="sunhouse_prefix">Tiền tố định danh (SUNHOUSE:600000478)</option>
            <option value="custom_url">Đường dẫn portal (URL tra cứu)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Tùy chọn hiển thị in ấn:</label>
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                id="toggle-probation-checkbox-export"
                type="checkbox"
                checked={config.showProbation}
                onChange={(e) => onUpdateConfig({ ...config, showProbation: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
              />
              <span className="text-slate-800 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold tracking-tight">
                  THỬ VIỆC
                </span>
                <span>Hiện tab chữ Thử Việc</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showPosition}
                onChange={(e) => onUpdateConfig({ ...config, showPosition: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-700">Hiện chức danh / vị trí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showCropMarks}
                onChange={(e) => onUpdatePrintSettings({ ...printSettings, showCropMarks: e.target.checked })}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-slate-700">Vạch xén góc cắt thẻ</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PDF A4 Button */}
        <div className="border border-red-200 bg-linear-to-b from-red-50/40 to-white rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1">
              <FileDown className="w-5 h-5" />
              <span>Xuất file PDF in ấn (Khổ A4)</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Tập hợp toàn bộ thẻ ({employees.length} thẻ) đã được canh trang chuẩn xác theo khổ A4 ({printSettings.cardsPerPage} thẻ/trang) với vạch xén chữ thập 4 góc. Sẵn sàng gửi xưởng in ấn offset hoặc in kỹ thuật số.
            </p>
          </div>
          <button
            id="export-pdf-a4-btn"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf || employees.length === 0}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang tạo file PDF in ấn...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Tải xuống File PDF in ấn ({Math.ceil(employees.length / printSettings.cardsPerPage)} trang A4)
              </>
            )}
          </button>
        </div>

        {/* ZIP PNG 300 DPI Button */}
        <div className="border border-slate-200 bg-linear-to-b from-slate-50/70 to-white rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
              <Archive className="w-5 h-5 text-slate-700" />
              <span>Tải xuống file ZIP chứa ảnh thẻ</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Đóng gói toàn bộ {employees.length} ảnh thẻ thành các file ảnh PNG rời rạc với độ nét siêu cao 300 DPI (1004 x 650 pixel). Thích hợp lưu trữ hồ sơ nhân sự hoặc in bằng máy in thẻ nhựa chuyên dụng (Zebra, Evolis).
            </p>
          </div>
          <button
            id="export-zip-btn"
            onClick={handleExportZip}
            disabled={isGeneratingZip || employees.length === 0}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingZip ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang nén các tệp ảnh...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Tải xuống file ZIP ({employees.length} ảnh PNG 300 DPI)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
