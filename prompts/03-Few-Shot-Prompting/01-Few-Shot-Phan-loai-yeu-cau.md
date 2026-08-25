# Prompt: Phân loại yêu cầu bằng Few-Shot

## Kỹ thuật minh họa
Few-Shot Prompting: cung cấp ví dụ để mô hình học cách phân loại.

## Prompt sử dụng

Bạn là chuyên viên phân tích yêu cầu. Hãy phân loại các yêu cầu của hệ thống quản lý bán hàng thành một trong bốn nhóm: Quản lý dữ liệu, Nghiệp vụ bán hàng, Báo cáo/Thống kê, Chức năng AI.

Ví dụ:

Input: "Nhân viên có thể thêm, sửa, ngừng kinh doanh sản phẩm."
Output: Quản lý dữ liệu

Input: "Hệ thống tự động trừ tồn kho khi hóa đơn được thanh toán."
Output: Nghiệp vụ bán hàng

Input: "Chủ cửa hàng xem sản phẩm bán chạy theo tháng."
Output: Báo cáo/Thống kê

Input: "Chatbot gợi ý sản phẩm còn hàng dựa trên nhu cầu khách hàng."
Output: Chức năng AI

Hãy phân loại các yêu cầu sau:
1. Quản trị viên tạo tài khoản nhân viên và gán vai trò.
2. Nhân viên lập hóa đơn, áp dụng giảm giá và ghi nhận phương thức thanh toán.
3. AI sinh nhận xét doanh thu và khuyến nghị nhập hàng.
4. Chủ cửa hàng lọc hóa đơn theo thời gian và trạng thái.
5. Hệ thống cập nhật tồn kho khi nhập hàng.
6. Chủ cửa hàng hỏi "Tháng này mặt hàng nào bán chậm?"

Định dạng đầu ra:
Bảng Markdown gồm: STT, Yêu cầu, Nhóm, Giải thích ngắn.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
