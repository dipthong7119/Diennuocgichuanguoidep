# Prompt: Chọn thiết kế CSDL bằng Self-Consistency

## Kỹ thuật minh họa
Self-Consistency: tạo nhiều phương án suy luận rồi chọn phương án nhất quán nhất.

## Prompt sử dụng

Bạn là kiến trúc sư phần mềm. Hãy giải quyết bài toán thiết kế CSDL cho quản lý tồn kho trong hệ thống quản lý bán hàng bằng cách tạo 3 phương án độc lập, sau đó so sánh và chọn phương án tốt nhất.

Bối cảnh:
- Hệ thống quản lý sản phẩm, hóa đơn, chi tiết hóa đơn, phiếu nhập và tồn kho.
- Cần xử lý đúng khi tạo hóa đơn, sửa hóa đơn, hủy hóa đơn và nhập hàng.
- Cần có dữ liệu phục vụ báo cáo tồn kho và sản phẩm bán chạy.

Yêu cầu Self-Consistency:
1. Tạo Phương án A: lưu tồn kho trực tiếp trong bảng products.
2. Tạo Phương án B: dùng bảng inventory_movements để ghi lịch sử nhập/xuất.
3. Tạo Phương án C: kết hợp tồn kho hiện tại và lịch sử biến động.
4. Đánh giá từng phương án theo các tiêu chí: đúng nghiệp vụ, dễ triển khai demo, dễ audit, hỗ trợ báo cáo, rủi ro sai lệch.
5. Chọn phương án được nhiều tiêu chí ủng hộ nhất.

Định dạng đầu ra:
- Bảng so sánh 3 phương án.
- Kết luận chọn phương án.
- Lý do chọn.
- Các test case bắt buộc cho phương án được chọn.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
