# Prompt: Debug lỗi tồn kho bằng Chain-of-Thought

## Kỹ thuật minh họa
Chain-of-Thought cho debugging cần truy vết nguyên nhân gốc rễ.

## Prompt sử dụng

Bạn là lập trình viên backend senior. Hãy phân tích lỗi tồn kho trong hệ thống quản lý bán hàng.

Mô tả lỗi:
- Sản phẩm Tai nghe Bluetooth A1 có tồn kho ban đầu là 12.
- Nhân viên tạo hóa đơn bán 2 sản phẩm, hệ thống trừ tồn kho còn 10.
- Sau đó nhân viên sửa hóa đơn từ 2 sản phẩm thành 3 sản phẩm.
- Hệ thống trừ tiếp 3 sản phẩm và tồn kho còn 7.
- Kết quả đúng phải là 9 vì số lượng tăng thêm chỉ là 1.

Yêu cầu:
Hãy suy nghĩ từng bước:
1. Xác định trạng thái tồn kho trước và sau mỗi thao tác.
2. Xác định nguyên nhân gốc rễ.
3. Đề xuất thuật toán cập nhật tồn kho khi sửa hóa đơn.
4. Đề xuất test case để ngăn lỗi tái diễn.

Ràng buộc:
- Không đề xuất viết lại toàn bộ hệ thống.
- Tập trung vào logic cập nhật tồn kho khi tạo, sửa, hủy hóa đơn.

Định dạng đầu ra:
- Nguyên nhân gốc rễ.
- Bảng mô phỏng tồn kho đúng/sai.
- Pseudocode thuật toán sửa.
- Danh sách test case.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
