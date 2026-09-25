# YÊU CẦU DỰ ÁN (PROJECT INSTRUCTIONS) - HỆ THỐNG QUẢN LÝ HÓA ĐƠN ĐIỆN NƯỚC TÍCH HỢP AI

Chào AI, bạn hãy đóng vai trò là một Senior Python Backend Developer. Tôi cần bạn viết mã nguồn Backend cho dự án "Hệ thống quản lý hóa đơn điện nước hộ gia đình có tích hợp AI". 

Frontend của tôi sẽ sử dụng HTML, CSS và JavaScript thuần. Do đó, bạn cần viết Backend bằng Python (có thể dùng Flask hoặc FastAPI) để cung cấp các API (RESTful API) hoặc render trực tiếp ra các endpoint cho Frontend gọi. Cơ sở dữ liệu sử dụng là SQL (Sử dụng SQLite cho dễ triển khai ban đầu).

## ⚠️ RÀNG BUỘC QUAN TRỌNG (KHÔNG SUY DIỄN)
Để tránh việc bạn suy diễn và tạo ra code không mong muốn, yêu cầu bạn TUÂN THỦ TUYỆT ĐỐI các quy tắc sau:
1. KHÔNG tự ý sáng tạo thêm các bảng cơ sở dữ liệu (Database Tables) ngoài 5 bảng được định nghĩa bên dưới.
2. KHÔNG tự ý thêm các trường (columns) mới vào CSDL.
3. Code cung cấp cần rõ ràng, có xử lý ngoại lệ (try/except) cho CSDL.
4. Phần tích hợp AI: TUÂN THỦ nguyên tắc ẩn danh hóa (Anonymize). Tuyệt đối không gửi thông tin cá nhân (Tên, SĐT, Mã phòng) của hộ gia đình vào prompt khi gọi API. Chỉ gửi mảng dữ liệu lịch sử số điện/nước.

## 1. THIẾT KẾ CƠ SỞ DỮ LIỆU (BẮT BUỘC SỬ DỤNG)
Bạn hãy viết script SQL hoặc mã ORM (SQLAlchemy) tạo chính xác 5 bảng sau:
- Bảng `HoGiaDinh`: MaHo (PK, String), TenChuHo (String), SoDienThoai (String), MaPhong (String)
- Bảng `DongHo`: MaDongHo (PK, String), MaHo (FK, String), Loai (String - 'Điện' hoặc 'Nước'), DonGia (Float)
- Bảng `ChiSoTieuThu`: MaChiSo (PK, String), MaDongHo (FK, String), ThangNam (Date), ChiSoCu (Int), ChiSoMoi (Int)
- Bảng `HoaDon`: MaHoaDon (PK, String), MaHo (FK, String), ThangNam (Date), TongTien (Float), TrangThaiThanhToan (Boolean)
- Bảng `PhanTichAI`: MaDanhGia (PK, String), MaHoaDon (FK, String), NoiDungNhanXet (Text), MucDoCanhBao (String)

## 2. CÁC TÍNH NĂNG BACKEND CẦN VIẾT
Vui lòng viết code Python cho các chức năng sau:
1. **Quản lý danh mục (CRUD):** Các API thêm, sửa, xóa, lấy danh sách `HoGiaDinh` và `DongHo`.
2. **Nhập chỉ số điện nước:** API nhận dữ liệu `ChiSoCu`, `ChiSoMoi`. Bắt buộc có logic kiểm tra (Validation): `ChiSoMoi` phải >= `ChiSoCu`.
3. **Tính toán hóa đơn:** Hàm tính `TongTien` = (`ChiSoMoi` - `ChiSoCu`) * `DonGia`. Lưu vào bảng `HoaDon`.
4. **Logic tích hợp AI (Quan trọng nhất):** 
   - Viết một hàm hoặc API endpoint tên `generate_ai_insight(ma_hoa_don, ma_ho)`.
   - Hàm này truy vấn DB lấy lịch sử tiêu thụ 3 tháng gần nhất của hộ gia đình đó từ bảng `ChiSoTieuThu`.
   - Chuẩn bị dữ liệu: Dữ liệu gửi đi CHỈ LÀ mảng số liệu (Ví dụ: Điện: [50, 55, 150]).
   - Dùng thư viện `requests` hoặc package AI chính thức (openai / google-generativeai) để gọi LLM API.
   - BẮT BUỘC sử dụng chính xác System Prompt sau: "System: Bạn là trợ lý phân tích hóa đơn điện nước. Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu."
   - User Prompt mẫu: "User: Lịch sử tiêu thụ 3 tháng qua: {mang_lich_su_dien_nuoc}. Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra rò rỉ nếu có, gợi ý cách tiết kiệm."
   - Lấy Text kết quả trả về từ API và lưu vào bảng `PhanTichAI` liên kết với `HoaDon` tương ứng.

## 3. YÊU CẦU ĐẦU RA (OUTPUT)
Bây giờ, hãy viết cho tôi:
1. File setup cơ sở dữ liệu (ORM hoặc script .sql).
2. Code khởi tạo Backend App (Flask/FastAPI).
3. Các Endpoint API tương ứng cho các tính năng trên.
Hãy phân chia từng file rõ ràng để tôi có thể copy dễ dàng và chạy ngay cùng với giao diện Frontend của tôi.