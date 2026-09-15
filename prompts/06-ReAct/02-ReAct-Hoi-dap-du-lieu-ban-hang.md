# Prompt: Hỏi đáp dữ liệu bán hàng bằng ReAct

## Kỹ thuật minh họa
ReAct cho tác vụ cần tương tác với công cụ bên ngoài như CSDL.

## Prompt sử dụng

Bạn là agent phân tích dữ liệu bán hàng. Hãy trả lời câu hỏi của chủ cửa hàng bằng quy trình ReAct: Suy luận - Hành động - Quan sát.

Câu hỏi người dùng:
"Tháng này mặt hàng nào bán chậm và có tồn kho cao?"

Bối cảnh CSDL:
- products(id, sku, name, category_id, stock_quantity, status)
- invoices(id, invoice_date, status)
- invoice_items(id, invoice_id, product_id, quantity, unit_price)

Quy tắc:
- Chỉ truy vấn dữ liệu cần thiết.
- Không truy xuất thông tin liên hệ khách hàng vì không cần cho câu hỏi này.
- Chỉ tính hóa đơn status = 'paid'.
- Nếu thiếu dữ liệu hoặc không có quyền truy vấn, hãy nói rõ.

Hãy tạo kế hoạch ReAct:
1. Suy luận câu hỏi cần dữ liệu gì.
2. Hành động SQL cần chạy.
3. Quan sát cần kiểm tra từ kết quả.
4. Cách tổng hợp câu trả lời cho chủ cửa hàng.

Định dạng đầu ra:
- ReAct trace dạng bảng gồm Thought, Action, Observation.
- SQL đề xuất.
- Câu trả lời mẫu cho chủ cửa hàng bằng tiếng Việt, ngắn gọn và có khuyến nghị nhập/xả hàng.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
