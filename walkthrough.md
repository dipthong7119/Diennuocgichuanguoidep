# Tổng kết và Hướng dẫn chạy thử nghiệm Hệ thống Quản lý Điện Nước Tích hợp AI

Hệ thống đã được cài đặt hoàn tất các thư viện cần thiết, nạp sẵn cơ sở dữ liệu mẫu và đang chạy server ngầm để bạn tự mở trình duyệt kiểm tra.

---

## 🌐 1. Cách chạy hệ thống

### Cách 1: Chạy trực tiếp toàn bộ hệ thống qua Backend `main.py` (Khuyên dùng)
Giao diện React hiện đại (trong `frontend/`) đã được build sẵn vào `frontend/dist`. Khi chạy `main.py`, FastAPI sẽ tự động nạp giao diện React Zalo Mini App:

```bash
# Chạy trực tiếp file main.py
py main.py
```
- **Giao diện React Zalo Mini App:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Tài liệu Swagger API:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Cách 2: Chạy chế độ phát triển Frontend riêng (Vite Dev Server)
Nếu muốn chỉnh sửa code React và xem thay đổi ngay lập tức (Hot Reload):

```bash
cd frontend
npm run dev
```
- **Giao diện Dev:** [http://localhost:5173](http://localhost:5173) (tự động proxy API sang `http://127.0.0.1:8000`)
- **Build lại bản mới cho `main.py` sau khi sửa code:**
  ```bash
  cd frontend
  npm run build
  ```

## 📋 3. Dữ liệu mẫu đã nạp sẵn (Seed Data)

- **5 Hộ gia đình:** `HO-001` đến `HO-005` (các phòng P101, P102, P201, P202, P301)
- **10 Đồng hồ:** 5 đồng hồ Điện (đơn giá 3.500đ) và 5 đồng hồ Nước (đơn giá 15.000đ)
- **30 Bản ghi chỉ số:** Tiêu thụ 3 tháng gần nhất (Tháng 6, 7, 8 năm 2026)
- **15 Hóa đơn:** Đầy đủ trạng thái đã thanh toán và chưa thanh toán để test công nợ
- **Đặc biệt:** Hộ `HO-002` có mức tiêu thụ tháng 8 tăng đột biến (>50%) để test chức năng **Cảnh báo nguy hiểm / Bất thường** của AI.

---

## 🤖 4. Chức năng AI

- Tại mục **"Phân tích AI"** (hoặc nút **🤖 AI** ở bảng Hóa đơn):
  - Hệ thống tự động truy xuất lịch sử tiêu thụ 3 tháng gần nhất của hộ.
  - **Ẩn danh hóa 100%:** Chỉ gửi mảng dữ liệu số lên AI, không gửi tên, SĐT hay mã phòng.
  - Nếu chưa điền API Key vào `.env`, hệ thống tự động trả về phân tích **Mock AI** đầy đủ nhận xét và mức độ cảnh báo (Bình thường / Cao / Nguy hiểm).
  - Nếu muốn dùng Gemini API thật: điền key vào file `.env` (`GEMINI_API_KEY=...`).

---

## 📑 5. Tài liệu Bài kiểm tra 1 (KT1)

File hoàn chỉnh theo đúng 10 tiêu chí của Rubric đã được tạo sẵn tại:
- [`KT1_Phan_tich_thiet_ke.md`](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/KT1_Phan_tich_thiet_ke.md)
