# Prompt: Debug bằng vòng lặp ReAct

## Kỹ thuật minh họa
ReAct: Reasoning + Acting + Observation cho tác vụ cần chạy lệnh, xem lỗi và sửa.

## Prompt sử dụng

Bạn là trợ lý lập trình làm việc theo ReAct. Hãy debug lỗi cập nhật tồn kho trong dự án quản lý bán hàng bằng vòng lặp Suy luận - Hành động - Quan sát.

Bối cảnh:
- Backend dùng Python.
- Có chức năng tạo, sửa, hủy hóa đơn.
- Lỗi nghi ngờ nằm ở logic cập nhật tồn kho.
- Bạn được phép đề xuất các hành động như đọc file, chạy test, thêm test, chạy lại test.

Quy tắc ReAct:
- Mỗi vòng gồm:
  - Suy luận: nêu giả thuyết ngắn.
  - Hành động: nêu thao tác cần thực hiện.
  - Quan sát: ghi kết quả mong đợi hoặc kết quả thực tế nếu có.
- Không kết luận trước khi có đủ quan sát.
- Nếu phát hiện lỗi, đề xuất bản sửa nhỏ nhất và test xác nhận.

Đầu vào cần tôi cung cấp:
- Cấu trúc thư mục backend.
- File xử lý hóa đơn/tồn kho.
- Error message hoặc test case đang fail.

Định dạng đầu ra:
1. Kế hoạch ReAct ban đầu.
2. Các vòng ReAct.
3. Nguyên nhân gốc rễ.
4. Bản sửa đề xuất.
5. Test xác nhận.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
