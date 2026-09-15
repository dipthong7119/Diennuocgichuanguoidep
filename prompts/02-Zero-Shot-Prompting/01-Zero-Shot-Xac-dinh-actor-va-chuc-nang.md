# Prompt: Xác định actor và chức năng bằng Zero-Shot

## Kỹ thuật minh họa
Zero-Shot Prompting: yêu cầu trực tiếp, không cung cấp ví dụ mẫu.

## Prompt sử dụng

Bạn là chuyên viên phân tích hệ thống. Dựa trên mô tả sau, hãy xác định actor và chức năng chính cho hệ thống quản lý bán hàng có tích hợp AI.

Bối cảnh:
- Cửa hàng bán lẻ cần quản lý sản phẩm, khách hàng, hóa đơn, doanh thu và tồn kho.
- Người dùng gồm quản trị viên, nhân viên bán hàng và chủ cửa hàng.
- Hệ thống có các chức năng quản lý: đăng nhập, phân quyền, quản lý sản phẩm, quản lý khách hàng, lập hóa đơn, nhập hàng, cập nhật tồn kho, tìm kiếm/lọc, thống kê doanh thu, xuất báo cáo.
- Hệ thống có chức năng AI: tư vấn sản phẩm còn hàng, sinh nhận xét doanh thu, hỏi đáp dữ liệu bán hàng bằng ngôn ngữ tự nhiên.

Yêu cầu:
1. Liệt kê actor.
2. Với mỗi actor, liệt kê các chức năng phù hợp.
3. Chỉ ra chức năng nào cần phân quyền chặt chẽ.
4. Không tự thêm actor hoặc chức năng ngoài bối cảnh trên.

Định dạng đầu ra:
- Bảng actor - mục tiêu - chức năng.
- Danh sách chức năng cần bảo vệ quyền truy cập.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
