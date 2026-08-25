# Prompt: Phân tích quy trình lập hóa đơn bằng Chain-of-Thought

## Kỹ thuật minh họa
Chain-of-Thought: yêu cầu phân tích từng bước trước khi đưa ra kết quả.

## Prompt sử dụng

Bạn là chuyên viên phân tích nghiệp vụ. Hãy phân tích quy trình lập hóa đơn bán hàng cho hệ thống quản lý bán hàng.

Bối cảnh:
- Nhân viên bán hàng tìm sản phẩm, chọn số lượng, áp dụng giảm giá, ghi nhận phương thức thanh toán và lưu hóa đơn.
- Hệ thống phải kiểm tra tồn kho trước khi bán.
- Khi hóa đơn được thanh toán, hệ thống cập nhật tồn kho.
- Nếu hóa đơn bị hủy hoặc sửa, tồn kho phải được xử lý nhất quán.

Hãy suy nghĩ từng bước theo trình tự nghiệp vụ:
1. Xác định actor và mục tiêu.
2. Xác định dữ liệu đầu vào.
3. Xác định các bước xử lý chính.
4. Xác định điều kiện lỗi và edge case.
5. Xác định dữ liệu đầu ra.
6. Đề xuất use case hoàn chỉnh.

Định dạng đầu ra:
- Phần A: Phân tích từng bước.
- Phần B: Use case "Lập hóa đơn bán hàng" gồm: Actor, Tiền điều kiện, Luồng chính, Luồng thay thế, Hậu điều kiện.
- Phần C: Các điểm cần kiểm thử.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
