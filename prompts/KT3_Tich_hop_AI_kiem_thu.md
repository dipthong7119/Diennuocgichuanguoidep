# Bài Kiểm Tra 3: Tích hợp chức năng AI, tối ưu prompt và kiểm thử

**Đề tài:** Hệ thống quản lý hóa đơn điện nước hộ gia đình có tích hợp AI  
**Sinh viên:** _(điền tên)_  
**Ngày thực hiện:** 10/09/2026

---

## 1. Tích hợp được chức năng AI vào hệ thống (Tiêu chí 1 — Mức Biết)

### 1.1. Chức năng AI trong hệ thống

AI được tích hợp trực tiếp vào nghiệp vụ **phân tích tiêu thụ điện nước**, phục vụ 3 mục đích:

| Mục đích | Mô tả | Vị trí trong hệ thống |
|---|---|---|
| **Phát hiện bất thường** | So sánh tiêu thụ 3 tháng, xác định tháng tăng đột biến | `routers/ai_insight.py` → `_xac_dinh_muc_do()` |
| **Nhận xét xu hướng** | AI tạo đoạn nhận xét bằng ngôn ngữ tự nhiên | `_goi_ai_api()` → Gemini/OpenAI |
| **Gợi ý tiết kiệm** | AI đưa ra 3 gợi ý cá nhân hóa theo mức tiêu thụ | Kết quả trả về từ LLM |

### 1.2. Luồng sử dụng AI trong hệ thống

```
[User nhập chỉ số mới] → [Hệ thống tính hóa đơn] → [Nút "Phân tích AI"]
         ↓
[Backend lấy lịch sử 3 tháng từ CSDL]
         ↓
[Ẩn danh hóa: Chỉ gửi mảng số liệu [120, 115, 125]]
         ↓
[Gọi Gemini API / Mock Response]
         ↓
[Xác định mức cảnh báo: Bình thường / Cao / Nguy hiểm]
         ↓
[Lưu kết quả vào bảng PhanTichAI]
         ↓
[Hiển thị: Banner AI + Bảng nhận xét + Gợi ý tiết kiệm]
```

### 1.3. AI không tách rời sản phẩm

- AI Banner xuất hiện trực tiếp trên **Dashboard** (Tab 1)
- Nút **🤖 AI** trên từng hóa đơn trong **BillTab** (Tab 3)
- Kết quả AI được lưu vào CSDL (`PhanTichAI`) để tra cứu lại

---

## 2. Kết nối API/model AI đúng cách (Tiêu chí 2 — Mức Biết)

### 2.1. Provider được hỗ trợ

| Provider | Model | Config |
|---|---|---|
| **Google Gemini** | `gemini-1.5-flash` | `GEMINI_API_KEY` trong `.env` |
| **OpenAI** | `gpt-4o-mini` | `OPENAI_API_KEY` trong `.env` |
| **Mock** | Fallback nội bộ | Tự động khi không có key |

### 2.2. Cấu hình API Key an toàn

```env
# .env (KHÔNG commit lên git)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

```python
# .env.example (commit lên git — không chứa key thật)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

**Bảo vệ API Key:**
- Key chỉ tồn tại trong `.env` phía server
- Frontend KHÔNG bao giờ truy cập trực tiếp AI API
- `.env` được thêm vào `.gitignore`
- File `.env.example` chỉ chứa placeholder

### 2.3. Code kết nối Gemini

```python
# routers/ai_insight.py
def _goi_ai_api(mang_lich_su: List[int]) -> str:
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            return _mock_response(mang_lich_su)  # Fallback an toàn
        
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(full_prompt)
        return response.text
```

---

## 3. Thiết kế prompt có hệ thống (Tiêu chí 3 — Mức Hiểu)

### 3.1. System Prompt

```
System: Bạn là trợ lý phân tích hóa đơn điện nước.
Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu.
```

**Mục đích:** Giới hạn AI chỉ phân tích dữ liệu thực, không hallucinate.

### 3.2. User Prompt Template

```
User: Lịch sử tiêu thụ 3 tháng qua: {mang_lich_su_dien_nuoc}.
Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra rò rỉ nếu có, 
gợi ý cách tiết kiệm.
```

### 3.3. Input/Output Format

**Input (ẩn danh hóa):**
```json
[120, 115, 125]   // Mảng số tiêu thụ 3 tháng, KHÔNG kèm tên/SĐT/mã phòng
```

**Output kỳ vọng:**
```
Nhận xét: Lượng tiêu thụ ổn định quanh 120 đơn vị/tháng, tăng nhẹ 8.7% 
tháng gần nhất. Không phát hiện bất thường.

Gợi ý: 
- Tắt thiết bị khi không sử dụng
- Kiểm tra đường ống nước định kỳ
- Sử dụng thiết bị tiết kiệm điện
```

### 3.4. Ràng buộc và giới hạn

| Ràng buộc | Mô tả |
|---|---|
| **Ẩn danh hóa** | Chỉ gửi mảng số, không gửi thông tin cá nhân |
| **Giới hạn đầu vào** | Tối đa 3 tháng gần nhất |
| **Không tự tạo số** | System prompt yêu cầu "chỉ nhận xét từ dữ liệu được cung cấp" |
| **Fallback** | Nếu AI không phản hồi → trả mock response có cấu trúc |

### 3.5. Prompt tách khỏi code

```python
# Prompt được khai báo là constants, dễ thay đổi
SYSTEM_PROMPT = "System: Bạn là trợ lý phân tích hóa đơn điện nước..."
USER_PROMPT_TEMPLATE = "User: Lịch sử tiêu thụ 3 tháng qua: {mang_lich_su_dien_nuoc}..."
```

---

## 4. Tối ưu prompt qua thử nghiệm (Tiêu chí 4 — Mức Hiểu)

### 4.1. Vòng thử nghiệm 1: Prompt cơ bản

**Prompt:**
> "Phân tích dữ liệu tiêu thụ: [120, 115, 125]"

**Kết quả:** AI trả lời quá ngắn, thiếu gợi ý tiết kiệm, đôi khi tự tạo số liệu không có trong input.

**Vấn đề:** Thiếu ràng buộc, không có system prompt.

### 4.2. Vòng thử nghiệm 2: Thêm System Prompt + Format

**Prompt:**
> System: "Bạn là trợ lý phân tích hóa đơn. Chỉ nhận xét từ dữ liệu được cung cấp."
> User: "Lịch sử tiêu thụ 3 tháng: [120, 115, 125]. Hãy tóm tắt biến động."

**Kết quả:** Nhận xét chính xác hơn, nhưng thiếu phần gợi ý tiết kiệm thực tế.

**Cải tiến:** Thêm yêu cầu "gợi ý cách tiết kiệm" vào prompt.

### 4.3. Vòng thử nghiệm 3: Prompt hoàn chỉnh (hiện tại)

**Prompt:**
> System: "Bạn là trợ lý phân tích hóa đơn điện nước. Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu."
> User: "Lịch sử tiêu thụ 3 tháng qua: [120, 115, 180]. Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra rò rỉ nếu có, gợi ý cách tiết kiệm."

**Kết quả:** ✅ Nhận xét chính xác, phát hiện tháng 3 tăng 56% so với tháng 2, đề xuất kiểm tra rò rỉ, có 3 gợi ý tiết kiệm cụ thể.

### 4.4. So sánh kết quả 3 vòng

| Tiêu chí | Vòng 1 | Vòng 2 | Vòng 3 |
|---|---|---|---|
| Độ chính xác nhận xét | ❌ Tự tạo số | ✅ Đúng | ✅ Đúng |
| Phát hiện bất thường | ❌ Không | ⚠️ Đôi khi | ✅ Luôn phát hiện |
| Gợi ý tiết kiệm | ❌ Không có | ❌ Không có | ✅ 3 gợi ý cụ thể |
| Ẩn danh hóa | ✅ | ✅ | ✅ |
| Kiểm soát hallucination | ❌ | ✅ | ✅ |

---

## 5. Sử dụng dữ liệu hệ thống trong chức năng AI (Tiêu chí 5 — Mức Hiểu)

### 5.1. Dữ liệu từ CSDL

AI khai thác dữ liệu từ 3 bảng:

```python
# 1. Lấy đồng hồ thuộc hộ
dong_hos = db.query(DongHo).filter(DongHo.MaHo == payload.ma_ho).all()

# 2. Lấy 3 tháng gần nhất (mới nhất trước)
lich_su_records = (
    db.query(ChiSoTieuThu)
    .filter(ChiSoTieuThu.MaDongHo.in_(ma_dong_ho_list))
    .order_by(desc(ChiSoTieuThu.ThangNam))
    .limit(3)
    .all()
)

# 3. Chuyển thành mảng ẩn danh
mang_tieu_thu = [r.ChiSoMoi - r.ChiSoCu for r in reversed(lich_su_records)]
# Kết quả: [120, 115, 125] ← CHỈ CÓ SỐ, KHÔNG CÓ TÊN/SĐT
```

### 5.2. Kiểm soát quyền truy cập dữ liệu

| Dữ liệu | Được gửi lên AI? | Lý do |
|---|---|---|
| Mảng số tiêu thụ `[120, 115, 125]` | ✅ | Cần thiết cho phân tích |
| TenChuHo, SoDienThoai | ❌ | Thông tin cá nhân — bảo mật |
| MaPhong, MaHo | ❌ | Có thể suy ra danh tính |
| DonGia, TongTien | ❌ | Không cần cho phân tích xu hướng |

### 5.3. Nguyên tắc ẩn danh hóa

```python
# ĐÚNG: Chỉ gửi mảng số
_goi_ai_api([120, 115, 125])

# SAI: Gửi kèm thông tin cá nhân (KHÔNG làm điều này)
# _goi_ai_api({"ten": "Nguyễn Văn An", "phong": "P101", "data": [120, 115, 125]})
```

---

## 6. Hiển thị kết quả AI rõ ràng (Tiêu chí 6 — Mức Hiểu)

### 6.1. Dashboard — AI Highlight Banner

Kết quả AI được hiển thị nổi bật trên Dashboard với:
- **Gradient background** theo mức cảnh báo (Đỏ/Vàng/Xanh)
- **Icon**: AlertTriangle (nguy hiểm) hoặc Sparkles (bình thường)
- **Badge**: "Nguy hiểm" / "Cảnh báo" / "Bình thường"
- **Text**: Đoạn nhận xét ngắn gọn, cắt 2 dòng

### 6.2. BillTab — AI Insight Panel

Kết quả chi tiết trong tab Hóa đơn:
- **Header**: Icon Sparkles + badge mức cảnh báo
- **Nhận xét**: Đoạn văn phân tích xu hướng từ AI
- **Gợi ý tiết kiệm**: 3 bullets đánh số, mỗi gợi ý có icon riêng
- **Footer**: Ghi chú "Phân tích bởi AI dựa trên dữ liệu ẩn danh hóa"

### 6.3. Cảnh báo rõ ràng

| Mức | Màu | Ý nghĩa |
|---|---|---|
| 🟢 Bình thường | Xanh lá | Tiêu thụ ổn định, tăng < 20% |
| 🟡 Cảnh báo | Vàng/Cam | Tiêu thụ tăng 20-50%, cần chú ý |
| 🔴 Nguy hiểm | Đỏ | Tăng > 50%, nghi vấn rò rỉ/hỏng thiết bị |

---

## 7. Xử lý lỗi và giới hạn AI (Tiêu chí 7 — Mức Vận dụng)

### 7.1. Xử lý các trường hợp lỗi

```python
def _goi_ai_api(mang_lich_su):
    try:
        # Gọi Gemini/OpenAI
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        # Fallback: Trả mock response thay vì crash
        return f"[Lỗi {provider} API: {str(e)}] " + _mock_response(mang_lich_su)
```

### 7.2. Bảng xử lý lỗi AI

| Lỗi | Xử lý | Kết quả cho người dùng |
|---|---|---|
| Không có API key | `_mock_response()` | Nhận xét mock có cấu trúc |
| API timeout | `except Exception` → mock | Vẫn có kết quả (mock) |
| Rate limit | `except Exception` → mock | Vẫn có kết quả (mock) |
| Response rỗng | Check `if not mang_lich_su` | `"Chưa đủ dữ liệu để phân tích"` |
| Key sai/hết hạn | Exception caught → mock | Prefix lỗi + mock |
| Dữ liệu < 2 tháng | `_xac_dinh_muc_do()` return "Bình thường" | Không crash |

### 7.3. Mock Response

```python
def _mock_response(mang_lich_su):
    if not mang_lich_su:
        return "Chưa đủ dữ liệu để phân tích."
    tb = sum(mang_lich_su) / len(mang_lich_su)
    return (
        f"[Mock - Chưa cấu hình AI API Key]\n"
        f"Dữ liệu tiêu thụ 3 tháng: {mang_lich_su}.\n"
        f"Trung bình: {tb:.1f} đơn vị/tháng.\n"
        f"Khuyến nghị: Kiểm tra thiết bị sử dụng nhiều điện/nước nhất."
    )
```

---

## 8. Kiểm thử chức năng quản lý và chức năng AI (Tiêu chí 8 — Mức Vận dụng)

### 8.1. Test Cases — Chức năng quản lý

| # | Test Case | Input | Expected | Kết quả |
|---|---|---|---|---|
| TC01 | Đăng nhập đúng | admin/admin123 | Token + role=admin | ✅ Pass |
| TC02 | Đăng nhập sai | admin/wrong | 401 "Sai mật khẩu" | ✅ Pass |
| TC03 | Tạo hộ mới | POST HO-006 | 201 Created | ✅ Pass |
| TC04 | Tạo hộ trùng | POST HO-001 (đã tồn tại) | 409 Conflict | ✅ Pass |
| TC05 | Nhập chỉ số hợp lệ | ChiSoCu=1360, ChiSoMoi=1490 | Auto tạo HoaDon | ✅ Pass |
| TC06 | Nhập chỉ số sai | ChiSoMoi < ChiSoCu | 422 Validation Error | ✅ Pass |
| TC07 | Thanh toán HĐ | PATCH /thanh-toan | TrangThaiThanhToan=true | ✅ Pass |
| TC08 | Xóa hộ | DELETE HO-006 | 200 "Đã xóa" | ✅ Pass |

### 8.2. Test Cases — Chức năng AI

| # | Test Case | Input | Expected | Kết quả |
|---|---|---|---|---|
| TC09 | AI phân tích bình thường | HO-001 (ổn định) | MucDoCanhBao="Bình thường" | ✅ Pass |
| TC10 | AI phân tích bất thường | HO-002 (nước tăng 150%) | MucDoCanhBao="Nguy hiểm" | ✅ Pass |
| TC11 | AI không có key | GEMINI_API_KEY rỗng | Mock response, không crash | ✅ Pass |
| TC12 | AI hóa đơn không tồn tại | ma_hoa_don="HD-9999" | 404 "Không tìm thấy" | ✅ Pass |

### 8.3. Test biên (Edge Cases)

| # | Test Case | Input | Expected | Kết quả |
|---|---|---|---|---|
| TC13 | Chỉ số cũ = mới | ChiSoCu=100, ChiSoMoi=100 | Tiêu thụ = 0, TongTien = 0 | ✅ Pass |
| TC14 | Hộ chưa có đồng hồ | AI cho hộ không có DH | 404 "Chưa có đồng hồ" | ✅ Pass |
| TC15 | Chỉ có 1 tháng dữ liệu | Mảng [120] | MucDo="Bình thường" (< 2 tháng) | ✅ Pass |

### 8.4. Kiểm thử Frontend (Manual Test)

| Tình huống | Hành vi mong đợi | Kết quả |
|---|---|---|
| Nhập số điện mới < số cũ | Viền đỏ + text lỗi, nút Submit disabled | ✅ |
| Nhập số hợp lệ | Live calculation hiện tiêu thụ + thành tiền | ✅ |
| Click "Lưu & Kích hoạt AI" | Spinner → Success screen | ✅ |
| Chuyển phòng trong dropdown | Dashboard + Form + Bill reload dữ liệu mới | ✅ |
| Click "Thanh toán" | Bottom sheet → Xác nhận → Badge chuyển xanh | ✅ |

---

## 9. Review code và cải thiện chất lượng bằng AI (Tiêu chí 9 — Mức Vận dụng)

### 9.1. Prompt review code

**Prompt gửi AI:**
> "Review đoạn code Python sau (routers/ai_insight.py). Kiểm tra: security, error handling, performance, best practices. Chỉ ra lỗi tiềm ẩn và đề xuất cải thiện."

### 9.2. Kết quả review và hành động

| Phát hiện của AI | Mức độ | Hành động |
|---|---|---|
| "API key có thể bị log ra console" | ⚠️ Bảo mật | Đã sửa: không log key, chỉ log `[Lỗi API]` |
| "Thiếu rate limiting cho endpoint AI" | ℹ️ Hiệu năng | Ghi nhận: có thể thêm middleware throttle |
| "`db.rollback()` nên trong finally block" | ⚠️ Bug tiềm ẩn | Đã kiểm tra: rollback đã ở except block |
| "Nên validate `mang_lich_su` không rỗng" | ✅ Best practice | Đã có: `if not mang_lich_su: return "Chưa đủ dữ liệu"` |
| "Mock response nên match format thật" | ℹ️ UX | Đã sửa: mock response có cấu trúc giống real |

### 9.3. Prompt refactor

**Prompt gửi AI:**
> "Refactor hàm `_xac_dinh_muc_do()` để dễ đọc hơn. Hiện tại dùng if-elif-else. Có cách nào clean hơn?"

**Kết quả:** AI đề xuất dùng dictionary mapping, nhưng logic if-elif-else hiện tại đủ rõ ràng với chỉ 3 mức cảnh báo → giữ nguyên, thêm docstring giải thích.

---

## 10. Tích hợp chức năng AI với trải nghiệm người dùng (Tiêu chí 10 — Mức Vận dụng)

### 10.1. AI trong luồng sử dụng tự nhiên

```
[Mở app] → [Tab Tổng quan: Thấy AI Banner cảnh báo đỏ]
         → "Ồ, nước tháng này tăng bất thường!"
         → [Bấm Tab Hóa đơn: Xem chi tiết AI Insight]
         → [Đọc 3 gợi ý tiết kiệm]
         → [Bấm "Thanh toán"]
         
[Hoặc: Tab Nhập số] → [Nhập chỉ số mới]
         → [Nút "Lưu & Kích hoạt AI phân tích"]
         → [AI tự động phân tích sau khi lưu]
```

### 10.2. AI không gây nhầm lẫn

| Điểm | Thiết kế |
|---|---|
| **Vị trí rõ ràng** | AI Banner ở giữa Dashboard, AI Panel ở cuối Bill — không lẫn với data chính |
| **Label rõ ràng** | "AI Phân tích", "AI Insight & Energy Advisor" — user biết đây là AI |
| **Badge mức cảnh báo** | Đỏ/Vàng/Xanh trực quan, không cần đọc text |
| **Disclaimer** | Footer: "Phân tích bởi AI dựa trên dữ liệu ẩn danh hóa" |
| **Không thay thế dữ liệu** | AI chỉ NHẬN XÉT, không sửa đổi số liệu hóa đơn |

### 10.3. So sánh trước vs. sau khi tích hợp AI

| Trước (chỉ quản lý) | Sau (có AI) |
|---|---|
| User tự xem số, tự so sánh | AI tự so sánh 3 tháng, phát hiện bất thường |
| Không biết tháng nào tăng bất thường | Banner đỏ cảnh báo ngay trên Dashboard |
| Không biết cách tiết kiệm | 3 gợi ý cá nhân hóa theo mức tiêu thụ |
| Phải nhớ kiểm tra rò rỉ | AI tự động gợi ý "kiểm tra bồn cầu, đường ống" |

### 10.4. Kết luận

Chức năng AI được tích hợp **tự nhiên** vào luồng sử dụng, **hữu ích** cho người dùng cuối (phát hiện bất thường, gợi ý tiết kiệm), và **không gây nhầm lẫn** nhờ label rõ ràng, vị trí hợp lý, và disclaimer minh bạch.
