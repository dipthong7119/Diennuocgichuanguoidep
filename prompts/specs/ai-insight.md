# Đặc tả hiện hành: Phân tích và hỏi đáp AI

Tài liệu này ghi hợp đồng quan sát được trong `backend/routers/ai_insight.py`, `backend/schemas.py` và các router xác thực. Nó giúp agent hiểu hành vi hiện hữu; nếu yêu cầu mới muốn đổi hành vi, hãy cập nhật đặc tả cùng code.

## 1. Phân tích hóa đơn

### API

- `POST /ai-insight/generate`
- Payload: `ma_hoa_don`, `ma_ho`.
- Cần đăng nhập. Admin có thể phân tích mọi hộ; user thường chỉ được phân tích hộ gắn với tài khoản.
- Hóa đơn phải tồn tại và phải thuộc đúng `ma_ho` trong payload.
- Kết quả chứa mã đánh giá, mã hóa đơn, nhận xét, mức cảnh báo và dữ liệu biểu đồ.

### Dữ liệu và xử lý

- Lấy chỉ số của các đồng hồ thuộc hộ, chỉ đến kỳ hóa đơn; gom tiêu thụ điện và nước riêng biệt, trả tối đa 3 kỳ gần nhất.
- Payload gửi dịch vụ AI cho luồng này chỉ chứa dữ liệu biểu đồ theo kỳ và giá trị điện/nước; không gửi tên chủ hộ, số điện thoại, mã hộ hay mã phòng.
- Prompt hướng dẫn AI nhận xét biến động và gợi ý tiết kiệm, yêu cầu không tự tạo số liệu và không cộng kWh với m³.
- Nếu provider không có cấu hình hoặc lỗi, code có thể dùng nhận xét mẫu cục bộ.
- Mức cảnh báo tính bằng code từ mức tăng lớn nhất giữa hai kỳ gần nhất của điện hoặc nước: dưới 20% là “Bình thường”, 20–50% là “Cao”, trên 50% là “Nguy hiểm”. Khi chưa đủ hai kỳ, mức là “Bình thường”. Đây là ngưỡng của ứng dụng, không phải kết luận kỹ thuật về nguyên nhân tăng dùng.
- Kết quả mới được lưu trong `PhanTichAI`; nếu đã có bản phân tích cho hóa đơn, helper hiện tại cập nhật một bản ghi gần nhất.

## 2. Hỏi đáp có dữ liệu hộ

### API

- `POST /ai-insight/hoi-dap`
- Payload: `ma_ho`, `cau_hoi`. Câu hỏi được trim, không được rỗng và tối đa 500 ký tự.
- Cần đăng nhập. Admin có thể hỏi về mọi hộ; user thường chỉ được hỏi về hộ của mình.
- Response gồm câu hỏi, câu trả lời, số bản ghi lịch sử được dùng và nguồn tham khảo.

### Retrieval và provider

- Backend lấy tối đa 12 bản ghi chỉ số gần nhất của các đồng hồ thuộc hộ; con số này là giới hạn bản ghi chỉ số, không bảo đảm là 12 tháng.
- Prompt chứa các trường tháng, loại dịch vụ, lượng dùng và nếu có thì tổng hóa đơn/trạng thái thanh toán. Không chứa tên chủ hộ, số điện thoại, mã hộ hay mã phòng trong dữ liệu truy vấn.
- Câu hỏi tự do được ghép vào prompt. Nếu provider ngoài được cấu hình, nội dung câu hỏi và dữ liệu truy xuất sẽ rời khỏi máy chủ để xử lý; người dùng không nên gửi PII trong câu hỏi.
- Với Gemini, code bật Google Search cho tính năng hỏi đáp và trả nguồn khi response có grounding metadata. Provider khác dùng luồng gọi thông thường theo cấu hình hiện tại.
- Khi thiếu khóa hoặc lỗi, code có thể trả lời bằng fallback cục bộ. Một fallback không đồng nghĩa với kết quả đã được xác minh bởi nguồn web.

## 3. Ràng buộc khi thay đổi

- Không đưa dữ liệu của hộ khác vào kết quả retrieval.
- Không đưa định danh cá nhân vào prompt hoặc log.
- Giữ riêng biệt đơn vị điện (kWh) và nước (m³); không tạo phần trăm nếu thiếu số liệu cần thiết.
- Câu hỏi người dùng là dữ liệu, không phải chỉ thị có quyền thay thế system prompt hoặc quy tắc backend.
- Không dùng câu trả lời AI để thay đổi chỉ số, hóa đơn, phân quyền hay trạng thái thanh toán.
- Khi đổi cấu trúc prompt, provider, retrieval hoặc fallback, kiểm tra cập nhật `backend/tests/test_ai.py`, `backend/tests/test_ai_hoi_dap.py` và tài liệu này.

## 4. Các điểm cần cân nhắc nếu nâng cấp

- Bổ sung kiểm thử kiểm tra chính xác payload được gửi tới provider không có PII.
- Bổ sung giới hạn tần suất/chi phí và logging không chứa prompt nhạy cảm.
- Quyết định rõ cách xử lý kỳ thiếu một trong hai loại đồng hồ trước khi thay đổi ngưỡng cảnh báo.
- Đánh giá nội dung ngoài do Google Search trả về và câu trả lời model như dữ liệu không đáng tin; không thực thi chỉ thị trong kết quả đó.
