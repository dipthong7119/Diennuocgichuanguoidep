Hệ thống quản lý hóa đơn điện nước hộ gia đình có tích hợp AI
1. Mô tả bài toán

Hộ gia đình, khu trọ hoặc đơn vị quản lý nhỏ cần theo dõi chỉ số điện nước, hóa đơn, thanh toán và mức tiêu thụ theo tháng. Nếu ghi chép rời rạc, khó phát hiện tiêu thụ bất thường. Hệ thống cần quản lý hóa đơn điện nước và tích hợp AI sinh nhận xét mức tiêu thụ, cảnh báo bất thường và gợi ý tiết kiệm tham khảo.
2. Mục tiêu

- Quản lý hộ/phòng, chỉ số điện nước, hóa đơn, thanh toán và báo cáo tiêu thụ.
- Tích hợp AI để phân tích tiêu thụ, cảnh báo bất thường, gợi ý tiết kiệm.
- Sử dụng AI trong SDLC và kiểm thử dữ liệu số.
3. Yêu cầu chức năng
3.1. Chức năng quản lý
1. Đăng nhập và phân quyền quản lý, người dùng/hộ.
2. Quản lý hộ/phòng và đồng hồ điện nước.
3. Nhập chỉ số điện nước theo kỳ.
4. Tính hóa đơn theo đơn giá.
5. Theo dõi thanh toán và công nợ.
6. Tra cứu lịch sử tiêu thụ.
7. Cảnh báo tiêu thụ tăng mạnh.
8. Thống kê tiêu thụ, doanh thu, công nợ.
3.2. Chức năng AI
1. AI sinh nhận xét tiêu thụ theo tháng.
2. AI cảnh báo dấu hiệu bất thường từ dữ liệu tiêu thụ.
3. AI gợi ý tiết kiệm điện nước ở mức tham khảo.
4. Yêu cầu kỹ thuật

- Backend FastAPI/Flask/Django; frontend React/Vue/HTML.
- CSDL SQLite/MySQL/PostgreSQL.
- AI Engine OpenAI/Gemini/Claude/Hugging Face/Ollama.
- Có test cho nhập chỉ số, tính hóa đơn, cảnh báo và AI.
5. Dữ liệu đầu vào, đầu ra và dữ liệu hệ thống

- Dữ liệu chính: hộ/phòng, đồng hồ, chỉ số, đơn giá, hóa đơn, thanh toán.
- Đầu vào AI: lịch sử tiêu thụ, hóa đơn, ngưỡng cảnh báo.
- Đầu ra AI: nhận xét, cảnh báo, gợi ý tiết kiệm.

Prompt mẫu:

System: Bạn là trợ lý phân tích hóa đơn điện nước. Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu.
User: Lịch sử tiêu thụ: {{utility_usage}}. Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra.
6. Hướng dẫn sử dụng AI trong từng giai đoạn SDLC

- KT1: Dùng AI phân tích chỉ số, hóa đơn, thanh toán; thiết kế CSDL.
- KT2: Dùng AI sinh CRUD hộ, chỉ số, hóa đơn; debug công thức tính.
- KT3: Dùng AI thiết kế prompt phân tích tiêu thụ; test số liệu âm/mâu thuẫn.
- Cuối kỳ: Dùng AI viết tài liệu, báo cáo, slide và hướng dẫn demo.
7. Mức độ khó

Cơ bản: Bài toán dữ liệu có cấu trúc rõ, AI chủ yếu sinh nhận xét từ báo cáo tổng hợp.
