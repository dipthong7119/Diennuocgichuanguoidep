# Tổng kết và Hướng dẫn chạy thử nghiệm Hệ thống Quản lý Điện Nước Tích hợp AI

Hệ thống đã được cài đặt hoàn tất các thư viện cần thiết, nạp sẵn cơ sở dữ liệu mẫu và đang chạy server ngầm để bạn tự mở trình duyệt kiểm tra.

---

## 🌐 1. Cách chạy hệ thống

### Cách 1: Script 1 lệnh `start.ps1` (Đơn giản nhất)
Script tự động build frontend, copy ra `static/` và khởi động backend:
```powershell
.\start.ps1
```
- **Giao diện:** [http://localhost:8000](http://localhost:8000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Cách 2: Chạy trực tiếp `main.py` (khi đã có bản build)
```bash
py main.py
```
- **Giao diện React:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Tài liệu Swagger API:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Cách 3: Chạy chế độ phát triển Frontend riêng (Vite Dev Server)
Nếu bạn muốn chỉnh sửa code React và xem thay đổi ngay lập tức (Hot Reload):

```bash
# Terminal 1: Backend
py main.py

# Terminal 2: Frontend Dev
cd frontend
npm run dev
```
- **Giao diện Dev:** [http://localhost:5173](http://localhost:5173) (tự động proxy API sang `http://127.0.0.1:8000`)
- **Build lại bản mới:**
  ```bash
  cd frontend
  npm run build
  ```

---

## 🔑 2. Tài khoản Demo & Hệ thống phân quyền

### 2.1. Tài khoản có sẵn

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `admin123` | Toàn quyền: xem Dashboard tổng hợp tất cả phòng, CRUD Hộ gia đình, CRUD Đồng hồ, Nhập chỉ số, Thanh toán hóa đơn, Gọi AI phân tích |
| **Người dùng thường** | `user1` | `user123` | Hạn chế: chỉ xem thông tin phòng mình, xem hóa đơn, xem phân tích AI |

### 2.2. Cách hoạt động hệ thống xác thực

Hệ thống sử dụng **Session-based Token Authentication** (xác thực bằng token phiên):

```
Bước 1: [Người dùng] → POST /auth/login {username, password}
Bước 2: [Server] kiểm tra tên + hash SHA256 mật khẩu trong bảng NguoiDung
Bước 3: [Server] tạo token ngẫu nhiên "session-{uuid}" → lưu vào bộ nhớ server
Bước 4: [Server] → trả về {token, username, role}
Bước 5: [Frontend] lưu token vào localStorage
Bước 6: Mỗi request API tiếp theo → gửi Header: Authorization: Bearer <token>
Bước 7: [Server] kiểm tra token → xác định user + role → cho phép/từ chối
```

### 2.3. Phân quyền Admin vs User

| Hành động | Admin | User |
|---|---|---|
| Xem Dashboard tổng hợp (tất cả phòng) | ✅ | ❌ (chỉ phòng mình) |
| Thêm/Sửa/Xóa hộ gia đình | ✅ | ❌ |
| Thêm/Sửa/Xóa đồng hồ | ✅ | ❌ |
| Nhập chỉ số điện/nước | ✅ | ❌ |
| Đánh dấu thanh toán hóa đơn | ✅ | ❌ |
| Gọi AI phân tích | ✅ | ✅ (chỉ phòng mình) |
| Xem hóa đơn | ✅ (tất cả) | ✅ (chỉ phòng mình) |

### 2.4. Bảng NguoiDung trong CSDL

```python
class NguoiDung(Base):
    __tablename__ = "NguoiDung"
    Username      = Column(String, primary_key=True)
    PasswordHash  = Column(String, nullable=False)   # SHA256 hash
    Role          = Column(String, default="user")    # "admin" hoặc "user"
```

### 2.5. API xác thực

| Endpoint | Method | Chức năng |
|---|---|---|
| `/auth/login` | POST | Đăng nhập → nhận token |
| `/auth/logout` | POST | Đăng xuất → xóa session |
| `/auth/me` | GET | Kiểm tra phiên hiện tại → trả username + role |

---

## 📋 3. Dữ liệu mẫu đã nạp sẵn (Seed Data)

- **5 Hộ gia đình:** `HO-001` đến `HO-005` (các phòng P101, P102, P201, P202, P301)
- **10 Đồng hồ:** 5 đồng hồ Điện (đơn giá 3.000đ/kWh) và 5 đồng hồ Nước (đơn giá 15.000đ/m³)
- **30 Bản ghi chỉ số:** Tiêu thụ 3 tháng gần nhất (T1, T2, T3/2026)
- **5 Hóa đơn kỳ hiện tại:** Đầy đủ trạng thái đã/chưa thanh toán
- **5 Phân tích AI:** Mỗi hóa đơn kèm AI insight + gợi ý tiết kiệm
- **2 Tài khoản:** admin (toàn quyền) và user1 (hạn chế)
- **Đặc biệt:** Hộ `HO-002` (P102) có nước tháng 3 tăng 150% → **AI cảnh báo Nguy hiểm**

---

## 🤖 4. Chức năng AI

- **Dashboard:** AI Banner hiển thị cảnh báo bất thường (Đỏ/Vàng/Xanh) cho tất cả phòng
- **Tab Hóa đơn:** AI Insight panel chi tiết + 3 gợi ý tiết kiệm cho từng phòng
- **Tab Nhập số:** Nút "Lưu & Kích hoạt AI phân tích" → tự động phân tích sau khi lưu chỉ số
- **Ẩn danh hóa 100%:** Chỉ gửi mảng số liệu `[120, 115, 125]` lên AI, KHÔNG gửi tên/SĐT/mã phòng
- **Mock AI:** Nếu chưa điền API Key → hệ thống trả phân tích Mock đầy đủ, không crash
- **AI thật:** Điền `GEMINI_API_KEY=...` vào file `.env` để dùng Google Gemini

---

## 💻 5. Giao diện Responsive

Hệ thống hỗ trợ cả **Mobile** lẫn **Desktop/Laptop**:

### Mobile (< 768px):
- Header gradient xanh với thông tin phòng
- Bottom Navigation 3 tab (Tổng quan / Nhập số / Hóa đơn)
- Layout column dọc, cards xếp chồng

### Desktop/Laptop (≥ 768px):
- **Sidebar trái:** Navigation với brand logo, 3 menu item, chỉ báo active
- **Header ngang:** Greeting + Notification bell + Menu
- **Content mở rộng:** Dashboard 4-column stats cards, biểu đồ rộng hơn
- **Form nhập số:** 2-column layout (form trái + live calculation phải)
- **Hóa đơn:** 5:2 grid (bảng kê trái + AI panel phải)

---

## 📑 6. Tài liệu Bài kiểm tra

| Bài | File | Nội dung |
|---|---|---|
| **KT1** | [`KT1_Phan_tich_thiet_ke.md`](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/KT1_Phan_tich_thiet_ke.md) | Phân tích yêu cầu, thiết kế hệ thống, xác định vị trí AI — 10 tiêu chí |
| **KT2** | [`KT2_Xay_dung_chuc_nang.md`](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/KT2_Xay_dung_chuc_nang.md) | Xây dựng chức năng quản lý, CRUD, auth, UI, error handling — 10 tiêu chí |
| **KT3** | [`KT3_Tich_hop_AI_kiem_thu.md`](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/KT3_Tich_hop_AI_kiem_thu.md) | Tích hợp AI, tối ưu prompt 3 vòng, kiểm thử, review code — 10 tiêu chí |
