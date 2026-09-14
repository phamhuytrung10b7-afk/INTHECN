import React, { useState } from 'react';
import JSZip from 'jszip';
import { Code2, Copy, Check, Download, Terminal, Cloud, ExternalLink, X } from 'lucide-react';

interface PythonProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_PY_CODE = `"""
ỨNG DỤNG STREAMLIT TỰ ĐỘNG TẠO THẺ ĐEO NHÂN VIÊN SUNHOUSE
Chuẩn kích thước: CR80 / ID-1 (85mm x 55mm - Độ phân giải in ấn 300 DPI)
"""

import io
import os
import zipfile
import pandas as pd
import streamlit as st
from PIL import Image
from card_generator import (
    CARD_WIDTH,
    CARD_HEIGHT,
    create_employee_card,
    build_a4_pdf_pages,
)

# Cấu hình trang Streamlit
st.set_page_config(
    page_title="Tạo Thẻ Nhân Viên Sunhouse",
    page_icon="🪪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tùy chỉnh CSS giao diện chuyên nghiệp
st.markdown("""
<style>
    .main-header {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #E30613;
        font-weight: 800;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        color: #4A5568;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .stDownloadButton button {
        background-color: #E30613 !important;
        color: white !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
        border: none !important;
        padding: 0.5rem 1.2rem !important;
    }
    .stDownloadButton button:hover {
        background-color: #BA050F !important;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- SIDEBAR: CẤU HÌNH & THIẾT KẾ -----------------
with st.sidebar:
    st.markdown("### ⚙️ Cấu hình Thẻ & In ấn")
    
    header_title = st.text_input(
        "Tiêu đề nhà máy / Chi nhánh:",
        value="NHÀ MÁY SUNHOUSE BÌNH DƯƠNG",
        help="Dòng chữ in hoa màu trắng trên thanh header đỏ"
    )
    
    show_position = st.checkbox("Hiển thị chức danh / Vị trí làm việc", value=False)
    
    cards_per_page = st.selectbox(
        "Số lượng thẻ trên 1 trang in A4:",
        options=[8, 10],
        index=0,
        help="8 thẻ/trang: Canh lề rộng và khoảng cách xén thoải mái nhất. 10 thẻ/trang: Tiết kiệm giấy in tối đa."
    )
    
    qr_mode = st.selectbox(
        "Định dạng nội dung mã QR Code:",
        options=[
            "Chỉ mã nhân viên (VD: 600000478)",
            "Tiền tố định danh (VD: SUNHOUSE:600000478)",
            "Đường dẫn tra cứu nội bộ (URL)"
        ],
        index=0
    )
    
    url_prefix = ""
    if qr_mode == "Đường dẫn tra cứu nội bộ (URL)":
        url_prefix = st.text_input("Tiền tố URL tra cứu:", value="https://portal.sunhouse.com.vn/emp/")

    st.markdown("---")
    st.markdown("""
    **📐 Thông số kỹ thuật:**
    - Kích thước thẻ: **85 x 55 mm** (Chuẩn CR80)
    - Độ phân giải: **300 DPI**
    - Kích thước ảnh: **1004 x 650 pixels**
    - Khổ in xuất bản: **PDF A4** (có vạch xén cắt)
    """)

# ----------------- PHẦN CHÍNH (MAIN VIEW) -----------------
st.markdown("<h1 class='main-header'>🏭 HỆ THỐNG TỰ ĐỘNG TẠO THẺ NHÂN VIÊN SUNHOUSE</h1>", unsafe_allow_html=True)
st.markdown("<p class='sub-header'>Chuẩn hóa thẻ đeo nhân viên theo nhận diện thương hiệu Sunhouse - Xuất file PDF A4 in ấn & Tệp nén ảnh 300 DPI sắc nét</p>", unsafe_allow_html=True)

# Tabs chức năng
tab_data, tab_preview, tab_export = st.tabs(["📁 1. Dữ liệu & Ảnh chụp", "👁️ 2. Xem trước bản in", "📦 3. Xuất file PDF & ZIP"])

# Khởi tạo session state nếu chưa có
if "employee_df" not in st.session_state:
    sample_data_path = os.path.join(os.path.dirname(__file__), "sample_nhan_vien.csv")
    if os.path.exists(sample_data_path):
        st.session_state.employee_df = pd.read_csv(sample_data_path)
    else:
        st.session_state.employee_df = pd.DataFrame([
            {"STT": 1, "Mã nhân viên": "600000478", "Họ và tên": "Nguyễn Khánh Quy", "Vị trí làm việc": "Kỹ thuật viên sản xuất", "Tên file ảnh": "600000478.jpg"},
            {"STT": 2, "Mã nhân viên": "600000512", "Họ và tên": "Trần Thị Mai", "Vị trí làm việc": "Kiểm soát chất lượng (QC)", "Tên file ảnh": "600000512.jpg"},
            {"STT": 3, "Mã nhân viên": "600000523", "Họ và tên": "Lê Văn Hùng", "Vị trí làm việc": "Vận hành máy dập", "Tên file ảnh": "600000523.jpg"},
        ])

if "uploaded_avatars" not in st.session_state:
    st.session_state.uploaded_avatars = {}

if "custom_logo" not in st.session_state:
    st.session_state.custom_logo = None

# TAB 1: DỮ LIỆU & ẢNH
with tab_data:
    col_left, col_right = st.columns([1.2, 1])
    with col_left:
        st.markdown("#### 1. Tải lên danh sách nhân viên (Excel hoặc CSV)")
        uploaded_file = st.file_uploader(
            "Chọn file Excel (.xlsx, .xls) hoặc CSV:",
            type=["xlsx", "xls", "csv"],
            help="File cần có các cột: STT, Mã nhân viên, Họ và tên, Vị trí làm việc, Tên file ảnh"
        )
        if uploaded_file is not None:
            try:
                if uploaded_file.name.endswith(".csv"):
                    df = pd.read_csv(uploaded_file)
                else:
                    df = pd.read_excel(uploaded_file)
                df.columns = df.columns.str.strip()
                st.session_state.employee_df = df
                st.success(f"✅ Đã nạp thành công {len(df)} nhân viên từ file: {uploaded_file.name}")
            except Exception as e:
                st.error(f"❌ Không thể đọc file: {e}")

    with col_right:
        st.markdown("#### 2. Tải lên Logo & Ảnh chân dung")
        logo_file = st.file_uploader("Tải Logo tùy chỉnh (để trống sẽ dùng Logo Sunhouse):", type=["png", "jpg", "jpeg"])
        if logo_file:
            st.session_state.custom_logo = Image.open(logo_file)
        
        avatar_files = st.file_uploader("Tải hàng loạt ảnh nhân viên:", type=["png", "jpg", "jpeg"], accept_multiple_files=True)
        if avatar_files:
            avatar_dict = {}
            for f in avatar_files:
                img = Image.open(f)
                avatar_dict[f.name.lower()] = img
                avatar_dict[os.path.splitext(f.name)[0].lower()] = img
            st.session_state.uploaded_avatars = avatar_dict
            st.success(f"✅ Đã tải lên {len(avatar_files)} ảnh.")

    st.dataframe(st.session_state.employee_df, use_container_width=True)

# TAB 2: XEM TRƯỚC
with tab_preview:
    df = st.session_state.employee_df
    if df is not None and not df.empty:
        col_ctrl, col_show = st.columns([1, 2])
        with col_ctrl:
            emp_index = st.selectbox(
                "Chọn nhân viên xem mẫu:",
                options=range(len(df)),
                format_func=lambda i: f"#{df.iloc[i].get('STT', i+1)} - {df.iloc[i].get('Họ và tên', 'N/A')} ({df.iloc[i].get('Mã nhân viên', 'N/A')})"
            )
            row = df.iloc[emp_index]
            eid = str(row.get("Mã nhân viên", "600000478")).strip()
            fn = str(row.get("Họ và tên", "Nguyễn Khánh Quy")).strip()
            pos = str(row.get("Vị trí làm việc", "")).strip()
            pname = str(row.get("Tên file ảnh", "")).strip().lower()
            
            av = st.session_state.uploaded_avatars.get(pname) or st.session_state.uploaded_avatars.get(eid.lower())
            qr_p = f"{url_prefix}{eid}" if qr_mode.startswith("Đường dẫn") else (f"SUNHOUSE:{eid}" if qr_mode.startswith("Tiền tố") else eid)
            
            st.write(f"- Họ tên: **{fn}**")
            st.write(f"- Mã ID: **{eid}**")
            st.write(f"- Trạng thái ảnh: {'✅ Có ảnh' if av else 'ℹ️ Dùng ảnh mặc định'}")
        
        with col_show:
            preview_card = create_employee_card(
                full_name=fn,
                employee_id=eid,
                position=pos,
                avatar_image=av,
                custom_logo=st.session_state.custom_logo,
                header_title=header_title,
                qr_data=qr_p,
                show_position=show_position,
            )
            st.image(preview_card, caption="Thẻ nhân viên Sunhouse (Tỷ lệ chuẩn 85x55mm - 300 DPI)", use_container_width=True)

# TAB 3: XUẤT FILE PDF & ZIP
with tab_export:
    df = st.session_state.employee_df
    if df is not None and not df.empty:
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("#### 📄 1. Xuất file PDF in ấn (Khổ A4)")
            if st.button("🚀 Bắt đầu tạo PDF A4"):
                cards_list = []
                for _, r in df.iterrows():
                    eid = str(r.get("Mã nhân viên", "")).strip()
                    fn = str(r.get("Họ và tên", "")).strip()
                    pos = str(r.get("Vị trí làm việc", "")).strip()
                    pname = str(r.get("Tên file ảnh", "")).strip().lower()
                    av = st.session_state.uploaded_avatars.get(pname) or st.session_state.uploaded_avatars.get(eid.lower())
                    qr_p = f"{url_prefix}{eid}" if qr_mode.startswith("Đường dẫn") else (f"SUNHOUSE:{eid}" if qr_mode.startswith("Tiền tố") else eid)
                    cards_list.append(create_employee_card(fn, eid, pos, av, st.session_state.custom_logo, header_title, qr_p, show_position))
                
                pdf_bytes = build_a4_pdf_pages(cards_list, cards_per_page=cards_per_page)
                st.download_button("📥 Tải xuống File PDF in A4", data=pdf_bytes, file_name="the_nhan_vien_sunhouse_A4.pdf", mime="application/pdf")

        with c2:
            st.markdown("#### 🗂️ 2. Tải xuống file ZIP chứa ảnh thẻ")
            if st.button("🚀 Bắt đầu đóng gói file ZIP"):
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
                    for _, r in df.iterrows():
                        eid = str(r.get("Mã nhân viên", "")).strip()
                        fn = str(r.get("Họ và tên", "")).strip()
                        pos = str(r.get("Vị trí làm việc", "")).strip()
                        pname = str(r.get("Tên file ảnh", "")).strip().lower()
                        av = st.session_state.uploaded_avatars.get(pname) or st.session_state.uploaded_avatars.get(eid.lower())
                        qr_p = f"{url_prefix}{eid}" if qr_mode.startswith("Đường dẫn") else (f"SUNHOUSE:{eid}" if qr_mode.startswith("Tiền tố") else eid)
                        card_img = create_employee_card(fn, eid, pos, av, st.session_state.custom_logo, header_title, qr_p, show_position)
                        
                        img_byte_arr = io.BytesIO()
                        card_img.save(img_byte_arr, format="PNG")
                        zf.writestr(f"{eid}_{fn.replace(' ', '_')}.png", img_byte_arr.getvalue())
                
                zip_buffer.seek(0)
                st.download_button("📥 Tải xuống File ZIP (PNG 300DPI)", data=zip_buffer, file_name="the_nhan_vien_sunhouse_PNG_300DPI.zip", mime="application/zip")
`;

const CARD_GENERATOR_PY_CODE = `"""
Module tạo thẻ đeo nhân viên Sunhouse chuẩn CR80 (85mm x 55mm - 300 DPI: 1004 x 650 px).
Tự động đổi màu dải nhận diện theo khu vực làm việc:
- Kho: Màu cam (#E87722)
- Lắp ráp: Màu xanh nước biển (#0072CE)
- Cơ khí: Màu xanh lá cây (#16A34A)
Mã QR code nằm gọn gàng trên thanh màu này với viền bảo vệ chuẩn quét.
"""

import os
import io
import math
import qrcode
from PIL import Image, ImageDraw, ImageFont

CARD_WIDTH = 1004
CARD_HEIGHT = 650

COLOR_PRIMARY_RED = (227, 6, 19)      # #E30613
COLOR_KHO_ORANGE = (232, 119, 34)      # #E87722
COLOR_ASSEMBLY_BLUE = (0, 114, 206)    # #0072CE
COLOR_MECHANICAL_GREEN = (22, 163, 74) # #16A34A
COLOR_TEAL_PAN = (0, 122, 135)         # #007A87
COLOR_WHITE = (255, 255, 255)
COLOR_TEXT_BLACK = (20, 20, 20)

def get_area_color(khu_vuc="Kho"):
    kv = str(khu_vuc or "Kho").lower().strip()
    if "kho" in kv:
        return COLOR_KHO_ORANGE
    elif "lắp ráp" in kv or "lap rap" in kv or "assembly" in kv:
        return COLOR_ASSEMBLY_BLUE
    elif "cơ khí" in kv or "co khi" in kv or "bảo trì" in kv or "dập" in kv:
        return COLOR_MECHANICAL_GREEN
    return COLOR_KHO_ORANGE

def get_font(size=32, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "C:\\\\Windows\\\\Fonts\\\\arialbd.ttf" if bold else "C:\\\\Windows\\\\Fonts\\\\arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_sunhouse_logo(width=220, height=80):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pan_w = 190
    pan_h = 64
    pan_x = (width - pan_w) // 2
    pan_y = 12
    draw.rounded_rectangle([pan_x, pan_y, pan_x + pan_w, pan_y + pan_h], radius=14, fill=COLOR_TEAL_PAN)
    
    oval_w = 172
    oval_h = 44
    oval_x = (width - oval_w) // 2
    oval_y = pan_y - 8
    draw.rounded_rectangle([oval_x - 3, oval_y - 3, oval_x + oval_w + 3, oval_y + oval_h + 3], radius=22, fill=COLOR_WHITE)
    draw.rounded_rectangle([oval_x, oval_y, oval_x + oval_w, oval_y + oval_h], radius=20, fill=COLOR_PRIMARY_RED)
    
    font_logo = get_font(size=22, bold=True)
    draw.text(((width - 140) // 2, oval_y + 10), "SUNHOUSE ®", font=font_logo, fill=COLOR_WHITE)
    return img

def generate_qr_code(data_str, size=150):
    qr = qrcode.QRCode(box_size=10, border=1)
    qr.add_data(data_str)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)

def create_employee_card(full_name, employee_id, position="", khu_vuc="Kho", avatar_image=None, custom_logo=None, header_title="NHÀ MÁY SUNHOUSE BÌNH DƯƠNG", qr_data=None, show_position=False):
    card = Image.new("RGBA", (CARD_WIDTH, CARD_HEIGHT), COLOR_WHITE)
    draw = ImageDraw.Draw(card)
    
    # Header đỏ
    header_h = 220
    draw.rectangle([0, 0, CARD_WIDTH, header_h], fill=COLOR_PRIMARY_RED)
    
    # Logo
    logo = custom_logo if custom_logo else create_sunhouse_logo(240, 80)
    card.paste(logo, ((CARD_WIDTH - 240) // 2, 22), logo)
    
    # Tiêu đề
    f_head = get_font(size=38, bold=True)
    bbox = draw.textbbox((0, 0), header_title, font=f_head)
    draw.text(((CARD_WIDTH - (bbox[2]-bbox[0])) // 2, 138), header_title, font=f_head, fill=COLOR_WHITE)
    
    # Footer đỏ
    draw.rectangle([0, CARD_HEIGHT - 48, CARD_WIDTH, CARD_HEIGHT], fill=COLOR_PRIMARY_RED)
    
    # Thanh màu khu vực làm việc (Kho: Cam, Lắp ráp: Xanh nước biển, Cơ khí: Xanh lá cây)
    area_color = get_area_color(khu_vuc)
    band_height = 78
    band_top_y = CARD_HEIGHT - 48 - band_height
    draw.polygon([(480, CARD_HEIGHT - 48), (580, band_top_y), (CARD_WIDTH, band_top_y), (CARD_WIDTH, CARD_HEIGHT - 48)], fill=area_color)
    
    # Ảnh chân dung
    px, py, pw, ph = 70, header_h + 30, 230, 290
    if avatar_image:
        av = avatar_image.convert("RGBA").resize((pw, ph), Image.Resampling.LANCZOS)
        card.paste(av, (px, py), av)
    else:
        draw.rectangle([px, py, px+pw, py+ph], fill=(240, 243, 246), outline=(200, 205, 210), width=2)
        draw.text((px + 80, py + 120), employee_id[-4:], font=get_font(28, True), fill=(100, 100, 100))
        
    draw.rectangle([px, py, px+pw, py+ph], outline=(200, 205, 210), width=2)
    
    # Thông tin
    ix, iy = px + pw + 45, py + 60
    draw.text((ix, iy), full_name, font=get_font(44, True), fill=COLOR_TEXT_BLACK)
    draw.text((ix, iy + 60), f"ID: {employee_id}", font=get_font(38, True), fill=COLOR_TEXT_BLACK)
    if show_position and position:
        draw.text((ix, iy + 115), f"Vị trí: {position}", font=get_font(26, False), fill=(80, 80, 80))
        
    # QR Code nằm ở phía trên thanh màu, trên nền trắng của thẻ
    qr_size = 140
    qx = CARD_WIDTH - qr_size - 28
    qy = band_top_y - qr_size - 8
    qr_img = generate_qr_code(qr_data or employee_id, qr_size)
    card.paste(qr_img, (qx, qy), qr_img)
    
    # Viền bao
    draw.rectangle([0, 0, CARD_WIDTH - 1, CARD_HEIGHT - 1], outline=(200, 200, 200), width=1)
    return card

def build_a4_pdf_pages(card_images, cards_per_page=8):
    A4_WIDTH, A4_HEIGHT = 2480, 3508
    cols = 2
    rows = 4 if cards_per_page == 8 else 5
    mx = (A4_WIDTH - cols * CARD_WIDTH) // (cols + 1)
    my = (A4_HEIGHT - rows * CARD_HEIGHT) // (rows + 1)
    
    pages = []
    total = len(card_images)
    total_pages = math.ceil(total / (cols * rows))
    
    for p_idx in range(total_pages):
        page = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), COLOR_WHITE)
        draw = ImageDraw.Draw(page)
        chunk = card_images[p_idx * cols * rows : (p_idx + 1) * cols * rows]
        
        for idx, img in enumerate(chunk):
            r = idx // cols
            c = idx % cols
            x = mx + c * (CARD_WIDTH + mx)
            y = my + r * (CARD_HEIGHT + my)
            page.paste(img.convert("RGB"), (x, y))
            # Crop marks 4 góc
            draw.line([(x-20, y), (x, y)], fill=(180, 180, 180), width=2)
            draw.line([(x, y-20), (x, y)], fill=(180, 180, 180), width=2)
        pages.append(page)
        
    buf = io.BytesIO()
    if pages:
        pages[0].save(buf, format="PDF", resolution=300.0, save_all=True, append_images=pages[1:])
    buf.seek(0)
    return buf
`;

const REQUIREMENTS_TXT = `streamlit>=1.30.0
pandas>=2.0.0
openpyxl>=3.1.0
pillow>=10.0.0
qrcode>=7.4.2
reportlab>=4.0.0
`;

const README_MD = `# Ứng Dụng Tạo Thẻ Đeo Nhân Viên Sunhouse (Python Streamlit)

### Cài đặt:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Khởi chạy:
\`\`\`bash
streamlit run app.py
\`\`\`

### Triển khai Streamlit Cloud:
1. Đẩy repo lên GitHub.
2. Đăng nhập share.streamlit.io và bấm "New app".
3. Chọn repo và file app.py -> Bấm Deploy.
`;

export const PythonProjectModal: React.FC<PythonProjectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'app.py' | 'card_generator.py' | 'requirements.txt' | 'README.md'>('app.py');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const getCode = () => {
    switch (activeTab) {
      case 'app.py':
        return APP_PY_CODE;
      case 'card_generator.py':
        return CARD_GENERATOR_PY_CODE;
      case 'requirements.txt':
        return REQUIREMENTS_TXT;
      case 'README.md':
        return README_MD;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      zip.file('app.py', APP_PY_CODE);
      zip.file('card_generator.py', CARD_GENERATOR_PY_CODE);
      zip.file('requirements.txt', REQUIREMENTS_TXT);
      zip.file('README.md', README_MD);
      zip.file(
        'sample_nhan_vien.csv',
        `STT,Mã nhân viên,Họ và tên,Vị trí làm việc,Khu vực làm việc,Tên file ảnh
1,600000478,Nguyễn Khánh Quy,Kỹ thuật viên quản lý kho,Kho,600000478.jpg
2,600000512,Trần Thị Mai,Kiểm soát chất lượng (QC),Lắp ráp,600000512.jpg
3,600000523,Lê Văn Hùng,Vận hành máy dập nhôm,Cơ khí,600000523.jpg
4,600000589,Phạm Hoàng Nam,Tổ trưởng tổ cơ điện,Cơ khí,600000589.jpg
5,600000601,Võ Thị Kim Cúc,Kỹ thuật viên đóng gói chuyền,Lắp ráp,600000601.jpg
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sunhouse_card_generator_streamlit_python.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Không thể tạo file ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Gói Mã Nguồn Python Streamlit Hoàn Chỉnh
              </h2>
              <p className="text-xs text-slate-500">
                Dành cho Kỹ sư triển khai cục bộ (Local) hoặc đưa lên Streamlit Community Cloud
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Launch Guide Bar */}
        <div className="bg-slate-900 text-slate-200 px-5 py-3 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-slate-300">
              pip install -r requirements.txt && streamlit run app.py
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-python-code-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép!' : 'Sao chép file này'}
            </button>

            <button
              id="download-python-zip-btn"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'Đang nén...' : 'Tải trọn bộ Project (.ZIP)'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 text-xs font-semibold">
          {(['app.py', 'card_generator.py', 'requirements.txt', 'README.md'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-red-600 text-red-700 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="flex-1 p-4 overflow-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 select-text">
          <pre className="whitespace-pre-wrap break-all">{getCode()}</pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-600" />
            <span>Tương thích 100% với Streamlit Community Cloud (Python 3.9 - 3.12)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
