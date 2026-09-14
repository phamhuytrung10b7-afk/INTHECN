import React, { useState } from 'react';
import { X, Printer, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Employee, CardDesignConfig, PrintSettings, getAreaColor } from './types';
import { generatePrintPdf } from './pdfGenerator';

interface A4SheetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  config: CardDesignConfig;
  printSettings: PrintSettings;
  onUpdateConfig?: (newConfig: CardDesignConfig) => void;
}

export const A4SheetPreviewModal: React.FC<A4SheetPreviewModalProps> = ({
  isOpen,
  onClose,
  employees,
  config,
  printSettings,
  onUpdateConfig,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const cols = 2;
  const rows = printSettings.cardsPerPage === 8 ? 4 : 5;
  const cardsPerPage = cols * rows;
  const totalPages = Math.max(1, Math.ceil(employees.length / cardsPerPage));

  const startIdx = pageIndex * cardsPerPage;
  const currentCards = employees.slice(startIdx, startIdx + cardsPerPage);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePrintPdf(employees, config, printSettings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_Sach_The_Sunhouse_A4_${printSettings.cardsPerPage}the.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Lỗi xuất PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-600 text-white rounded-lg">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Mô phỏng Bố Cục Trang In A4 ({printSettings.cardsPerPage} thẻ / trang)
              </h3>
              <p className="text-[11px] text-slate-500">
                Tỷ lệ chuẩn A4 (210 x 297 mm) - Tích hợp vạch xén chữ thập để dùng dao rọc giấy hoặc máy xén
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateConfig && (
              <label
                title="Bật/Tắt hiển thị tab chữ Thử Việc trên thẻ khi in"
                className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                  config.showProbation
                    ? 'bg-red-50 border-red-300 text-red-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={config.showProbation}
                  onChange={(e) => onUpdateConfig({ ...config, showProbation: e.target.checked })}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  Tab THỬ VIỆC
                </span>
              </label>
            )}

            {totalPages > 1 && (
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  className="p-1 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-semibold text-slate-700">
                  Trang {pageIndex + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={pageIndex === totalPages - 1}
                  className="p-1 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Đang tạo...' : 'Tải File PDF In'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* A4 Sheet Visualizer */}
        <div className="flex-1 p-6 overflow-auto bg-slate-200/70 flex justify-center items-start">
          <div
            className="bg-white shadow-xl rounded-sm p-4 border border-slate-300 relative select-none flex flex-col justify-between"
            style={{
              width: '480px',
              height: '678px', // aspect ratio 210:297
            }}
          >
            {/* Grid of cards */}
            <div
              className={`grid grid-cols-2 gap-2 flex-1 ${
                rows === 4 ? 'grid-rows-4' : 'grid-rows-5'
              }`}
            >
              {Array.from({ length: cardsPerPage }).map((_, i) => {
                const emp = currentCards[i];
                if (!emp) {
                  return (
                    <div
                      key={`empty-${i}`}
                      className="border border-dashed border-slate-200 rounded-xs flex items-center justify-center bg-slate-50/50"
                    >
                      <span className="text-[9px] text-slate-300 italic">Vị trí trống</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={emp.id}
                    className="border border-slate-300 rounded-[3px] overflow-hidden flex flex-col bg-white relative shadow-2xs group"
                  >
                    {/* Header */}
                    <div className="bg-[#E30613] h-[34%] flex flex-col items-center justify-center text-white px-1">
                      <div className="w-8 h-2.5 bg-[#007A87] rounded-[2px] flex items-center justify-center text-[5px] font-bold">
                        <span className="bg-[#E30613] text-white px-0.5 rounded-full scale-75">SUNHOUSE</span>
                      </div>
                      <span className="text-[5.5px] font-bold uppercase tracking-tighter truncate w-full text-center mt-0.5">
                        {config.headerTitle}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 px-1.5 py-1 flex items-center justify-between relative bg-white">
                      <div className="w-[32%] h-full bg-slate-100 rounded-[2px] overflow-hidden border border-slate-200 shrink-0">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-slate-400">
                            {emp.maNV.slice(-3)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 pl-1.5 flex flex-col justify-center min-w-0">
                        <span className="text-[7.5px] font-bold text-slate-900 truncate leading-tight">
                          {emp.hoTen}
                        </span>
                        <span className="text-[6.5px] font-bold text-red-600 font-mono leading-tight">
                          ID: {emp.maNV}
                        </span>
                      </div>

                      {/* Right side: Probation Tab (if enabled) + QR Code */}
                      <div className="flex flex-col items-end justify-between h-full relative z-1 shrink-0 pl-1">
                        {config.showProbation ? (
                          <span className="bg-[#E30613] text-white text-[3.8px] font-bold px-1 py-0.5 rounded-[1px] leading-tight tracking-tighter whitespace-nowrap shadow-2xs">
                            THỬ VIỆC
                          </span>
                        ) : (
                          <div className="h-2"></div>
                        )}
                        <div className="w-3.5 h-3.5 bg-white border border-slate-300 rounded-[1px] flex items-center justify-center text-[3.5px] text-slate-900 font-mono font-bold">
                          QR
                        </div>
                      </div>

                      {/* Area colored shape at bottom right */}
                      <div
                        className="absolute right-0 bottom-0 h-2 w-10 rounded-tl-sm pointer-events-none"
                        style={{ backgroundColor: getAreaColor(emp.khuVuc, config.accentColor) }}
                      />
                    </div>

                    {/* Red bottom bar */}
                    <div className="h-1 bg-[#E30613] w-full mt-auto"></div>
                  </div>
                );
              })}
            </div>

            {/* A4 Sheet Footer Info */}
            <div className="pt-2 text-[8px] text-slate-400 text-center font-mono border-t border-slate-100 mt-2">
              Khổ A4 (210 x 297 mm) - Trang {pageIndex + 1}/{totalPages} - Đã xếp {currentCards.length} thẻ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
