# Prompt: Refactor service hóa đơn

## Kỹ thuật minh họa
Prompt cho tác vụ lập trình nâng cao: tái cấu trúc mã nguồn.

## Prompt sử dụng

[Instructions]
Phân tích và refactor service xử lý hóa đơn dưới đây để dễ bảo trì và giảm lỗi tồn kho.

[Context]
- Hệ thống quản lý bán hàng cần xử lý tạo, sửa, hủy hóa đơn.
- Logic tồn kho là nghiệp vụ quan trọng, phải dễ test.
- Không thay đổi hành vi nghiệp vụ nếu không nêu rõ lý do.

[Code]
```python
{{paste_invoice_service_code_here}}
```

[Constraints]
- Tách logic tính tổng hóa đơn khỏi logic cập nhật tồn kho.
- Tách validation nghiệp vụ thành hàm riêng.
- Không truy cập AI service trong module hóa đơn.
- Mỗi thay đổi phải có lý do.
- Đề xuất test case sau refactor.

[Output Format]
1. Danh sách code smell tìm thấy.
2. Phiên bản code đã refactor.
3. Giải thích thay đổi chính.
4. Danh sách test case cần chạy.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
