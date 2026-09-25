# Bản Đồ Mã Nguồn (Codebase Map) - Hệ Thống Quản Lý Điện Nước AI

File này đóng vai trò là "bản đồ" chi tiết giải thích cấu trúc và chức năng của từng file trong dự án. 
**Mục đích:** Giúp các AI Assistant khi được prompt có thể nhanh chóng định vị, hiểu rõ kiến trúc và biết chính xác cần tìm / sửa code ở file nào.

---

## 1. Thư mục gốc (Root Directory)
Chứa các file cấu hình, cơ sở dữ liệu và điểm khởi chạy của Backend (FastAPI).

- **`main.py`**: Điểm khởi chạy (Entry point) của ứng dụng FastAPI. Nơi cấu hình CORS, tích hợp Static files (frontend) và mount các routers (API endpoints).
- **`database.py`**: File cấu hình Database (SQLAlchemy). Khai báo kết nối SQLite và chứa định nghĩa các Bảng (Models) như: `HoGiaDinh`, `DongHo`, `ChiSoTieuThu`, `HoaDon`, `PhanTichAI`, `NguoiDung`.
- **`schemas.py`**: Chứa các schema của Pydantic dùng để xác thực (validate) dữ liệu đầu vào/đầu ra cho các API (VD: `ChiSoCreate`, `HoaDonResponse`, v.v.).
- **`seed_data.py`**: Script chạy tay (`python seed_data.py`) để tạo dữ liệu giả mẫu ban đầu (tài khoản, hộ gia đình, đồng hồ, lịch sử 3 tháng, hóa đơn).
- **`database.db`**: File cơ sở dữ liệu vật lý (SQLite) sinh ra trong quá trình chạy.
- **`.env`** / **`.env.example`**: Các file chứa biến môi trường cấu hình bảo mật. Đặc biệt chứa `GEMINI_API_KEY` phục vụ cho chức năng AI.
- **`start.ps1`**: Script PowerShell tự động build Frontend bằng Vite và khởi động Backend FastAPI cùng lúc.
- **`requirements.txt`**: Danh sách thư viện Python cần cài đặt cho Backend.

---

## 2. API Backend (`/routers`)
Phân chia các cụm API theo từng chức năng nghiệp vụ, được import vào `main.py`.

- **`routers/auth.py`**: Xử lý logic Đăng nhập (Login), Đăng xuất (Logout) và Xác thực (Authentication). Chứa các dependencies kiểm tra quyền như `require_login`, `require_admin`.
- **`routers/chi_so.py`**: Xử lý logic quan trọng nhất về tính toán: 
  - Ghi nhận chỉ số điện/nước mới.
  - Tự động tính toán tiền thành Hóa Đơn.
  - Trả về danh sách hóa đơn theo phòng và xử lý logic Thanh toán (`mark_thanh_toan`).
- **`routers/ai_insight.py`**: Trái tim của chức năng AI. Chứa logic giao tiếp với LLM (Google Gemini):
  - Sinh báo cáo nhận xét tiêu thụ & phát hiện rò rỉ.
  - Retrieval-Augmented Generation (RAG): Truy vấn dữ liệu lịch sử từ CSDL, ẩn danh hóa và đưa cho AI để trả lời các câu hỏi tự do của người dùng.
- **`routers/thong_ke.py`**: Cung cấp API gom nhóm, tính tổng số liệu (tổng thu, lượng tiêu thụ toàn khu) để vẽ biểu đồ cho màn hình Dashboard.
- **`routers/ho_gia_dinh.py`**: Các thao tác CRUD (Tạo, Đọc, Sửa, Xóa) cho thông tin Chủ hộ / Hộ gia đình.
- **`routers/dong_ho.py`**: Các thao tác CRUD quản lý Đồng hồ (điện/nước), định mức đơn giá.

---

## 3. Frontend Web App (`/frontend`)
Được viết bằng React + TypeScript + Vite + Tailwind CSS. Hoạt động như một Single Page Application (SPA), hướng tới trải nghiệm Mobile First (Giao diện Zalo Mini App).

### Cấu hình Frontend
- **`vite.config.ts`**: Cấu hình Vite bundler.
- **`package.json`**: Danh sách thư viện Node.js (react, lucide-react, v.v.).
- **`tsconfig.json`**: Cấu hình TypeScript.
- **`index.html`**: File HTML gốc.

### Mã nguồn Frontend (`/frontend/src`)
- **`main.tsx`**: Khởi tạo React App và render vào DOM.
- **`App.tsx`**: Component gốc bao bọc toàn bộ ứng dụng. Quản lý trạng thái Đăng nhập, điều hướng các Tab (Dashboard, Meter, Bill) và hiển thị thanh điều hướng dưới cùng.
- **`index.css`**: Nơi import Tailwind CSS và định nghĩa các style tùy chỉnh toàn cục (Global Styles).
- **`types/index.ts`**: Nơi định nghĩa các Type/Interface của TypeScript (`HoGiaDinh`, `HoaDon`, `PhanTichAI`...) khớp với backend.
- **`data/mockData.ts`**: File chứa dữ liệu mẫu cứng (Mock data) và các hàm helper tính toán phụ trợ. (Lưu ý: Ứng dụng đang dần chuyển sang lấy dữ liệu thật từ API thay vì file này).

### Các Components UI (`/frontend/src/components`)
- **`Header.tsx`**: Thanh Header trên cùng, hiển thị tên User, ảnh đại diện và nút Đăng xuất.
- **`BottomNav.tsx`**: Thanh menu điều hướng dưới đáy màn hình (Bottom Navigation Bar) cho phép chuyển qua lại giữa các Tabs.
- **`DashboardTab.tsx`**: Màn hình "Tổng quan". Hiển thị thống kê tổng tiền, số điện nước tiêu thụ toàn khu, biểu đồ và danh sách phòng chưa đóng tiền.
- **`MeterTab.tsx`**: Màn hình "Nhập số". Nơi Admin nhập chỉ số điện/nước mới cho các phòng. Tự động tính toán số tiêu thụ dựa vào số cũ.
- **`BillTab.tsx`**: Màn hình "Hóa đơn". Quan trọng nhất đối với User:
  - Xem chi tiết hóa đơn (chỉ số, thành tiền).
  - Chọn xem lại hóa đơn các tháng cũ từ Backend.
  - Thanh toán hóa đơn (Mô phỏng).
  - Tương tác với AI (Hỏi đáp & Phân tích tiết kiệm).
