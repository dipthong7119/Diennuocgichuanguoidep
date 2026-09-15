# Prompt: Gỡ lỗi sai tồn kho khi hủy hóa đơn

## Kỹ thuật minh họa
Prompt debugging có đủ trạng thái trước/sau và yêu cầu sửa có giới hạn.

## Prompt sử dụng

[Instructions]
Debug lỗi tồn kho khi hủy hóa đơn trong hệ thống quản lý bán hàng.

[Context]
- Khi tạo hóa đơn đã thanh toán, hệ thống trừ tồn kho.
- Khi hủy hóa đơn đã thanh toán, hệ thống phải cộng lại đúng số lượng đã bán.
- Lỗi hiện tại: hủy hóa đơn không hoàn tồn kho hoặc hoàn sai số lượng.

[Code liên quan]
```python
def cancel_invoice(invoice):
    invoice.status = "cancelled"
    for item in invoice.items:
        product = item.product
        product.stock_quantity -= item.quantity
    return invoice
```

[Dữ liệu gây lỗi]
- Product A tồn kho ban đầu: 12.
- Hóa đơn đã thanh toán bán Product A số lượng 2.
- Sau khi tạo hóa đơn, tồn kho đúng là 10.
- Khi hủy hóa đơn, tồn kho mong đợi là 12 nhưng thực tế là 8.

[Output Format]
Trả lời theo thứ tự:
1. Nguyên nhân lỗi.
2. Dòng code sai.
3. Code đã sửa.
4. Test case tối thiểu để bắt lỗi này.
5. Lưu ý nghiệp vụ khi hủy hóa đơn chưa thanh toán.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
