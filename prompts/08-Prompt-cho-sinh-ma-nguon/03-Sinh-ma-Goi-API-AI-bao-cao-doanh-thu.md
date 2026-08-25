# Prompt: Sinh code gọi API AI cho báo cáo doanh thu

## Kỹ thuật minh họa
Prompt sinh mã cho chức năng AI có kiểm soát lỗi và dữ liệu nhạy cảm.

## Prompt sử dụng

[Instructions]
Viết module Python gọi AI để sinh nhận xét doanh thu cho hệ thống quản lý bán hàng.

[Context]
- Backend dùng Python.
- Dữ liệu đầu vào gồm doanh thu theo ngày, tồn kho và sản phẩm bán chạy.
- AI chỉ sinh nhận xét và khuyến nghị nhập hàng, không được thay đổi dữ liệu hệ thống.

[Constraints]
- API key lấy từ biến môi trường, không hardcode.
- Có timeout.
- Có xử lý lỗi rate limit, response rỗng, response sai định dạng.
- Không gửi thông tin nhạy cảm của khách hàng.
- Prompt gửi cho AI phải yêu cầu output Markdown gồm: Tóm tắt, Điểm đáng chú ý, Cảnh báo tồn kho, Khuyến nghị.
- Tách prompt template khỏi hàm gọi API.

[Output Format]
Trả về:
1. File ai_prompts.py chứa prompt template.
2. File ai_report_service.py chứa hàm generate_revenue_insight.
3. Ví dụ cách gọi hàm với dữ liệu mẫu.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
