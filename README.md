1. Quản lý Hộ gia đình — /ho-gia-dinh
CRUD đầy đủ: thêm, sửa, xóa, xem danh sách/chi tiết hộ gia đình.

2. Quản lý Đồng hồ — /dong-ho
CRUD đồng hồ điện/nước. Hỗ trợ lọc đồng hồ theo từng hộ. Validation loại đồng hồ (Điện / Nước) và đơn giá phải > 0.

4. Nhập Chỉ số & Hóa đơn — /chi-so
Nhập chỉ số: Tự động từ chối nếu ChiSoMoi < ChiSoCu
Tính tiền tự động: TongTien = (ChiSoMoi - ChiSoCu) × DonGia
Tạo hóa đơn: Tự động tạo mới hoặc cộng dồn vào hóa đơn tháng
Thanh toán: Đánh dấu hóa đơn đã thanh toán
5.  Phân tích AI — /ai-insight
Truy vấn 3 tháng lịch sử tiêu thụ
Ẩn danh hóa hoàn toàn trước khi gọi AI (chỉ gửi mảng số)
Tích hợp Google Gemini hoặc OpenAI (đọc từ .env)
Tự động phân loại mức cảnh báo: Bình thường / Cao / Nguy hiểm
Lưu kết quả vào CSDL
