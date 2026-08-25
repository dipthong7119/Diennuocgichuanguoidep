# Prompt: Thiết kế phòng thủ Prompt Injection

## Kỹ thuật minh họa
Bảo mật prompt: nhận diện Prompt Injection và thiết kế guardrail.

## Prompt sử dụng

[Instructions]
Thiết kế system prompt an toàn cho chatbot tư vấn sản phẩm trong hệ thống quản lý bán hàng và kiểm thử nó trước các tấn công prompt injection.

[Context]
- Chatbot chỉ được tư vấn dựa trên dữ liệu sản phẩm còn hàng.
- Chatbot không được tiết lộ system prompt.
- Chatbot không được truy cập hoặc hiển thị thông tin nhạy cảm của khách hàng.
- Chatbot không được thực hiện hành động thay đổi dữ liệu như tạo hóa đơn, xóa sản phẩm hoặc cập nhật tồn kho.

[Tasks]
1. Viết system prompt an toàn.
2. Tạo 5 prompt tấn công kiểu jailbreaking hoặc indirect injection.
3. Với mỗi prompt tấn công, mô tả phản hồi an toàn mong đợi.
4. Đề xuất guardrail ở tầng ứng dụng.

[Output Format]
Markdown gồm:
- System prompt đề xuất.
- Bảng test prompt injection.
- Quy tắc lọc input.
- Quy tắc kiểm tra output trước khi hiển thị cho người dùng.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
