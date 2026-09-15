# Prompt: Sinh UML cho hệ thống quản lý bán hàng

## Kỹ thuật minh họa
Prompt cho tác vụ lập trình nâng cao: sinh sơ đồ UML bằng Mermaid.

## Prompt sử dụng

[Instructions]
Tạo sơ đồ UML dạng Mermaid cho hệ thống quản lý bán hàng có tích hợp AI.

[Context]
- Hệ thống có các actor: quản trị viên, nhân viên bán hàng, chủ cửa hàng.
- Chức năng quản lý: đăng nhập, quản lý sản phẩm, khách hàng, hóa đơn, nhập hàng, tồn kho, báo cáo doanh thu, xuất file.
- Chức năng AI: chatbot tư vấn sản phẩm, sinh nhận xét doanh thu, hỏi đáp dữ liệu bán hàng.

[Tasks]
1. Tạo Use Case Diagram bằng Mermaid.
2. Tạo Class Diagram bằng Mermaid cho các lớp chính: User, Role, Product, Category, Customer, Invoice, InvoiceItem, PurchaseOrder, InventoryMovement, AIReportRequest.
3. Giải thích ngắn quan hệ giữa các lớp.

[Constraints]
- Không thêm module ngoài phạm vi dự án.
- Tên lớp và thuộc tính dùng tiếng Anh để phù hợp khi triển khai code.

[Output Format]
Trả về:
1. Mermaid use case diagram.
2. Mermaid class diagram.
3. Giải thích ngắn bằng tiếng Việt.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
