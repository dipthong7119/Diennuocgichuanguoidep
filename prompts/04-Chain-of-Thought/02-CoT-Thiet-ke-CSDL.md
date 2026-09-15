# Prompt: Thiết kế CSDL bằng Chain-of-Thought

## Kỹ thuật minh họa
Chain-of-Thought cho bài toán cần suy luận nhiều bước và cân nhắc quan hệ dữ liệu.

## Prompt sử dụng

Bạn là kiến trúc sư cơ sở dữ liệu. Hãy thiết kế CSDL cho hệ thống quản lý bán hàng có tích hợp AI.

Ngữ cảnh:
- Cần quản lý người dùng, vai trò, sản phẩm, danh mục, khách hàng, hóa đơn, chi tiết hóa đơn, phiếu nhập, tồn kho.
- Cần hỗ trợ báo cáo doanh thu theo ngày, tháng, nhóm hàng, sản phẩm bán chạy.
- Cần cung cấp dữ liệu sản phẩm còn hàng cho chatbot tư vấn.
- Cần cung cấp dữ liệu doanh thu, tồn kho, sản phẩm bán chạy cho AI sinh nhận xét.

Hãy suy nghĩ từng bước:
1. Xác định các entity chính.
2. Xác định thuộc tính quan trọng của từng entity.
3. Xác định khóa chính, khóa ngoại.
4. Xác định quan hệ 1-n, n-n nếu có.
5. Xác định ràng buộc dữ liệu để tránh sai lệch tồn kho và hóa đơn.
6. Đề xuất lược đồ bảng.

Ràng buộc:
- Ưu tiên SQLite cho demo.
- Không lưu API key trong CSDL.
- Không đưa dữ liệu thanh toán nhạy cảm vào prompt AI.

Định dạng đầu ra:
1. Danh sách entity và lý do tồn tại.
2. Bảng thiết kế CSDL dạng Markdown.
3. Mô tả quan hệ.
4. Gợi ý chỉ mục phục vụ tìm kiếm/báo cáo.
5. Mermaid ERD.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
