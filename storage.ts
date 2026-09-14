import { Employee, CardDesignConfig, PrintSettings } from './types';
import { DEFAULT_DESIGN_CONFIG, INITIAL_EMPLOYEES } from './sampleEmployees';

const STORAGE_KEYS = {
  EMPLOYEES: 'sunhouse_cards_employees_v1',
  SELECTED_INDEX: 'sunhouse_cards_selected_index_v1',
  DESIGN_CONFIG: 'sunhouse_cards_design_config_v1',
  PRINT_SETTINGS: 'sunhouse_cards_print_settings_v1',
  ACTIVE_TAB: 'sunhouse_cards_active_tab_v1',
  LAST_SAVED: 'sunhouse_cards_last_saved_v1',
};

/**
 * An toàn lưu giá trị vào localStorage kèm xử lý lỗi dung lượng (QuotaExceededError)
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error: any) {
    console.warn(`[LocalStorage] Không thể lưu ${key}:`, error);
    // Nếu vượt dung lượng (thường do ảnh base64 quá lớn trong employees)
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      // Cố gắng dọn dẹp hoặc chỉ lưu thông tin văn bản
      if (key === STORAGE_KEYS.EMPLOYEES && Array.isArray(value)) {
        try {
          const stripped = (value as Employee[]).map((emp) => {
            // Giữ lại nếu là URL ngắn, bỏ bớt data:image rất nặng (>500KB) để bảo toàn dữ liệu nhân viên
            if (emp.avatarUrl && emp.avatarUrl.length > 200000) {
              return { ...emp, avatarUrl: undefined };
            }
            return emp;
          });
          localStorage.setItem(key, JSON.stringify(stripped));
          return true;
        } catch (e) {
          console.error('[LocalStorage] Lưu thất bại sau khi rút gọn ảnh:', e);
        }
      }
    }
    return false;
  }
}

/**
 * Đọc giá trị an toàn từ localStorage
 */
export function getLocalStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`[LocalStorage] Lỗi đọc dữ liệu ${key}:`, error);
    return fallback;
  }
}

/**
 * Khởi tạo dữ liệu Nhân viên từ LocalStorage hoặc dữ liệu mẫu mặc định
 */
export function getInitialEmployees(): Employee[] {
  const stored = getLocalStorageItem<Employee[] | null>(STORAGE_KEYS.EMPLOYEES, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  return INITIAL_EMPLOYEES;
}

/**
 * Khởi tạo cấu hình thiết kế từ LocalStorage hoặc mặc định
 */
export function getInitialDesignConfig(): CardDesignConfig {
  const stored = getLocalStorageItem<CardDesignConfig | null>(STORAGE_KEYS.DESIGN_CONFIG, null);
  if (stored && typeof stored === 'object') {
    return {
      ...DEFAULT_DESIGN_CONFIG,
      ...stored,
    };
  }
  return DEFAULT_DESIGN_CONFIG;
}

/**
 * Khởi tạo cài đặt in ấn từ LocalStorage hoặc mặc định
 */
export function getInitialPrintSettings(): PrintSettings {
  const stored = getLocalStorageItem<PrintSettings | null>(STORAGE_KEYS.PRINT_SETTINGS, null);
  if (stored && typeof stored === 'object') {
    return {
      cardsPerPage: stored.cardsPerPage === 10 ? 10 : 8,
      showCropMarks: stored.showCropMarks !== false,
      pageMarginMm: typeof stored.pageMarginMm === 'number' ? stored.pageMarginMm : 12,
      showProbationTab: stored.showProbationTab,
    };
  }
  return {
    cardsPerPage: 8,
    showCropMarks: true,
    pageMarginMm: 12,
  };
}

/**
 * Khởi tạo vị trí nhân viên đang chọn
 */
export function getInitialSelectedIndex(maxIndex: number): number {
  const stored = getLocalStorageItem<number | null>(STORAGE_KEYS.SELECTED_INDEX, null);
  if (typeof stored === 'number' && stored >= 0 && stored <= maxIndex) {
    return stored;
  }
  return 0;
}

/**
 * Khởi tạo Tab đang mở
 */
export function getInitialActiveTab(): 'data' | 'photos' | 'export' {
  const stored = getLocalStorageItem<string | null>(STORAGE_KEYS.ACTIVE_TAB, null);
  if (stored === 'data' || stored === 'photos' || stored === 'export') {
    return stored;
  }
  return 'data';
}

/**
 * Lưu toàn bộ trạng thái vào LocalStorage
 */
export function saveAllAppState({
  employees,
  selectedIndex,
  designConfig,
  printSettings,
  activeTab,
}: {
  employees: Employee[];
  selectedIndex: number;
  designConfig: CardDesignConfig;
  printSettings: PrintSettings;
  activeTab: 'data' | 'photos' | 'export';
}): { success: boolean; lastSaved: string } {
  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  setLocalStorageItem(STORAGE_KEYS.EMPLOYEES, employees);
  setLocalStorageItem(STORAGE_KEYS.SELECTED_INDEX, selectedIndex);
  setLocalStorageItem(STORAGE_KEYS.DESIGN_CONFIG, designConfig);
  setLocalStorageItem(STORAGE_KEYS.PRINT_SETTINGS, printSettings);
  setLocalStorageItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  setLocalStorageItem(STORAGE_KEYS.LAST_SAVED, timeString);

  return { success: true, lastSaved: timeString };
}

/**
 * Đặt lại dữ liệu về mặc định ban đầu và dọn dẹp LocalStorage
 */
export function clearStorageToDefault(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.error('Lỗi dọn dẹp localStorage:', e);
  }
}
