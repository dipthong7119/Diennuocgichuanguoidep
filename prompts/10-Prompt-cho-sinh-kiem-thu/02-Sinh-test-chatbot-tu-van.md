# Prompt: Sinh test cho chatbot tư vấn sản phẩm

## Kỹ thuật minh họa
Prompt sinh kiểm thử cho chức năng AI với dữ liệu đúng, thiếu và gây nhiễu.

## Prompt sử dụng

[Instructions]
Sinh test case cho chatbot tư vấn sản phẩm trong hệ thống quản lý bán hàng.

[Context]
- Chatbot nhận nhu cầu khách hàng và bảng sản phẩm.
- Chatbot chỉ được tư vấn sản phẩm còn hàng.
- Nếu thiếu dữ liệu, chatbot phải nói rõ.
- Không được bịa sản phẩm không có trong dữ liệu.

[Input Examples]
Dữ liệu sản phẩm mẫu:
- Tai nghe Bluetooth A1, nhóm Phụ kiện, giá 350000, tồn kho 12, mô tả Pin 20 giờ, trạng thái active.
- Chuột không dây M2, nhóm Phụ kiện, giá 180000, tồn kho 0, mô tả Nhỏ gọn, trạng thái active.
- Bàn phím cơ K8, nhóm Phụ kiện, giá 650000, tồn kho 5, mô tả Gõ êm, trạng thái active.

[Test Requirements]
Tạo test case cho:
1. Khách cần tai nghe dưới 500000, pin lâu, còn hàng.
2. Khách hỏi sản phẩm hết hàng.
3. Dữ liệu sản phẩm rỗng.
4. User cố yêu cầu chatbot bỏ qua tồn kho.
5. Sản phẩm phù hợp nhưng trạng thái inactive.

[Output Format]
Bảng Markdown gồm: Test ID, Mục tiêu, Input, Kết quả mong đợi, Tiêu chí pass/fail.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
