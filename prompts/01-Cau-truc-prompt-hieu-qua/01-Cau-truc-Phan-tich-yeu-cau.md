# Prompt: Phân tích yêu cầu bằng cấu trúc prompt đầy đủ

## Kỹ thuật minh họa
Cấu trúc prompt hiệu quả: Instructions, Context, Input Data/Constraints, Examples, Output Format.

## Prompt sử dụng

[Instructions]
Dựa vào mô tả bài toán : Thông tin dự án: Codes\Bai 03\project.md
Phân tích yêu cầu cho hệ thống quản lý bán hàng có tích hợp AI. Hãy xác định vấn đề nghiệp vụ, mục tiêu, actor, chức năng chính, dữ liệu chính, yêu cầu phi chức năng và các rủi ro cần lưu ý.

[Context]
- Bạn là chuyên viên phân tích nghiệp vụ phần mềm.
- Hệ thống dùng cho cửa hàng bán lẻ.
- Hệ thống cần hỗ trợ quản lý sản phẩm, khách hàng, hóa đơn, nhập hàng, tồn kho, doanh thu và các chức năng AI.
- Các chức năng AI gồm: chatbot tư vấn sản phẩm, AI sinh nhận xét doanh thu, hỏi đáp dữ liệu bán hàng bằng ngôn ngữ tự nhiên.
- Kết quả dành cho sinh viên môn Ứng dụng AI để dùng làm tài liệu phân tích ban đầu.

[Input Data / Constraints]
- Chỉ dựa trên mô tả sau, không tự thêm nghiệp vụ mâu thuẫn:
  - Người dùng gồm quản trị viên, nhân viên bán hàng, chủ cửa hàng.
  - Sản phẩm có mã, tên, nhóm hàng, giá bán, giá nhập, tồn kho, trạng thái.
  - Khách hàng có thông tin liên hệ, lịch sử mua hàng, nhóm khách hàng.
  - Hóa đơn cần tính tổng tiền, giảm giá, phương thức thanh toán.
  - Cần thống kê doanh thu theo ngày, tháng, nhóm hàng, sản phẩm bán chạy.
  - Cần xuất báo cáo PDF/Excel/CSV.
  - Khi gọi AI, không gửi dữ liệu nhạy cảm nếu không cần thiết.

[Examples]
Ví dụ cách diễn đạt actor:
- Actor: Nhân viên bán hàng
- Mục tiêu: Lập hóa đơn nhanh, tra cứu sản phẩm còn hàng, ghi nhận thanh toán.
- Chức năng liên quan: Tìm sản phẩm, tạo hóa đơn, áp dụng giảm giá, in/xuất hóa đơn.

[Output Format]
Trả lời bằng Markdown với các mục:
1. Bối cảnh và vấn đề
2. Mục tiêu hệ thống
3. Actor và nhu cầu
4. Danh sách chức năng quản lý
5. Danh sách chức năng AI
6. Dữ liệu chính
7. Yêu cầu phi chức năng
8. Rủi ro và giả định cần kiểm chứng

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
