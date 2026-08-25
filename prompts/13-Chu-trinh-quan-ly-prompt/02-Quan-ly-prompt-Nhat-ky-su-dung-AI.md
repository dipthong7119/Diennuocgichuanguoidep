# Prompt: Tạo nhật ký sử dụng AI

## Kỹ thuật minh họa
Prompt Management Cycle trong thực hành: ghi nhận prompt, phản hồi, đánh giá và tinh chỉnh.

## Prompt sử dụng

[Instructions]
Tạo mẫu nhật ký sử dụng AI cho sinh viên phát triển hệ thống quản lý bán hàng.

[Context]
- Nhật ký dùng để minh chứng việc sử dụng AI trong phân tích, thiết kế, lập trình, kiểm thử và viết tài liệu.
- Cần ghi rõ prompt, phản hồi AI, phần sinh viên kiểm chứng/chỉnh sửa và kết quả cuối.
- Không lưu dữ liệu nhạy cảm hoặc API key trong nhật ký.

[Output Requirements]
Tạo mẫu nhật ký có thể dùng trong Markdown hoặc bảng tính.

[Output Format]
Trả về:
1. Bảng Markdown với các cột: Ngày, Giai đoạn SDLC, Mục tiêu, Prompt đã dùng, Công cụ AI, Tóm tắt phản hồi, Cách kiểm chứng, Chỉnh sửa của sinh viên, Kết quả, Ghi chú bảo mật.
2. 3 dòng ví dụ đã điền cho:
   - Phân tích use case.
   - Sinh API CRUD sản phẩm.
   - Debug lỗi tồn kho.
3. Hướng dẫn ngắn cách dùng nhật ký khi nộp bài.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
