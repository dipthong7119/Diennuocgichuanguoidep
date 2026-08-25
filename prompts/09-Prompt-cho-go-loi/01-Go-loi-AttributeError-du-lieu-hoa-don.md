# Prompt: Gỡ lỗi AttributeError trong dữ liệu hóa đơn

## Kỹ thuật minh họa
Prompt debugging: Code + Input gây lỗi + Error Message + Output Format.

## Prompt sử dụng

[Instructions]
Phân tích lỗi trong đoạn code Python dưới đây. Xác định nguyên nhân gốc rễ, đề xuất cách sửa nhỏ nhất và viết test case phòng tránh lỗi.

[Code]
```python
def calculate_total(items):
    total = 0
    for item in items:
        total += item.quantity * item.unit_price
    return total
```

[Input gây lỗi]
```python
items = [
    InvoiceItem(quantity=2, unit_price=350000),
    None,
    InvoiceItem(quantity=1, unit_price=120000)
]
calculate_total(items)
```

[Error Message]
AttributeError: 'NoneType' object has no attribute 'quantity'

[Context]
- Hàm dùng trong hệ thống quản lý bán hàng.
- Không được bỏ qua dòng lỗi một cách im lặng nếu dữ liệu hóa đơn không hợp lệ.

[Output Format]
1. Nguyên nhân gốc rễ.
2. Code đã sửa.
3. Giải thích vì sao cách sửa phù hợp.
4. 3 test case với pytest.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
