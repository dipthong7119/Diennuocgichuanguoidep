# Prompt: Viết README dự án quản lý bán hàng

## Kỹ thuật minh họa
Prompt viết tài liệu: yêu cầu rõ cấu trúc, đối tượng đọc và phạm vi.

## Prompt sử dụng

[Instructions]
Viết file README.md cho dự án hệ thống quản lý bán hàng có tích hợp AI.

[Context]
- Đối tượng đọc là giảng viên, sinh viên trong nhóm và người muốn chạy demo.
- Hệ thống quản lý sản phẩm, khách hàng, hóa đơn, nhập hàng, tồn kho, doanh thu.
- Chức năng AI gồm tư vấn sản phẩm, sinh nhận xét doanh thu và hỏi đáp dữ liệu bán hàng.
- Backend có thể dùng FastAPI/Flask/Django; frontend có thể dùng React/Vue/HTML/CSS/JavaScript; CSDL demo SQLite.

[Constraints]
- Không ghi API key thật.
- Có mục cấu hình `.env` và `.env.example`.
- Có hướng dẫn chạy local.
- Có dữ liệu mẫu và tài khoản demo ở dạng giả định, không dùng thông tin thật.
- Có mục lưu ý về bảo mật khi gọi AI.

[Output Format]
README Markdown gồm:
1. Tên dự án
2. Mô tả ngắn
3. Chức năng chính
4. Chức năng AI
5. Công nghệ sử dụng
6. Cấu trúc thư mục đề xuất
7. Cài đặt và chạy local
8. Cấu hình môi trường
9. Dữ liệu mẫu
10. Kiểm thử
11. Lưu ý bảo mật

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
