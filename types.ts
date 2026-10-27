export interface Employee {
  id: string; // unique internal id
  stt: number;
  maNV: string;
  hoTen: string;
  viTri: string;
  khuVuc: string; // "Kho", "Lắp ráp", "Cơ khí", ...
  tenFileAnh: string;
  avatarUrl?: string;
}

export type WorkAreaType = 'kho' | 'lap_rap' | 'co_khi' | 'qc' | 'other';

export const WORK_AREA_COLORS: Record<string, { label: string; color: string; bgBadge: string; textBadge: string }> = {
  kho: {
    label: 'Khu vực Kho',
    color: '#E87722', // Cam
    bgBadge: 'bg-orange-100',
    textBadge: 'text-orange-800',
  },
  lap_rap: {
    label: 'Khu vực Lắp ráp',
    color: '#0072CE', // Xanh nước biển
    bgBadge: 'bg-blue-100',
    textBadge: 'text-blue-800',
  },
  co_khi: {
    label: 'Khu vực Cơ khí',
    color: '#16A34A', // Xanh lá cây
    bgBadge: 'bg-emerald-100',
    textBadge: 'text-emerald-800',
  },
  qc: {
    label: 'Khu vực QC',
    color: '#EAB308', // Màu vàng
    bgBadge: 'bg-yellow-100',
    textBadge: 'text-yellow-800',
  },
};

export function getAreaColor(khuVuc?: string, defaultColor = '#E87722'): string {
  if (!khuVuc) return defaultColor;
  const lower = khuVuc.toLowerCase().trim();
  if (lower.includes('qc') || lower.includes('kcs') || lower.includes('chất lượng') || lower.includes('chat luong') || lower.includes('quality')) {
    return '#EAB308'; // Vàng cho QC
  }
  if (lower.includes('kho')) {
    return '#E87722'; // Cam
  }
  if (lower.includes('lắp ráp') || lower.includes('lap rap') || lower.includes('assembly')) {
    return '#0072CE'; // Xanh nước biển
  }
  if (lower.includes('cơ khí') || lower.includes('co khi') || lower.includes('cơ điện') || lower.includes('bảo trì') || lower.includes('dập')) {
    return '#16A34A'; // Xanh lá cây
  }
  return defaultColor;
}

export interface CardDesignConfig {
  headerTitle: string;
  primaryColor: string; // #E30613
  accentColor: string; // #E87722 fallback
  textColor: string;
  showPosition: boolean;
  showProbation: boolean; // Tùy chọn hiển thị tab/nhãn "THỬ VIỆC"
  qrType: 'id_only' | 'sunhouse_prefix' | 'custom_url';
  customUrlPrefix: string;
  customLogoUrl?: string;
  useDefaultLogo: boolean;
}

export interface PrintSettings {
  cardsPerPage: 8 | 10;
  showCropMarks: boolean;
  pageMarginMm: number;
  showProbationTab?: boolean;
}

