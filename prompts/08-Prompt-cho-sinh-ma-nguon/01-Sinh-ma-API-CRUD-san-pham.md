# Prompt: Sinh API CRUD quản lý sản phẩm

## Kỹ thuật minh họa
Prompt cho sinh mã nguồn: Instructions + tech stack + constraints + output format.

## Prompt sử dụng

[Instructions]
Tạo API CRUD quản lý sản phẩm cho hệ thống quản lý bán hàng.

[Context]
- Bạn là lập trình viên backend Python senior.
- Dự án demo dùng FastAPI, SQLAlchemy và SQLite.
- Frontend sẽ gọi API để quản lý danh mục sản phẩm.

[Constraints]
- Entity Product gồm: id, sku, name, category_id, sale_price, purchase_price, stock_quantity, status, description.
- sku và name bắt buộc.
- sale_price, purchase_price và stock_quantity không được âm.
- status chỉ nhận: active, inactive.
- API cần có các endpoint: tạo, xem danh sách, xem chi tiết, cập nhật, ngừng kinh doanh.
- Không hardcode API key hoặc cấu hình nhạy cảm.
- Trả về JSON với HTTP status code phù hợp.

[Output Format]
Trả về code gồm:
1. SQLAlchemy model.
2. Pydantic schemas.
3. FastAPI router.
4. Ghi chú ngắn cách include router vào app chính.

---

## Yêu cầu ghi kết quả

Khi thực hiện prompt này, hãy ghi toàn bộ kết quả đầu ra vào một file Markdown mới trong cùng thư mục với file prompt.

Tên file kết quả phải giữ nguyên tên file prompt hiện tại và thêm hậu tố `_ket_qua` trước phần mở rộng `.md`.

Ví dụ: nếu file prompt là `01-Vi-du-prompt.md` thì file kết quả phải là `01-Vi-du-prompt_ket_qua.md`.
