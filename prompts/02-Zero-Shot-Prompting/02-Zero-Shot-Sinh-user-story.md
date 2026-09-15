# Prompt: Sinh User Story bằng Zero-Shot

## Kỹ thuật minh họa
Zero-Shot Prompting cho tác vụ phổ biến, có cấu trúc đầu ra rõ ràng.

## Prompt sử dụng

Hãy viết user story cho hệ thống quản lý bán hàng có tích hợp AI.

Ngữ cảnh hệ thống:
- Nhân viên bán hàng cần lập hóa đơn, tìm sản phẩm, áp dụng giảm giá, ghi nhận thanh toán.
- Chủ cửa hàng cần xem doanh thu theo ngày/tháng, nhóm hàng, sản phẩm bán chạy và nhận nhận xét doanh thu do AI sinh.
- Quản trị viên cần quản lý người dùng, vai trò và cấu hình hệ thống.
- Chatbot AI chỉ tư vấn dựa trên dữ liệu sản phẩm còn hàng được cung cấp.

Yêu cầu:
- Viết 10 user story quan trọng nhất.
- Mỗi user story dùng mẫu: "Là một [actor], tôi muốn [mục tiêu] để [lợi ích]."
- Mỗi user story có 2-4 tiêu chí chấp nhận.
- Không đưa vào chức năng ngoài phạm vi quản lý bán hàng đã mô tả.

Định dạng đầu ra:
Markdown, mỗi user story gồm:
- Mã: US-xx
- User story
- Tiêu chí chấp nhận

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
