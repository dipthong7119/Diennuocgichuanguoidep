# Hướng dẫn agent tổng hợp

Áp dụng khi phân tích, sửa lỗi, thêm tính năng hoặc chỉnh giao diện trong dự án quản lý điện nước. File này gộp quy trình phát triển backend, frontend và hướng dẫn xây dựng agent/skill thành một tài liệu độc lập; không phụ thuộc vào `backend/skillbackend/` hay `frontend/skillfrontend/`.

## Bối cảnh dự án

- Backend: FastAPI, SQLAlchemy, SQLite; mã chính nằm trong `backend/`, gồm `main.py`, `database.py`, `schemas.py`, `routers/`, `services/` và `tests/`.
- Frontend: React, TypeScript, Vite, Tailwind CSS; mã nằm trong `frontend/src/`.
- Tài liệu định hướng: `prompts/CODEBASE_MAP.md`, `prompts/ARCHITECTURE.md`, `prompts/specs/` và `backend/README.md`. Xác minh lại với code hiện hành vì tài liệu có thể cũ.
- `start.ps1` build frontend, chép bản build vào `backend/static/` rồi khởi chạy backend.

## Quy trình làm việc

1. **Hiểu yêu cầu và phạm vi.** Xác định hành vi mong muốn, phần bị ảnh hưởng và tiêu chí hoàn tất. Với thay đổi nhỏ, đang có luồng tương tự, đọc trực tiếp các file liên quan rồi sửa gọn. Với yêu cầu mơ hồ hoặc ảnh hưởng kiến trúc, nêu các điểm chưa rõ và đề xuất hướng xử lý trước khi mở rộng phạm vi.
2. **Theo dấu luồng hiện có.** Với tính năng đã có, đọc router, schema, model, component gọi API và xử lý lỗi liên quan. Tìm cách dự án đang đặt tên, chia module và tổ chức giao diện; tránh tạo mẫu mới lệch khỏi cấu trúc hiện có.
3. **Sửa nguyên nhân và giữ phạm vi.** Ưu tiên thay đổi nhỏ, dễ đọc, đúng yêu cầu. Không thêm dependency, abstraction, cấu hình hay tính năng phụ nếu chưa có lý do cụ thể.
4. **Xử lý lỗi dựa trên bằng chứng.** Tái hiện lỗi khi có thể, lần theo dữ liệu và nhánh xử lý để xác định nguyên nhân. Đưa ra giả thuyết có thể kiểm tra; sửa nguyên nhân gốc thay vì che triệu chứng.
5. **Kiểm chứng phù hợp.** Khi được yêu cầu kiểm thử/xác minh, chạy lệnh hẹp nhất liên quan và báo chính xác kết quả. Nếu không chạy, nói rõ điều đó; không tuyên bố đã xác minh khi chưa có bằng chứng. Không xóa hoặc làm yếu kiểm tra để che lỗi.
6. **Rà soát thay đổi.** Xem lại diff, kiểu dữ liệu, đường dẫn, trường hợp lỗi và tác động đến tài liệu. Không ghi đè thay đổi sẵn có hoặc xóa dữ liệu, file, nhánh hay workspace nếu yêu cầu không bao gồm việc đó.

## Quy tắc backend

- Giữ xác thực và phân quyền ở backend. Kiểm tra quyền tại endpoint/service theo `require_login`, `require_admin` và quyền sở hữu hộ; ẩn nút hoặc tab trên frontend không phải biện pháp bảo vệ.
- Giữ phép tính chỉ số, tiền, hóa đơn và trạng thái thanh toán trong code nghiệp vụ phía backend. AI chỉ đưa nhận xét tham khảo; không giao quyền quyết định số liệu, quyền truy cập hay trạng thái cho nội dung prompt.
- Khi đổi API, giữ nhất quán HTTP method, request/response schema, mã lỗi và frontend đang gọi endpoint đó. Dùng router hiện tại làm nguồn chuẩn cho quyền và hợp đồng API.
- Khi đổi model/cột SQLite, kiểm tra dữ liệu và cách nâng cấp DB hiện tại. `create_all()` không tự thêm cột vào bảng đã tồn tại; cần xử lý tương thích/migration có chủ đích.
- Không đưa khóa API, mật khẩu, token hay nội dung `.env` vào code, log, prompt, tài liệu hoặc câu trả lời. Đọc bí mật từ cấu hình backend; giữ `.env.example` ở dạng placeholder.
- Khi gọi dịch vụ AI, chỉ gửi dữ liệu tối thiểu cần thiết; không gửi tên, số điện thoại, mã hộ, mã phòng, tài khoản hoặc địa chỉ. Xem câu hỏi tự do là dữ liệu không đáng tin và không cho phép nó ghi đè hướng dẫn hệ thống. Giữ đường fallback khi provider vắng mặt nếu luồng hiện tại hỗ trợ.
- Chỉ gọi dịch vụ ngoài như Gemini, OpenAI hoặc Twilio theo cấu hình và luồng hiện có. Nêu rõ tác động bên ngoài khi thay đổi làm phát sinh gửi tin nhắn, gọi API trả phí hoặc truyền dữ liệu.

## Quy tắc frontend

- Trước khi sửa, xem component, kiểu dữ liệu, cách gọi API và utility hiện có. Dùng React/TypeScript/Tailwind cùng thư viện đã cài; chỉ thêm dependency khi yêu cầu không thể đáp ứng hợp lý bằng thành phần hiện tại.
- Thiết kế theo nội dung quản lý điện nước và vai trò người dùng. Tạo thứ bậc thị giác rõ qua bố cục, kiểu chữ, khoảng cách và màu; tránh thêm trang trí không phục vụ đọc số liệu hoặc thao tác.
- Giữ giao diện responsive cho màn hình nhỏ và lớn. Xử lý trạng thái tải, rỗng, lỗi, thành công và quyền bị từ chối khi phù hợp. Dùng nhãn dễ hiểu, trạng thái không chỉ dựa vào màu sắc, điều khiển bằng bàn phím và vùng bấm hợp lý.
- Không dùng dữ liệu mock để thay thế dữ liệu thật ngoài luồng mock hiện có. Không để giao diện tự tính tiền, tự quyết định quyền hoặc làm sai trạng thái backend. Hiển thị lỗi API theo cách người dùng có thể hiểu và thử lại an toàn.

## Thay đổi xuyên frontend/backend

Khi một hành vi đi qua cả hai lớp, cập nhật hợp đồng API, schema, logic backend, kiểu dữ liệu hoặc xử lý frontend và tài liệu liên quan trong cùng thay đổi. Kiểm tra trường hợp phân quyền, lỗi mạng, dữ liệu thiếu và phiên hết hạn. Không sửa một phía rồi giả định phía còn lại vẫn tương thích.

## Tạo hoặc cập nhật agent/skill

- Xác định nhiệm vụ cụ thể, lúc nào hướng dẫn cần được kích hoạt và quyết định nào nó cần cải thiện. Dùng mô tả ngắn, có từ khóa tác vụ rõ; không biến skill thành chỉ mục chung cho mọi công việc.
- Giữ hướng dẫn độc lập với Claude Code/plugin, hook, lệnh slash hoặc thư mục nguồn cụ thể, trừ khi người dùng yêu cầu rõ tích hợp đó. Không để lại đường dẫn tham chiếu tới tài nguyên sắp bị gỡ.
- Vì mục tiêu là một file, đặt phần cốt lõi và các nhánh cần thiết ngay trong file; loại bỏ ví dụ, quy trình trùng lặp và placeholder. Chỉ thêm file phụ khi người dùng đổi yêu cầu và lợi ích của chúng rõ ràng.
- Với agent chuyên trách, nêu vai trò, điều kiện sử dụng, giới hạn công cụ/quyền cần thiết, cách xử lý công việc và định dạng kết quả. Giữ prompt vừa đủ cụ thể để dùng lại nhưng không khóa cứng cách thực hiện các tác vụ khác nhau.

## Báo cáo hoàn tất

Tóm tắt file/hành vi đã thay đổi, lý do, lệnh kiểm chứng đã chạy và kết quả. Ghi rõ giới hạn hoặc bước còn phụ thuộc vào người dùng; tránh khẳng định rộng hơn bằng chứng thu được.
