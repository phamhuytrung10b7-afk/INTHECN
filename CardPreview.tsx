import React, { useEffect, useRef, useState } from 'react';
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Employee, CardDesignConfig, getAreaColor } from './types';
import { renderCardToCanvas } from './cardCanvas';

interface CardPreviewProps {
  employee: Employee;
  config: CardDesignConfig;
  allEmployees: Employee[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onToggleProbation?: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  employee,
  config,
  allEmployees,
  currentIndex,
  onSelectIndex,
  onToggleProbation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    renderCardToCanvas(canvas, employee, config)
      .then(() => {
        if (isMounted) setIsRendering(false);
      })
      .catch((err) => {
        console.error('Error rendering card preview:', err);
        if (isMounted) setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employee, config]);

  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `The_${employee.maNV}_${employee.hoTen.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allEmployees.length - 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            Xem trước Thẻ nhân viên (Chuẩn CR80 - 85x55mm)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Độ phân giải in ấn 300 DPI (1004 x 650 px) - Đúng chuẩn nhận diện Sunhouse
          </p>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              id="prev-employee-btn"
              onClick={() => hasPrev && onSelectIndex(currentIndex - 1)}
              disabled={!hasPrev}
              title="Nhân viên trước"
              className="p-1.5 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 min-w-[65px] text-center">
              {currentIndex + 1} / {allEmployees.length}
            </span>
            <button
              id="next-employee-btn"
              onClick={() => hasNext && onSelectIndex(currentIndex + 1)}
              disabled={!hasNext}
              title="Nhân viên tiếp theo"
              className="p-1.5 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Thu nhỏ"
              className="p-1.5 rounded hover:bg-white text-slate-600 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              title="Kích thước vừa khung"
              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white rounded transition-colors"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}
              title="Phóng to"
              className="p-1.5 rounded hover:bg-white text-slate-600 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick toggle tab Thử Việc */}
          <label
            title="Bật/Tắt hiển thị tab chữ Thử Việc trên thẻ"
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
              config.showProbation
                ? 'bg-red-50 border-red-300 text-red-700 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <input
              id="preview-quick-probation-checkbox"
              type="checkbox"
              checked={config.showProbation}
              onChange={() => onToggleProbation && onToggleProbation()}
              className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              Tab <span className="font-bold">THỬ VIỆC</span>
            </span>
          </label>

          <button
            id="download-current-card-btn"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Tải ảnh (PNG)
          </button>
        </div>
      </div>

      {/* Card stage */}
      <div className="mt-4 relative bg-slate-100/70 border border-dashed border-slate-300 rounded-xl p-4 sm:p-8 flex items-center justify-center min-h-[340px] overflow-hidden">
        {isRendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              Đang render thẻ 300 DPI...
            </div>
          </div>
        )}

        <div
          className="relative transition-transform duration-150 ease-out origin-center shadow-xl rounded-[16px] overflow-hidden bg-white ring-1 ring-black/10"
          style={{
            width: `${Math.min(540, 540 * zoom)}px`,
            aspectRatio: '1004 / 650',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block object-contain select-none"
            style={{ imageRendering: 'auto' }}
          />
        </div>
      </div>

      {/* Card inspection tags */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Họ và tên</span>
          <span className="font-semibold text-slate-800 truncate block mt-0.5">{employee.hoTen}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mã nhân viên</span>
          <span className="font-bold text-red-600 font-mono block mt-0.5">{employee.maNV}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Khu vực làm việc</span>
          <span className="inline-flex items-center gap-1.5 font-bold mt-0.5 text-slate-800">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: getAreaColor(employee.khuVuc, config.accentColor),
              }}
            />
            {employee.khuVuc || 'Kho'}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Vị trí</span>
          <span className="font-medium text-slate-700 truncate block mt-0.5">{employee.viTri || 'Chưa cập nhật'}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Trạng thái ảnh</span>
          <span className="inline-flex items-center gap-1 font-medium mt-0.5 text-emerald-700">
            {employee.avatarUrl ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Ảnh chân dung
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Mẫu mặc định
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
