# Prompt: Sinh User Story theo mẫu bằng Few-Shot

## Kỹ thuật minh họa
Few-Shot Prompting để kiểm soát phong cách và mức chi tiết của đầu ra.

## Prompt sử dụng

Bạn là Business Analyst. Hãy viết user story cho hệ thống quản lý bán hàng theo đúng phong cách của các ví dụ.

Ví dụ 1:
Chức năng: Quản lý sản phẩm
User story:
Là một quản trị viên, tôi muốn thêm và cập nhật thông tin sản phẩm để danh mục hàng hóa luôn chính xác.
Tiêu chí chấp nhận:
- Có thể nhập mã, tên, nhóm hàng, giá bán, giá nhập, tồn kho và trạng thái.
- Không cho lưu sản phẩm thiếu mã hoặc tên.
- Không cho nhập giá bán, giá nhập hoặc tồn kho âm.

Ví dụ 2:
Chức năng: Tư vấn sản phẩm bằng AI
User story:
Là một nhân viên bán hàng, tôi muốn chatbot gợi ý sản phẩm phù hợp với nhu cầu khách để tư vấn nhanh hơn.
Tiêu chí chấp nhận:
- Chatbot chỉ gợi ý sản phẩm còn hàng.
- Chatbot giải thích ngắn lý do gợi ý.
- Nếu thiếu dữ liệu sản phẩm, chatbot phải nói rõ thay vì tự bịa.

Nhiệm vụ:
Viết user story cho các chức năng sau:
1. Lập hóa đơn bán hàng.
2. Quản lý nhập hàng và cập nhật tồn kho.
3. Thống kê doanh thu theo ngày/tháng.
4. Hỏi đáp dữ liệu bán hàng bằng ngôn ngữ tự nhiên.

Định dạng đầu ra:
Với mỗi chức năng, trình bày:
- Chức năng
- User story
- Tiêu chí chấp nhận

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
