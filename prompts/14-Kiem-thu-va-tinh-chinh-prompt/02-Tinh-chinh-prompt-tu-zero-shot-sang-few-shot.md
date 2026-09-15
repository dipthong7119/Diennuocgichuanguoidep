# Prompt: Tinh chỉnh prompt từ Zero-Shot sang Few-Shot

## Kỹ thuật minh họa
Refinement: chỉ thay đổi một yếu tố mỗi lần và so sánh trước/sau.

## Prompt sử dụng

[Instructions]
Hãy tinh chỉnh prompt chatbot tư vấn sản phẩm từ phiên bản zero-shot sang phiên bản few-shot để giảm lỗi tư vấn sản phẩm hết hàng.

[Prompt v1 - Zero-shot]
"Khách hàng cần {{customer_need}}. Dữ liệu sản phẩm: {{product_table}}. Hãy gợi ý tối đa 3 sản phẩm phù hợp."

[Vấn đề quan sát]
- Có lúc AI gợi ý sản phẩm tồn kho bằng 0.
- Có lúc AI không nói rõ khi dữ liệu thiếu.
- Định dạng câu trả lời không nhất quán.

[Requirements]
- Chỉ thay đổi bằng cách thêm ví dụ few-shot và định dạng đầu ra.
- Giữ nguyên mục tiêu chính của prompt.
- Thêm 2 ví dụ: một ví dụ có sản phẩm phù hợp còn hàng, một ví dụ không có sản phẩm phù hợp.
- Không thêm dữ liệu nhạy cảm.

[Output Format]
Trả về:
1. Prompt v2 đã tinh chỉnh.
2. Bảng giải thích thay đổi so với v1.
3. 5 test case dùng để so sánh v1 và v2.
4. Tiêu chí quyết định v2 tốt hơn v1.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
