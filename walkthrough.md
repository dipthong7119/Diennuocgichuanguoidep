# Tổng kết và Hướng dẫn chạy thử nghiệm Hệ thống Quản lý Điện Nước Tích hợp AI

Hệ thống đã được cài đặt hoàn tất các thư viện cần thiết, nạp sẵn cơ sở dữ liệu mẫu và đang chạy server ngầm để bạn tự mở trình duyệt kiểm tra.

---

## 🌐 1. Địa chỉ truy cập & Kiểm thử

### Trên máy tính (PC):
- **Giao diện Web App:** [http://localhost:8000](http://localhost:8000)
- **Tài liệu API Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Trên điện thoại (Android / iOS):
- Đảm bảo điện thoại kết nối **chung mạng Wi-Fi** với PC.
- Mở trình duyệt Chrome/Safari trên điện thoại và truy cập:
  **`http://192.168.1.19:8000`**

---

## 🔑 2. Tài khoản Demo

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `admin123` | Toàn quyền xem Dashboard, CRUD Hộ, Đồng hồ, Nhập chỉ số, Thanh toán hóa đơn, Gọi AI |
| **Người dùng thường** | `user1` | `user123` | Xem thông tin, hóa đơn và phân tích AI |

---

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
