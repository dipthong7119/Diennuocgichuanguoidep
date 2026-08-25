# Prompt: Sinh test cho hóa đơn và tồn kho

## Kỹ thuật minh họa
Prompt sinh kiểm thử: Code/nghiệp vụ + loại test cụ thể + tool test.

## Prompt sử dụng

[Instructions]
Viết test case bằng pytest cho nghiệp vụ hóa đơn và tồn kho trong hệ thống quản lý bán hàng.

[Business Rules]
- Khi tạo hóa đơn đã thanh toán, tồn kho giảm theo số lượng bán.
- Không cho bán vượt tồn kho.
- Khi sửa hóa đơn đã thanh toán, tồn kho chỉ thay đổi theo phần chênh lệch số lượng.
- Khi hủy hóa đơn đã thanh toán, tồn kho được hoàn lại.
- Không cho quantity <= 0.

[Test Requirements]
- Bao phủ happy path, edge case và error case.
- Mỗi test có tên rõ nghĩa.
- Dùng dữ liệu mẫu: Tai nghe Bluetooth A1, giá 350000, tồn kho ban đầu 12.
- Không phụ thuộc CSDL thật; có thể dùng object giả hoặc fixture đơn giản.

[Output Format]
Trả về code pytest hoàn chỉnh gồm:
1. Fixture dữ liệu mẫu.
2. Test tạo hóa đơn.
3. Test bán vượt tồn kho.
4. Test sửa hóa đơn tăng/giảm số lượng.
5. Test hủy hóa đơn.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
