# Prompt: Viết tài liệu API

## Kỹ thuật minh họa
Prompt viết tài liệu kỹ thuật từ mô tả endpoint.

## Prompt sử dụng

[Instructions]
Viết tài liệu API cho các endpoint quản lý sản phẩm và hóa đơn của hệ thống quản lý bán hàng.

[Input]
Endpoint dự kiến:
- POST /products: tạo sản phẩm.
- GET /products: xem danh sách sản phẩm, có tìm kiếm và lọc trạng thái.
- PATCH /products/{id}: cập nhật sản phẩm.
- POST /invoices: tạo hóa đơn bán hàng.
- PATCH /invoices/{id}/cancel: hủy hóa đơn.
- GET /reports/revenue: thống kê doanh thu theo khoảng thời gian.

[Context]
- API trả về JSON.
- Cần có xác thực và phân quyền theo vai trò.
- Không đưa dữ liệu thanh toán nhạy cảm vào ví dụ.

[Output Format]
Markdown gồm:
1. Quy ước chung.
2. Bảng danh sách endpoint.
3. Chi tiết từng endpoint: mục đích, quyền truy cập, request body/query params, response thành công, lỗi thường gặp.
4. Ví dụ JSON cho request/response.
5. Lưu ý bảo mật và kiểm thử.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
