# Prompt: Sinh test case theo mẫu bằng Few-Shot

## Kỹ thuật minh họa
Few-Shot Prompting với ví dụ đại diện và edge case.

## Prompt sử dụng

Bạn là QA Engineer. Hãy sinh test case cho hệ thống quản lý bán hàng theo đúng định dạng của ví dụ.

Ví dụ:

Chức năng: Lập hóa đơn
Test case ID: TC-HD-01
Mục tiêu: Tạo hóa đơn hợp lệ
Tiền điều kiện: Có sản phẩm Tai nghe Bluetooth A1, tồn kho 12, giá bán 350000
Bước thực hiện:
1. Đăng nhập bằng tài khoản nhân viên bán hàng.
2. Chọn sản phẩm Tai nghe Bluetooth A1, số lượng 2.
3. Áp dụng giảm giá 0.
4. Chọn phương thức thanh toán tiền mặt.
5. Lưu hóa đơn.
Kết quả mong đợi:
- Hóa đơn được tạo thành công.
- Tổng tiền là 700000.
- Tồn kho sản phẩm còn 10.

Nhiệm vụ:
Sinh test case cho các chức năng:
1. Không cho bán sản phẩm vượt tồn kho.
2. Hủy hóa đơn và hoàn lại tồn kho.
3. AI tư vấn sản phẩm khi khách yêu cầu tai nghe dưới 500000 đồng, pin lâu, còn hàng.
4. AI sinh báo cáo doanh thu khi dữ liệu doanh thu rỗng.
5. Xuất báo cáo doanh thu ra CSV.

Ràng buộc:
- Mỗi chức năng có ít nhất 1 test case happy path hoặc edge case phù hợp.
- Không dùng dữ liệu nhạy cảm của khách hàng.
- Kết quả mong đợi phải kiểm chứng được.

Định dạng đầu ra:
Markdown, mỗi test case gồm đúng các mục như ví dụ.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
