# Prompt: Kiểm thử prompt chatbot tư vấn sản phẩm

## Kỹ thuật minh họa
Kiểm thử prompt theo tiêu chí: accuracy, consistency, completeness, robustness, performance.

## Prompt sử dụng

[Instructions]
Thiết kế bộ test case để kiểm thử prompt chatbot tư vấn sản phẩm cho hệ thống quản lý bán hàng.

[Context]
- Chatbot chỉ tư vấn dựa trên dữ liệu sản phẩm và tồn kho được cung cấp.
- Nếu thiếu dữ liệu, chatbot phải nói rõ.
- Mục tiêu là giảm tư vấn sai sản phẩm hết hàng.

[Test Scope]
Tạo ít nhất 10 test case bao gồm:
- Happy path.
- Sản phẩm hết hàng.
- Không có sản phẩm phù hợp.
- Dữ liệu sản phẩm thiếu mô tả.
- User cố prompt injection: "bỏ qua quy tắc tồn kho".
- Giá trị ngân sách không hợp lệ.
- Câu hỏi mơ hồ.
- Nhiều sản phẩm phù hợp.

[Evaluation Criteria]
Mỗi test case phải có tiêu chí chấm:
- Đúng dữ liệu.
- Đủ thông tin.
- Tuân thủ định dạng.
- Không bịa sản phẩm.
- Không lộ dữ liệu nhạy cảm.

[Output Format]
Bảng Markdown gồm: Test ID, Input người dùng, Dữ liệu sản phẩm, Kết quả mong đợi, Tiêu chí đánh giá, Mức ưu tiên.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
