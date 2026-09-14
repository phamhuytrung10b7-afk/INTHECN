import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Employee, CardDesignConfig } from './types';

interface BatchPhotoUploaderProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  config: CardDesignConfig;
  onUpdateConfig: (config: CardDesignConfig) => void;
}

export const BatchPhotoUploader: React.FC<BatchPhotoUploaderProps> = ({
  employees,
  onUpdateEmployees,
  config,
  onUpdateConfig,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [matchSummary, setMatchSummary] = useState<string | null>(null);

  // Handle batch avatar upload
  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let matchCount = 0;

    // Create a map of filename (lowercase, without ext) -> object URL or data URL
    const fileMap = new Map<string, string>();
    const promises = fileList.map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string;
          const fullName = file.name.toLowerCase();
          const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
          fileMap.set(fullName, dataUrl);
          fileMap.set(baseName, dataUrl);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(() => {
      const updated = employees.map((emp) => {
        const targetFilename = (emp.tenFileAnh || '').toLowerCase();
        const targetId = (emp.maNV || '').toLowerCase();

        let matchedUrl = fileMap.get(targetFilename) || fileMap.get(targetId);
        if (!matchedUrl) {
          // Check if any file contains the employee id
          for (const [k, url] of fileMap.entries()) {
            if (k.includes(targetId)) {
              matchedUrl = url;
              break;
            }
          }
        }

        if (matchedUrl) {
          matchCount++;
          return { ...emp, avatarUrl: matchedUrl };
        }
        return emp;
      });

      onUpdateEmployees(updated);
      setMatchSummary(`Đã quét ${fileList.length} ảnh, khớp thành công ${matchCount}/${employees.length} nhân viên!`);
      setTimeout(() => setMatchSummary(null), 6000);
    });

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      onUpdateConfig({
        ...config,
        customLogoUrl: dataUrl,
        useDefaultLogo: false,
      });
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const matchedTotal = employees.filter((e) => !!e.avatarUrl).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-600" />
            Tải Ảnh Chân Dung & Logo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải hàng loạt ảnh chân dung nhân viên (khớp tự động theo Mã nhân viên hoặc Tên file)
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Đã khớp ảnh: <span className="text-red-600">{matchedTotal}</span> / {employees.length}
        </div>
      </div>

      {matchSummary && (
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{matchSummary}</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo batch uploader */}
        <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tải ảnh chân dung hàng loạt</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Chọn cùng lúc nhiều file ảnh (PNG, JPG). Hệ thống sẽ tự động đối chiếu tên file với cột{' '}
              <strong className="text-slate-700">Mã nhân viên</strong> (VD: <code>600000478.jpg</code>).
            </p>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handlePhotosUpload}
          />
          <button
            id="batch-upload-photos-btn"
            onClick={() => photoInputRef.current?.click()}
            className="w-full py-2 px-3 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Chọn thư mục hoặc nhiều file ảnh
          </button>
        </div>

        {/* Logo uploader */}
        <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Logo thương hiệu trên thẻ</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {config.useDefaultLogo ? 'Logo Sunhouse chuẩn' : 'Logo tùy chỉnh'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Mặc định hiển thị Logo vector chính xác của tập đoàn Sunhouse. Bạn cũng có thể tải lên logo công ty hoặc chi nhánh riêng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <button
              id="upload-custom-logo-btn"
              onClick={() => logoInputRef.current?.click()}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Tải Logo tùy chỉnh
            </button>
            {!config.useDefaultLogo && (
              <button
                onClick={() => onUpdateConfig({ ...config, useDefaultLogo: true, customLogoUrl: undefined })}
                className="py-2 px-3 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                title="Khôi phục logo Sunhouse gốc"
              >
                Khôi phục gốc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
