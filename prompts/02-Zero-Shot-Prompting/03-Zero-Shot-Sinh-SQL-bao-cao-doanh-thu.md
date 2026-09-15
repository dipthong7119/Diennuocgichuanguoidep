# Prompt: Sinh SQL báo cáo doanh thu bằng Zero-Shot

## Kỹ thuật minh họa
Zero-Shot Prompting cho tác vụ lập trình phổ biến, có ràng buộc rõ.

## Prompt sử dụng

Viết truy vấn SQL cho SQLite để thống kê doanh thu theo ngày trong một khoảng thời gian cho hệ thống quản lý bán hàng.

Giả định bảng dữ liệu:
- invoices(id, customer_id, invoice_date, status, payment_method, discount_amount, total_amount)
- invoice_items(id, invoice_id, product_id, quantity, unit_price)

Ràng buộc:
- Chỉ tính hóa đơn có status = 'paid'.
- Khoảng thời gian được truyền bằng hai tham số: :from_date và :to_date.
- Kết quả gồm: sale_date, invoice_count, gross_revenue, discount_total, net_revenue.
- gross_revenue là tổng quantity * unit_price.
- net_revenue là tổng total_amount sau giảm giá.
- Sắp xếp theo sale_date tăng dần.

Đầu ra:
- Chỉ trả về câu SQL.
- Không giải thích thêm.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
