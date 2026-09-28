1. Quản lý Hộ gia đình — /ho-gia-dinh
CRUD đầy đủ: thêm, sửa, xóa, xem danh sách/chi tiết hộ gia đình.
Các trường: MaHo, TenChuHo, SoDienThoai, MaPhong, DiaChi (mới), GioiTinh (mới).
Khi tạo hộ mới, tự động tạo kèm 2 đồng hồ (Điện + Nước).

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
Chatbot hỏi-đáp hỗ trợ cả kiến thức chung (mẹo tiết kiệm, thiết bị...) ngoài dữ liệu hộ.

6. Thống kê nâng cao — /thong-ke
- Xếp hạng tiêu thụ: GET /thong-ke/xep-hang?loai=Dien&thang=2026-03&sap_xep=giam_dan
- Lọc hóa đơn: GET /thong-ke/hoa-don-loc?nam=2026&thang=3

7. Danh sách quản trị
- GET /auth/users: danh sách tài khoản kèm tên, phòng, số điện thoại và địa chỉ (chỉ admin).
- Bộ lọc hóa đơn hỗ trợ thêm ma_ho và trang_thai=da_thu|chua_thu (chỉ admin).

8. SMS nhắc nợ quá hạn
- Hệ thống kiểm tra mỗi ngày lúc 09:00 theo giờ Việt Nam.
- Gửi tối đa một SMS cho mỗi phòng trong một tháng nếu phòng còn hóa đơn chưa thanh toán từ 3 tháng trở lên.
- Sao chép .env.example thành .env, đặt SMS_ENABLED=true và điền TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
- Số điện thoại Việt Nam lưu dạng 0xxxxxxxxx sẽ được chuyển sang +84 khi gửi. Chỉ gửi được khi tài khoản Twilio và số gửi đã hoạt động.

9. Dữ liệu mẫu năm 2026
- Chạy python seed_data.py để bổ sung các kỳ còn thiếu đến đủ 12 tháng. Script giữ nguyên hóa đơn và chỉ số đã có.

vào xem các API :http://localhost:8000/docs.
vào xem UI :http://localhost:8000.
khởi động server thì chạy: python -m uvicorn main:app --reload (trỏ vào thư mục rồi chạy).

## Lưu ý khi cập nhật cột mới (DiaChi, GioiTinh)

Nếu đã có file `database.db` cũ (trước khi thêm cột DiaChi, GioiTinh), bạn cần:

**Cách 1 (đơn giản):** Xóa file `database.db` rồi chạy lại seed:
```bash
del database.db
python seed_data.py
```

**Cách 2 (giữ dữ liệu):** Chạy migration thủ công:
```sql
ALTER TABLE HoGiaDinh ADD COLUMN DiaChi TEXT;
ALTER TABLE HoGiaDinh ADD COLUMN GioiTinh TEXT;
```
