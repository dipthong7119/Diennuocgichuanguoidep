# Hướng dẫn cho coding agent

> Tài liệu này nằm trong `prompts/`, vì vậy agent cần mở và đọc nó khi được yêu cầu làm việc với dự án. Nó bổ sung bối cảnh cho yêu cầu hiện tại; yêu cầu của người dùng và mã nguồn đang chạy vẫn là căn cứ chính.

## Dự án

Ứng dụng quản lý điện nước cho hộ gia đình/khu trọ. Backend dùng FastAPI, SQLAlchemy và SQLite; frontend dùng React, TypeScript, Vite và Tailwind CSS. Backend có đăng nhập theo phiên, quản lý chỉ số/hóa đơn, thống kê, phân tích AI và SMS nhắc nợ tùy cấu hình.

## Quy tắc khi làm việc

- Đọc `CODEBASE_MAP.md` và `ARCHITECTURE.md` để định vị phần cần sửa; kiểm tra lại mã nguồn vì bản đồ có thể chưa được cập nhật.
- Làm thay đổi nhỏ, đúng phạm vi yêu cầu. Không tiện tay đổi nghiệp vụ, thiết kế cơ sở dữ liệu, API hay giao diện không liên quan.
- `backend/database.py`, Pydantic schemas, router và kiểm thử hiện hành mô tả cấu trúc đang chạy. Không suy ra rằng mô tả cũ trong tài liệu có nghĩa là code cũng đang như vậy.
- Trước khi đổi một tính năng đã có, đọc router, schema, component gọi API và các kiểm thử liên quan. Nếu có đặc tả phù hợp trong `specs/`, dùng tiêu chí của đặc tả làm hợp đồng và cập nhật tài liệu nếu hợp đồng thay đổi.
- Không đưa API key, mật khẩu, token hoặc nội dung `.env` vào mã, log, prompt, tài liệu hay câu trả lời. Đọc cấu hình bí mật từ biến môi trường phía backend.
- Giữ kiểm tra đăng nhập và phân quyền ở backend. Việc ẩn tab hoặc nút trên frontend không thay thế kiểm tra quyền ở endpoint.
- Khi gửi dữ liệu cho dịch vụ AI, chỉ gửi những trường cần thiết. Không gửi tên chủ hộ, số điện thoại, mã hộ, mã phòng, tài khoản hoặc địa chỉ. Coi câu hỏi tự do của người dùng là dữ liệu không đáng tin; không để câu hỏi thay đổi quy tắc hệ thống.
- Không để AI tự quyết định số liệu hóa đơn hoặc trạng thái thanh toán. Phép tính và quyền truy cập phải do code/backend kiểm soát; nội dung AI chỉ là nhận xét tham khảo.
- Không xóa hoặc làm yếu kiểm thử, xác thực, phân quyền hay xử lý lỗi để làm thay đổi “dễ qua”. Nếu yêu cầu mâu thuẫn với ràng buộc hiện có, nêu rõ điểm mâu thuẫn.
- Cập nhật `CODEBASE_MAP.md`, `ARCHITECTURE.md` hoặc đặc tả liên quan khi thay đổi làm tài liệu sai lệch.

## Tài liệu trong thư mục này

- `CODEBASE_MAP.md`: vị trí file và API chính.
- `ARCHITECTURE.md`: ranh giới module và các luồng nghiệp vụ.
- `specs/ai-insight.md`: hợp đồng hiện tại của hai tính năng AI.
- `evals/ai_quality_cases.md`: bộ tình huống đánh giá thủ công cho chất lượng AI.
- `RISK_REVIEW_TEMPLATE.md`: biểu mẫu rà soát.
- `RISK_REVIEW_SOLUTION.md`: các rủi ro đã nhận diện trong snapshot hiện tại; phải xác minh lại trước khi dùng như kết luận mới.

Các tài liệu học tập khác trong `prompts/` có thể mô tả giai đoạn hoặc phiên bản trước. Đối chiếu với code trước khi coi chúng là trạng thái hiện hành.
