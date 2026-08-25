# Prompt: Thiết kế prompt template tái sử dụng

## Kỹ thuật minh họa
Prompt template: tái sử dụng prompt với placeholder để đảm bảo nhất quán.

## Prompt sử dụng

[Instructions]
Thiết kế một prompt template tái sử dụng cho nhóm sinh viên phát triển hệ thống quản lý bán hàng có tích hợp AI.

[Context]
- Template dùng để yêu cầu AI hỗ trợ các tác vụ trong SDLC: phân tích yêu cầu, thiết kế CSDL, sinh API CRUD, sinh test case, debug và viết tài liệu.
- Dự án có backend Python FastAPI/Flask/Django, frontend React/Vue/HTML/CSS/JavaScript, CSDL SQLite hoặc MySQL/PostgreSQL.
- Prompt cần giúp sinh viên cung cấp đủ ngữ cảnh nhưng tránh gửi dữ liệu nhạy cảm như số điện thoại đầy đủ, dữ liệu thanh toán hoặc API key.

[Input Data / Constraints]
- Template phải có các trường: [Vai trò], [Bối cảnh dự án], [Nhiệm vụ], [Đầu vào], [Ràng buộc], [Tiêu chí đạt], [Định dạng đầu ra].
- Dùng placeholder dạng {{ten_truong}}.
- Có hướng dẫn ngắn về cách điền từng trường.
- Không tạo template quá dài hoặc khó dùng.

[Output Format]
Trả về:
1. Prompt template hoàn chỉnh trong khối code Markdown.
2. Bảng giải thích từng placeholder.
3. Một ví dụ đã điền template cho tác vụ "sinh API CRUD quản lý sản phẩm".

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
