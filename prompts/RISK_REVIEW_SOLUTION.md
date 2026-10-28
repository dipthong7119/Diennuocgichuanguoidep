# Rà soát rủi ro tham khảo — Snapshot hệ thống quản lý điện nước

> Đây là danh sách khởi đầu dựa trên mã nguồn được đọc khi tạo bộ tài liệu. Nó không thay thế rà soát mới; hãy kiểm tra lại nhánh và cấu hình trước khi dựa vào kết luận.

## Bảo mật và quyền riêng tư

| # | Rủi ro | Vị trí | Mức độ | Tác động | Cách xác nhận |
|---|---|---|---|---|---|
| 1 | Có tài khoản/mật khẩu demo được nạp sẵn và hiển thị trên màn hình đăng nhập | `backend/seed_data.py`, `frontend/src/components/LoginScreen.tsx` | Cao nếu dùng lại khi triển khai | Nếu giữ dữ liệu mẫu hoặc thông tin demo trên môi trường dùng thật, người ngoài có thể đăng nhập bằng tài khoản đã biết | Kiểm tra seed và quy trình triển khai; xác nhận tài khoản mẫu bị vô hiệu hóa/đổi trước khi dùng dữ liệu thật |
| 2 | Mật khẩu được băm bằng SHA-256 không salt | `backend/routers/auth.py::_hash_password`, `backend/seed_data.py` | Cao | Hash nhanh và có thể bị dò offline nếu database bị lộ; không phù hợp lưu mật khẩu người dùng | Kiểm tra thuật toán lưu và xác minh hash; thử xác định hash có salt/chi phí tính toán hay không |
| 3 | Session lưu trong dictionary của tiến trình và không có thời hạn hết hạn | `backend/routers/auth.py::sessions`, `get_current_user` | Cao | Restart làm mất phiên; nhiều worker không chia sẻ phiên; token bị lấy cắp có thể còn dùng đến khi logout/restart | Kiểm tra nơi lưu session, cấu hình hết hạn và hành vi logout/restart |
| 4 | CORS cho phép mọi origin | `backend/main.py` phần `CORSMiddleware` | Trung bình/Cao tùy triển khai | Origin được giới hạn không rõ ràng; cấu hình hiện tại không nên bê nguyên sang môi trường production | Kiểm tra `allow_origins` của môi trường chạy và thử request từ origin ngoài danh sách dự kiến |
| 5 | Frontend lưu token trong `localStorage` | `frontend/src/App.tsx`, `frontend/src/components/LoginScreen.tsx` | Trung bình | Script chạy được trong trang có thể đọc token nếu xuất hiện XSS; backend hiện dựa vào Bearer token này | Kiểm tra cách lưu phiên, CSP và khả năng chèn nội dung không tin cậy |
| 6 | Hỏi đáp có thể gửi câu hỏi tự do cùng lịch sử tiêu thụ/hóa đơn tới provider bên ngoài | `backend/routers/ai_insight.py::hoi_dap_ai`, `_goi_ai_hoi_dap` | Trung bình | Retrieval bỏ định danh hộ, nhưng người dùng vẫn có thể tự gõ PII vào câu hỏi; dữ liệu truy xuất gồm lượng dùng và một số trường hóa đơn | Cấu hình provider thật, chặn/mock tầng gọi và kiểm tra chính xác payload; xác minh thông báo quyền riêng tư phù hợp |

## Độ tin cậy và đúng nghiệp vụ

| # | Rủi ro | Vị trí | Mức độ | Tác động | Cách xác nhận |
|---|---|---|---|---|---|
| 1 | Một số lỗi provider/endpoint được ghép thông báo ngoại lệ vào nội dung trả về hoặc response API | `backend/routers/ai_insight.py::_goi_ai_raw`, các `except` trong router | Trung bình | Người dùng nhìn thấy lỗi kỹ thuật; chi tiết nội bộ có thể bị lộ và fallback khó phân biệt với nhận xét thành công | Giả lập provider trả lỗi và kiểm tra cả response người dùng lẫn log |
| 2 | Nhận xét AI có thể không chính xác; ngưỡng cảnh báo là quy tắc tăng phần trăm, không chẩn đoán nguyên nhân tiêu thụ | `backend/routers/ai_insight.py::_xac_dinh_muc_do`, `_mock_response` | Trung bình | Người dùng có thể hiểu cảnh báo “Nguy hiểm” là xác nhận rò rỉ hoặc coi gợi ý sinh tự động là tư vấn chắc chắn | Đối chiếu response với dữ liệu thiếu kỳ, kỳ tăng mạnh và kỳ có mức dùng giảm; kiểm tra nhãn UI |
| 3 | Database URL tương đối và tạo bảng bằng `create_all()` không phải cơ chế migration | `backend/database.py`, `backend/main.py::on_startup` | Trung bình | Chạy từ thư mục khác có thể mở DB khác; schema cũ không tự nhận cột mới | Chạy với working directory khác và kiểm tra DB; nâng cấp schema trên bản sao dữ liệu cũ |

## Khả năng bảo trì

| # | Rủi ro | Vị trí | Mức độ | Tác động | Cách xác nhận |
|---|---|---|---|---|---|
| 1 | Router AI tập trung prompt, provider, retrieval, fallback, rule cảnh báo, lưu DB và HTTP endpoint trong một file lớn | `backend/routers/ai_insight.py` | Trung bình | Khó thay provider, kiểm tra prompt hoặc chỉnh riêng retrieval mà không ảnh hưởng luồng khác | Theo dõi các import/phụ thuộc khi thay đổi từng trách nhiệm |
| 2 | Nhiều tài liệu hướng dẫn/đề tài trong `prompts/` mô tả các giai đoạn khác nhau; một số nội dung có thể cũ hơn code hiện tại | `prompts/*.md` | Thấp/Trung bình | Agent có thể làm theo ràng buộc cũ, ví dụ nhầm số bảng hoặc cấu trúc frontend | So sánh tài liệu với model/router/schema hiện hành trước khi sửa |

## Ghi nhận và vận hành

| # | Rủi ro | Vị trí | Mức độ | Tác động | Cách xác nhận |
|---|---|---|---|---|---|
| 1 | Ghi nhận tập trung chủ yếu ở `print`; không thấy audit log có cấu trúc cho lượt gọi AI, fallback và truy cập dữ liệu | `backend/main.py`, `backend/routers/ai_insight.py` | Trung bình | Khó điều tra phản hồi AI sai, lỗi provider hoặc hành vi bất thường sau sự cố | Gọi các nhánh thành công/lỗi/fallback và kiểm tra log vận hành có đủ thông tin mà không làm lộ PII hay prompt nhạy cảm |

## Kiểm thử

| # | Rủi ro | Vị trí | Mức độ | Tác động | Cách xác nhận |
|---|---|---|---|---|---|
| 1 | Có kiểm thử AI và phân quyền, nhưng chưa thấy kiểm thử khóa chặt payload gửi provider để chứng minh không có PII | `backend/tests/test_ai.py`, `backend/tests/test_ai_hoi_dap.py` | Cao | Thay đổi retrieval/prompt có thể vô tình thêm tên, số điện thoại hoặc mã phòng mà test hiện tại không phát hiện | Mock tầng HTTP/provider, gửi dữ liệu hộ có định danh dễ nhận biết, rồi assert payload chỉ chứa trường được phép |

## Kết luận tham khảo

Không nên coi snapshot này là sẵn sàng cho dữ liệu thật nếu chưa xử lý tài khoản demo, băm mật khẩu, vòng đời session và cấu hình CORS. Trước khi dùng tính năng AI với dữ liệu người dùng, cần thêm kiểm thử quyền riêng tư của payload và quy định rõ người dùng gửi gì tới provider bên ngoài; nội dung phân tích cũng cần được trình bày như nhận xét tham khảo.
