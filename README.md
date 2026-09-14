# Trình Tạo Thẻ Nhân Viên Sunhouse (CR80 Standard)

Dự án Web App thiết kế và xuất in thẻ nhân viên chuẩn kích thước CR80 (85mm x 55mm) theo nhận diện thương hiệu Nhà Máy Sunhouse. Toàn bộ cấu trúc mã nguồn đã được gom phẳng **cùng cấp ở thư mục gốc (Root)**, không có thư mục `src` hay `python_app`, giúp bạn dễ dàng đẩy lên GitHub và triển khai trực tiếp lên Vercel mà không bị sót file.

---

## 📁 Cấu trúc thư mục phẳng (Flat Root Directory)

Tất cả các tệp mã nguồn đều nằm cùng cấp với `vite.config.ts` và `package.json`:

- `index.html`: Điểm khởi chạy của ứng dụng web
- `main.tsx`: Entry point React khởi tạo DOM
- `App.tsx`: Giao diện chính và luồng xử lý tổng thể
- `types.ts`: Định nghĩa kiểu dữ liệu (Employee, CardDesignConfig, PrintSettings)
- `sampleEmployees.ts`: Dữ liệu nhân viên mẫu Sunhouse và cấu hình mặc định
- `cardCanvas.ts`: Thuật toán render đồ họa thẻ nhân viên chuẩn 300 DPI, logo 25x13mm, tab Thử Việc & QR Code
- `storage.ts`: Cơ chế tự động lưu trữ và phục hồi từ Local Storage
- `pdfGenerator.ts`: Xuất file PDF khổ A4 sẵn sàng in ấn công nghiệp (8 hoặc 10 thẻ/trang)
- `zipGenerator.ts`: Đóng gói file nén ZIP toàn bộ ảnh thẻ chất lượng cao
- `CardPreview.tsx`: Khung xem trước thẻ trực quan theo tỷ lệ thực
- `DataManagement.tsx`: Bảng quản lý, tìm kiếm, nhập Excel/CSV và sửa thông tin nhân sự
- `BatchPhotoUploader.tsx`: Tải lên hàng loạt ảnh chân dung và logo doanh nghiệp
- `ExportPanel.tsx`: Bảng điều khiển tùy chọn xuất PDF A4 và tệp ZIP
- `A4SheetPreviewModal.tsx`: Hộp thoại duyệt trước bố cục trang in A4
- `PythonProjectModal.tsx`: Hộp thoại xem mã nguồn Python Streamlit dự phòng
- `vite.config.ts`: Cấu hình Vite & Tailwind CSS
- `package.json`: Danh mục thư viện và lệnh build

---

## 🚀 Hướng dẫn Đẩy lên GitHub & Deploy lên Vercel

### Bước 1: Đẩy code lên GitHub
1. Tạo một Repository mới trên GitHub (ví dụ: `sunhouse-id-card-generator`).
2. Mở terminal tại thư mục dự án và chạy các lệnh:
```bash
git init
git add .
git commit -m "Initial commit - flat project structure for Vercel"
git branch -M main
git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/TÊN_REPO.git
git push -u origin main
```
*(Nếu bạn tải file trực tiếp qua giao diện web GitHub: chỉ cần kéo thả toàn bộ các file ở thư mục này lên GitHub mà không lo bị sót folder).*

---

### Bước 2: Deploy lên Vercel
1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Bấm **"Add New..."** > chọn **"Project"**.
3. Chọn Repository GitHub vừa tạo và bấm **"Import"**.
4. Tại màn hình cấu hình:
   - **Framework Preset**: Vercel sẽ tự động nhận diện là **Vite**.
   - **Root Directory**: Để mặc định `./` (vì toàn bộ file đã nằm ở thư mục gốc).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Bấm nút **"Deploy"**. Vercel sẽ build và cung cấp cho bạn một đường link website chạy trực tiếp!
