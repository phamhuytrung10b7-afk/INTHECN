import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Printer,
  FileSpreadsheet,
  Image as ImageIcon,
  Code2,
  Download,
  Settings2,
  CheckCircle2,
  ExternalLink,
  Layers,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Employee, CardDesignConfig, PrintSettings } from './types';
import { DEFAULT_DESIGN_CONFIG, INITIAL_EMPLOYEES } from './sampleEmployees';
import {
  getInitialEmployees,
  getInitialDesignConfig,
  getInitialPrintSettings,
  getInitialSelectedIndex,
  getInitialActiveTab,
  saveAllAppState,
  clearStorageToDefault,
} from './storage';
import { CardPreview } from './CardPreview';
import { DataManagement } from './DataManagement';
import { BatchPhotoUploader } from './BatchPhotoUploader';
import { ExportPanel } from './ExportPanel';
import { PythonProjectModal } from './PythonProjectModal';
import { A4SheetPreviewModal } from './A4SheetPreviewModal';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(getInitialEmployees);
  const [designConfig, setDesignConfig] = useState<CardDesignConfig>(getInitialDesignConfig);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(getInitialPrintSettings);
  const [selectedIndex, setSelectedIndex] = useState<number>(() =>
    getInitialSelectedIndex(employees.length > 0 ? employees.length - 1 : 0)
  );
  const [activeTab, setActiveTab] = useState<'data' | 'photos' | 'export'>(getInitialActiveTab);

  const [showPythonModal, setShowPythonModal] = useState<boolean>(false);
  const [showA4Modal, setShowA4Modal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveStatusMessage, setSaveStatusMessage] = useState<string>('Đã lưu cục bộ');

  // Tự động lưu mọi thay đổi vào LocalStorage
  useEffect(() => {
    const result = saveAllAppState({
      employees,
      selectedIndex,
      designConfig,
      printSettings,
      activeTab,
    });
    setLastSavedTime(result.lastSaved);
    setSaveStatusMessage(`Đã lưu ${result.lastSaved}`);
  }, [employees, selectedIndex, designConfig, printSettings, activeTab]);

  // Xử lý khôi phục dữ liệu gốc
  const handleResetToDefault = () => {
    clearStorageToDefault();
    setEmployees(INITIAL_EMPLOYEES);
    setDesignConfig(DEFAULT_DESIGN_CONFIG);
    setPrintSettings({
      cardsPerPage: 8,
      showCropMarks: true,
      pageMarginMm: 12,
    });
    setSelectedIndex(0);
    setActiveTab('data');
    setShowResetConfirmModal(false);
  };

  const selectedEmployee = employees[selectedIndex] || employees[0] || INITIAL_EMPLOYEES[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sunhouse mini brand badge */}
            <div className="w-10 h-10 bg-[#E30613] rounded-xl flex items-center justify-center text-white font-black shadow-sm shrink-0">
              <span className="text-[11px] font-bold tracking-tighter">SUN</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  Trình Tạo Thẻ Nhân Viên Sunhouse
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 tracking-wide">
                  CR80 • 85x55mm
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                Xuất file in ấn PDF A4 (300 DPI) &amp; Tệp nén ZIP ảnh thẻ chuẩn nhận diện nhà máy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto-save to LocalStorage indicator */}
            <div
              id="storage-status-indicator"
              title={`Mọi thay đổi thông tin nhân viên, cài đặt thẻ và in ấn đều được tự động lưu vào Local Storage trên trình duyệt này (${lastSavedTime || 'vừa xong'}).`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">Đã lưu Local Storage</span>
              {lastSavedTime && (
                <span className="text-[10px] text-emerald-600 font-mono">({lastSavedTime})</span>
              )}
            </div>

            {/* Button to reset to factory default data */}
            <button
              id="reset-storage-btn"
              onClick={() => setShowResetConfirmModal(true)}
              title="Đặt lại toàn bộ dữ liệu & thiết kế về mẫu gốc ban đầu của Sunhouse"
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-2 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đặt lại gốc</span>
            </button>

            <button
              id="view-a4-layout-btn"
              onClick={() => setShowA4Modal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Xem Bố Cục A4</span>
            </button>

            <button
              id="open-python-code-btn"
              onClick={() => setShowPythonModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-lg shadow-sm transition-all"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Mã Nguồn Python</span>
              <span className="hidden lg:inline text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-1 font-mono">
                Streamlit
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: LIVE CARD PREVIEW (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <CardPreview
              employee={selectedEmployee}
              config={designConfig}
              allEmployees={employees}
              currentIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              onToggleProbation={() =>
                setDesignConfig((prev) => ({ ...prev, showProbation: !prev.showProbation }))
              }
            />

            {/* Quick spec checklist */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs text-slate-600">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  Quy chuẩn thiết kế Sunhouse
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn in
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li className="flex items-center justify-between">
                  <span>Kích thước thành phẩm:</span>
                  <strong className="text-slate-700">85mm x 55mm (Tỷ lệ CR80)</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Logo thương hiệu:</span>
                  <strong className="text-red-700 font-bold">25mm x 13mm (Chuẩn in ấn)</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Tab Thử Việc:</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${designConfig.showProbation ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                    {designConfig.showProbation ? 'Đang bật hiển thị' : 'Đang tắt'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Độ phân giải render:</span>
                  <strong className="text-slate-700">300 DPI (1004 x 650 pixels)</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Header &amp; Footer:</span>
                  <strong className="text-red-600 font-mono">#E30613 (Đỏ Sunhouse)</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>Dải màu khu vực:</span>
                  <strong className="text-slate-700 font-mono">Kho (Cam) • Lắp ráp (Lam) • Cơ khí (Lục)</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: WORKSPACE TABS */}
          <div className="lg:col-span-7 space-y-4">
            {/* Segmented Navigation Tabs */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
              <button
                id="tab-data-btn"
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'data'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" />
                <span>1. Dữ liệu ({employees.length})</span>
              </button>

              <button
                id="tab-photos-btn"
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'photos'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>2. Tải Ảnh &amp; Logo</span>
              </button>

              <button
                id="tab-export-btn"
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'export'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-amber-600" />
                <span>3. Xuất Bản In &amp; ZIP</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'data' && (
              <DataManagement
                employees={employees}
                onUpdateEmployees={setEmployees}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
              />
            )}

            {activeTab === 'photos' && (
              <BatchPhotoUploader
                employees={employees}
                onUpdateEmployees={setEmployees}
                config={designConfig}
                onUpdateConfig={setDesignConfig}
              />
            )}

            {activeTab === 'export' && (
              <ExportPanel
                employees={employees}
                config={designConfig}
                onUpdateConfig={setDesignConfig}
                printSettings={printSettings}
                onUpdatePrintSettings={setPrintSettings}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <PythonProjectModal
        isOpen={showPythonModal}
        onClose={() => setShowPythonModal(false)}
      />

      <A4SheetPreviewModal
        isOpen={showA4Modal}
        onClose={() => setShowA4Modal(false)}
        employees={employees}
        config={designConfig}
        printSettings={printSettings}
        onUpdateConfig={setDesignConfig}
      />

      {/* Modal xác nhận đặt lại dữ liệu gốc */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Khôi phục dữ liệu gốc Sunhouse?</span>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-600 space-y-3">
              <p>
                Thao tác này sẽ xóa sạch dữ liệu đã lưu trong <strong>Local Storage</strong> của trình duyệt và đặt lại toàn bộ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                <li>Danh sách 6 nhân viên mẫu chuẩn của Nhà máy Sunhouse</li>
                <li>Cấu hình màu sắc, logo và kích thước ban đầu</li>
                <li>Ảnh nhân viên và logo tải lên tùy chỉnh (nếu có)</li>
              </ul>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-relaxed">
                💡 Nếu bạn đã nhập danh sách nhân viên riêng, hãy đảm bảo bạn đã xuất file Excel hoặc tải ảnh về máy trước khi làm mới.
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                id="confirm-reset-storage-btn"
                onClick={handleResetToDefault}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xác nhận đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
