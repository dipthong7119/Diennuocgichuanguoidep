# Prompt: Sinh hàm tính tổng hóa đơn

## Kỹ thuật minh họa
Prompt sinh mã có ràng buộc input/output, validation và edge case.

## Prompt sử dụng

[Instructions]
Viết hàm Python tính tổng tiền hóa đơn bán hàng.

[Context]
- Hệ thống quản lý bán hàng cần tính tổng tiền trước khi lưu hóa đơn.
- Mỗi dòng hóa đơn gồm product_id, quantity, unit_price.
- Hóa đơn có thể có discount_amount.

[Constraints]
- Tên hàm: calculate_invoice_total.
- Tham số:
  - items: list[dict], mỗi dict có quantity và unit_price.
  - discount_amount: int hoặc float, mặc định 0.
- Không cho quantity <= 0.
- Không cho unit_price < 0.
- Không cho discount_amount < 0.
- Nếu discount_amount lớn hơn tổng tiền hàng, net_total = 0.
- Dùng type hints.
- Có docstring chuẩn Google.

[Output Format]
Chỉ trả về code Python hoàn chỉnh, không giải thích thêm.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
