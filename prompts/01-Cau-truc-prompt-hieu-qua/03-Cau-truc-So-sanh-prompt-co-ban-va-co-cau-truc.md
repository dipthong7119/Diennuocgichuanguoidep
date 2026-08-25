# Prompt: So sánh prompt cơ bản và prompt có cấu trúc

## Kỹ thuật minh họa
Phân tích khác biệt chất lượng giữa prompt thiếu cấu trúc và prompt có cấu trúc.

## Prompt sử dụng

[Instructions]
So sánh hai prompt dưới đây cho cùng tác vụ sinh SQL báo cáo doanh thu. Hãy phân tích vì sao prompt có cấu trúc tạo ra kết quả đáng tin cậy hơn.

[Context]
- Dự án là hệ thống quản lý bán hàng.
- CSDL demo có các bảng dự kiến: products, customers, invoices, invoice_items, purchase_orders, inventory_movements.
- Sinh viên cần học cách đánh giá chất lượng prompt, không chỉ xem kết quả có vẻ đúng.

[Input Data]
Prompt A:
"Viết SQL thống kê doanh thu tháng này."

Prompt B:
"Bạn là lập trình viên backend. Viết truy vấn SQL cho SQLite để thống kê doanh thu theo ngày trong tháng hiện tại. Dữ liệu gồm bảng invoices(id, customer_id, invoice_date, status, payment_method, discount_amount, total_amount) và invoice_items(id, invoice_id, product_id, quantity, unit_price). Chỉ tính hóa đơn có status = 'paid'. Trả về các cột: sale_date, invoice_count, gross_revenue, discount_total, net_revenue. Sắp xếp theo sale_date tăng dần. Chỉ trả về SQL và giải thích ngắn các giả định."

[Constraints]
- Không cần chạy SQL.
- Tập trung vào các thành phần prompt: Instructions, Context, Input Data/Constraints, Examples, Output Format.
- Chỉ ra rủi ro nếu dùng Prompt A trong dự án thật.

[Output Format]
Trả lời bằng bảng Markdown gồm các cột:
- Tiêu chí
- Prompt A
- Prompt B
- Nhận xét

Sau bảng, viết phần kết luận 5-7 câu cho sinh viên.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
