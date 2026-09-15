# Prompt: Kiểm chứng SQL bằng Self-Consistency

## Kỹ thuật minh họa
Self-Consistency cho tác vụ có đáp án khách quan và có thể kiểm tra.

## Prompt sử dụng

Bạn là chuyên gia SQL. Hãy tạo 3 cách tiếp cận độc lập để viết truy vấn tìm sản phẩm bán chạy trong hệ thống quản lý bán hàng, sau đó chọn truy vấn đáng tin cậy nhất.

Lược đồ:
- products(id, sku, name, category_id, sale_price, purchase_price, stock_quantity, status)
- invoices(id, invoice_date, status, total_amount)
- invoice_items(id, invoice_id, product_id, quantity, unit_price)

Yêu cầu:
- Tìm 10 sản phẩm bán chạy nhất trong khoảng :from_date đến :to_date.
- Chỉ tính hóa đơn có status = 'paid'.
- Kết quả gồm product_id, sku, name, total_quantity, total_revenue.
- Sắp xếp theo total_quantity giảm dần, nếu bằng nhau thì total_revenue giảm dần.

Quy trình:
1. Viết 3 truy vấn có cách tiếp cận khác nhau nếu hợp lý.
2. Tự kiểm tra từng truy vấn với edge case: không có hóa đơn, hóa đơn bị hủy, sản phẩm không còn kinh doanh.
3. Chọn truy vấn cuối cùng và giải thích ngắn.

Định dạng đầu ra:
1. Phương án 1
2. Phương án 2
3. Phương án 3
4. Bảng kiểm tra edge case
5. Truy vấn cuối cùng

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
