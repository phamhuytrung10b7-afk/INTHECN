import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Download, Plus, Trash2, Search, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Employee } from './types';
import { INITIAL_EMPLOYEES } from './sampleEmployees';

interface DataManagementProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  employees,
  onUpdateEmployees,
  selectedIndex,
  onSelectIndex,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Parse Excel or CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        if (!rawData || rawData.length === 0) {
          setUploadStatus('File không có dữ liệu');
          return;
        }

        // Map column names flexibly
        const parsed: Employee[] = rawData.map((row, idx) => {
          const findVal = (keys: string[]) => {
            for (const k of Object.keys(row)) {
              const cleanK = k.trim().toLowerCase();
              if (keys.some((cand) => cleanK === cand || cleanK.includes(cand))) {
                return String(row[k] ?? '').trim();
              }
            }
            return '';
          };

          const maNV = findVal(['mã nhân viên', 'ma nhan vien', 'manv', 'mã nv', 'id', 'code']) || `NV${String(idx + 1).padStart(4, '0')}`;
          const hoTen = findVal(['họ và tên', 'ho va ten', 'họ tên', 'ho ten', 'name', 'full name']) || 'Nhân viên mới';
          const viTri = findVal(['vị trí làm việc', 'vi tri', 'vị trí', 'chức danh', 'position', 'role']) || 'Nhân viên';
          const khuVuc = findVal(['khu vực làm việc', 'khu vuc lam viec', 'khu vực', 'khu vuc', 'bộ phận', 'bo phan', 'area', 'department']) || 'Kho';
          const tenFileAnh = findVal(['tên file ảnh', 'ten file anh', 'file ảnh', 'photo', 'avatar', 'image']) || `${maNV}.jpg`;

          return {
            id: `emp-${Date.now()}-${idx}`,
            stt: idx + 1,
            maNV,
            hoTen,
            viTri,
            khuVuc,
            tenFileAnh,
          };
        });

        onUpdateEmployees(parsed);
        onSelectIndex(0);
        setUploadStatus(`Đã nạp thành công ${parsed.length} nhân viên từ file ${file.name}`);
        setTimeout(() => setUploadStatus(null), 5000);
      } catch (err: any) {
        console.error('Error parsing file:', err);
        setUploadStatus(`Lỗi đọc file: ${err.message || 'Định dạng không hợp lệ'}`);
      }
    };

    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample CSV/Excel template
  const handleDownloadTemplate = () => {
    const wsData = [
      ['STT', 'Mã nhân viên', 'Họ và tên', 'Vị trí làm việc', 'Khu vực làm việc', 'Tên file ảnh'],
      [1, '600000478', 'Nguyễn Khánh Quy', 'Kỹ thuật viên quản lý kho', 'Kho', '600000478.jpg'],
      [2, '600000512', 'Trần Thị Mai', 'Kiểm soát chất lượng (QC)', 'QC', '600000512.jpg'],
      [3, '600000523', 'Lê Văn Hùng', 'Vận hành máy dập nhôm', 'Cơ khí', '600000523.jpg'],
      [4, '600000589', 'Phạm Hoàng Nam', 'Tổ trưởng tổ cơ điện', 'Cơ khí', '600000589.jpg'],
      [5, '600000601', 'Võ Thị Kim Cúc', 'Kỹ thuật viên đóng gói chuyền', 'Lắp ráp', '600000601.jpg'],
      [6, '600000745', 'Bùi Phương Linh', 'Thủ kho thành phẩm', 'Kho', '600000745.jpg'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Nhan_Vien');
    XLSX.writeFile(wb, 'Mau_Danh_Sach_Nhan_Vien_Sunhouse.xlsx');
  };

  const handleAddEmployee = () => {
    const nextStt = employees.length + 1;
    const nextCode = `600000${String(nextStt).padStart(3, '0')}`;
    const areas = ['Kho', 'Lắp ráp', 'Cơ khí', 'QC'];
    const assignedArea = areas[(nextStt - 1) % areas.length];

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      stt: nextStt,
      maNV: nextCode,
      hoTen: `Nhân viên ${nextStt}`,
      viTri: 'Công nhân sản xuất',
      khuVuc: assignedArea,
      tenFileAnh: `${nextCode}.jpg`,
    };
    onUpdateEmployees([...employees, newEmp]);
    onSelectIndex(employees.length);
  };

  const handleDeleteEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (employees.length <= 1) {
      setUploadStatus('Danh sách cần tối thiểu 1 nhân viên.');
      setTimeout(() => setUploadStatus(null), 4000);
      return;
    }
    const filtered = employees.filter((item) => item.id !== id);
    onUpdateEmployees(filtered);
    if (selectedIndex >= filtered.length) {
      onSelectIndex(Math.max(0, filtered.length - 1));
    }
  };

  const handleEditField = (field: keyof Employee, value: any) => {
    const updated = [...employees];
    const targetIdx = selectedIndex;
    if (targetIdx >= 0 && targetIdx < updated.length) {
      updated[targetIdx] = {
        ...updated[targetIdx],
        [field]: value,
      };
      onUpdateEmployees(updated);
    }
  };

  const selectedEmp = employees[selectedIndex] || employees[0];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.maNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.viTri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.khuVuc && emp.khuVuc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header & Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-red-600" />
            Danh sách Dữ liệu Nhân viên ({employees.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý dữ liệu hoặc tải lên file Excel/CSV chứa các cột STT, Mã nhân viên, Họ và tên
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            id="upload-excel-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Tải lên Excel/CSV
          </button>

          <button
            id="download-template-btn"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Tải file mẫu định dạng Excel"
          >
            <Download className="w-3.5 h-3.5" />
            File mẫu
          </button>

          <button
            onClick={() => {
              onUpdateEmployees(INITIAL_EMPLOYEES);
              onSelectIndex(0);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            title="Khôi phục danh sách mẫu Sunhouse ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Mẫu Sunhouse
          </button>

          <button
            id="add-employee-btn"
            onClick={handleAddEmployee}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm người
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Area Legend Bar */}
      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-700">Phân loại màu thẻ theo khu vực làm việc:</span>
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#E87722]"></span>
            Kho: Màu Cam
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#0072CE]"></span>
            Lắp ráp: Xanh nước biển
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            Cơ khí: Xanh lá cây
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
            QC: Màu vàng
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-3 relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo Tên, Mã nhân viên, Khu vực hoặc Vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10 backdrop-blur-xs">
              <th className="py-2.5 px-3 w-12 text-center">STT</th>
              <th className="py-2.5 px-3 w-28">Mã NV</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3 w-28">Khu vực</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Vị trí làm việc</th>
              <th className="py-2.5 px-3 w-20 text-center">Ảnh</th>
              <th className="py-2.5 px-3 w-16 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map((emp) => {
              const realIndex = employees.findIndex((e) => e.id === emp.id);
              const isSelected = realIndex === selectedIndex;
              const area = (emp.khuVuc || 'Kho').toLowerCase();
              let badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
              let dotColor = '#E87722';
              if (area.includes('qc') || area.includes('kcs') || area.includes('chất lượng') || area.includes('quality')) {
                badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                dotColor = '#EAB308';
              } else if (area.includes('lắp ráp') || area.includes('lap rap')) {
                badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                dotColor = '#0072CE';
              } else if (area.includes('cơ khí') || area.includes('co khi')) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                dotColor = '#16A34A';
              }

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectIndex(realIndex)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-red-50/80 font-medium text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-2 px-3 text-center text-slate-400 font-mono">{emp.stt}</td>
                  <td className="py-2 px-3 font-bold text-red-600 font-mono">{emp.maNV}</td>
                  <td className="py-2 px-3">{emp.hoTen}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                      {emp.khuVuc || 'Kho'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 hidden md:table-cell">{emp.viTri || '—'}</td>
                  <td className="py-2 px-3 text-center">
                    {emp.avatarUrl ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                        Có ảnh
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                        Mặc định
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={(e) => handleDeleteEmployee(emp.id, e)}
                      title="Xóa nhân viên này"
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  Không tìm thấy nhân viên phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form chỉnh sửa nhanh thông tin nhân viên đang chọn */}
      {selectedEmp && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Chỉnh sửa thông tin nhân sự:</span>
              <span className="text-red-600 font-mono font-bold">{selectedEmp.maNV}</span>
              <span className="text-slate-400 font-normal">({selectedEmp.hoTen})</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Tự động lưu Local Storage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mã nhân viên (Mã vạch QR):</label>
              <input
                type="text"
                value={selectedEmp.maNV}
                onChange={(e) => handleEditField('maNV', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Họ và tên:</label>
              <input
                type="text"
                value={selectedEmp.hoTen}
                onChange={(e) => handleEditField('hoTen', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Khu vực làm việc:</label>
              <select
                value={selectedEmp.khuVuc || 'Kho'}
                onChange={(e) => handleEditField('khuVuc', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="Kho">Kho (Màu Cam #E87722)</option>
                <option value="Lắp ráp">Lắp ráp (Màu Lam #0072CE)</option>
                <option value="Cơ khí">Cơ khí (Màu Lục #16A34A)</option>
                <option value="QC">QC (Màu Vàng #EAB308)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vị trí / Chức vụ:</label>
              <input
                type="text"
                value={selectedEmp.viTri || ''}
                onChange={(e) => handleEditField('viTri', e.target.value)}
                placeholder="VD: Quản lý kho, Kỹ thuật viên..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
