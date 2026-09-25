 Rubric chung cho ngân hàng đề tài dự án

Rubric này áp dụng cho toàn bộ đề tài trong `output/projectbank/`. Mỗi đề tài đều là một hệ thống phần mềm quản lý có tích hợp tối thiểu một chức năng AI tạo sinh. Tiêu chí đánh giá nhấn mạnh hai vai trò của AI: công cụ hỗ trợ phát triển phần mềm trong SDLC và thành phần thông minh được tích hợp vào sản phẩm cuối cùng.

 Bài kiểm tra 1: Phân tích yêu cầu, thiết kế hệ thống và xác định vị trí ứng dụng AI

| TT | Mức độ | Tiêu chí | Mô tả |
|----|--------|----------|-------|
| 1 | Biết | Phân tích đúng bài toán quản lý | Xác định rõ bối cảnh, người dùng, dữ liệu, quy trình nghiệp vụ và vấn đề cần giải quyết. |
| 2 | Biết | Xác định đầy đủ yêu cầu chức năng | Liệt kê chức năng quản lý cốt lõi phù hợp với đề tài, có mô tả đầu vào, xử lý và đầu ra. |
| 3 | Hiểu | Xác định yêu cầu phi chức năng | Nêu yêu cầu về bảo mật, hiệu năng, khả dụng, sao lưu, phân quyền và trải nghiệm người dùng. |
| 4 | Hiểu | Thiết kế actor và use case | Xác định actor chính, use case chính và có sơ đồ Use Case hoặc mô tả tương đương. |
| 5 | Hiểu | Thiết kế cơ sở dữ liệu | Có ERD, bảng dữ liệu, khóa chính/khóa ngoại, ràng buộc và giải thích quan hệ. |
| 6 | Hiểu | Thiết kế kiến trúc hệ thống | Mô tả kiến trúc frontend, backend, database, AI service và luồng dữ liệu chính. |
| 7 | Vận dụng | Xác định vị trí ứng dụng AI | Chọn chức năng AI hợp lý, gắn với dữ liệu và nhu cầu thực tế của hệ thống. |
| 8 | Vận dụng | Thiết kế prompt và luồng gọi AI sơ bộ | Có system prompt, user prompt mẫu, input/output format, ràng buộc và giới hạn. |
| 9 | Vận dụng | Minh chứng sử dụng AI trong phân tích và thiết kế | Lưu prompt, phản hồi AI và nhận xét cách sinh viên kiểm chứng/chỉnh sửa kết quả AI. |
| 10 | Vận dụng | Tài liệu phân tích thiết kế | Tài liệu rõ ràng, có cấu trúc, có kế hoạch triển khai các giai đoạn tiếp theo. |
 Bài kiểm tra 2: Xây dựng chức năng quản lý và minh chứng sử dụng AI trong lập trình

| TT | Mức độ | Tiêu chí | Mô tả |
|----|--------|----------|-------|
| 1 | Biết | Cấu trúc dự án hợp lý | Dự án tổ chức rõ ràng theo frontend/backend/database/config/docs hoặc cấu trúc phù hợp framework. |
| 2 | Biết | Xây dựng chức năng đăng nhập và phân quyền | Có xác thực người dùng, phân quyền vai trò và bảo vệ các chức năng quan trọng. |
| 3 | Hiểu | Hoàn thiện CRUD nghiệp vụ chính | Các chức năng thêm, xem, sửa, xóa dữ liệu chính hoạt động đúng. |
| 4 | Hiểu | Xây dựng chức năng tìm kiếm và lọc | Cho phép tìm kiếm, lọc, sắp xếp dữ liệu theo tiêu chí phù hợp. |
| 5 | Hiểu | Xây dựng thống kê/báo cáo cơ bản | Có báo cáo hoặc dashboard phục vụ nghiệp vụ của hệ thống. |
| 6 | Hiểu | Thiết kế giao diện rõ ràng, dễ sử dụng | Giao diện nhất quán, dễ thao tác, có thông báo lỗi và phản hồi người dùng. |
| 7 | Vận dụng | Kết nối và thao tác CSDL ổn định | Lưu, đọc, cập nhật, xóa dữ liệu chính xác; có dữ liệu mẫu để demo. |
| 8 | Vận dụng | Xử lý lỗi cơ bản | Xử lý input sai, dữ liệu thiếu, lỗi truy vấn, lỗi phân quyền; không để ứng dụng crash. |
| 9 | Vận dụng | Minh chứng sử dụng AI khi lập trình | Có nhật ký prompt, phản hồi AI, phần code được hỗ trợ và phần sinh viên đã kiểm tra/chỉnh sửa. |
| 10 | Vận dụng | Quản lý mã nguồn và tài liệu chạy thử | Có README, hướng dẫn cài đặt/chạy, `.env.example`, commit rõ ràng. |
 Bài kiểm tra 3: Tích hợp chức năng AI, tối ưu prompt và kiểm thử

| TT | Mức độ | Tiêu chí | Mô tả |
|----|--------|----------|-------|
| 1 | Biết | Tích hợp được chức năng AI vào hệ thống | Chức năng AI chạy trong hệ thống, phục vụ nghiệp vụ cụ thể, không tách rời sản phẩm. |
| 2 | Biết | Kết nối API/model AI đúng cách | Gọi được OpenAI/Gemini/Claude/Hugging Face/Ollama hoặc mô hình tương đương; bảo vệ API key. |
| 3 | Hiểu | Thiết kế prompt có hệ thống | Prompt tách khỏi code, có system/user prompt, ràng buộc output và hướng dẫn xử lý dữ liệu. |
| 4 | Hiểu | Tối ưu prompt qua thử nghiệm | Có ít nhất 3 vòng thử nghiệm hoặc so sánh prompt/model, ghi nhận kết quả và cải tiến. |
| 5 | Hiểu | Sử dụng dữ liệu hệ thống trong chức năng AI | AI khai thác dữ liệu phù hợp từ CSDL, file hoặc báo cáo; có kiểm soát quyền truy cập dữ liệu. |
| 6 | Hiểu | Hiển thị kết quả AI rõ ràng | Kết quả AI được trình bày dễ hiểu, có định dạng phù hợp và có cảnh báo khi cần. |
| 7 | Vận dụng | Xử lý lỗi và giới hạn AI | Xử lý timeout, rate limit, response rỗng/sai định dạng, dữ liệu quá dài, lỗi model. |
| 8 | Vận dụng | Kiểm thử chức năng quản lý và chức năng AI | Có test case, manual test hoặc script test; bao gồm trường hợp đúng, sai và biên. |
| 9 | Vận dụng | Review code và cải thiện chất lượng bằng AI | Có minh chứng dùng AI để review code, phát hiện lỗi, refactor hoặc cải thiện bảo mật. |
| 10 | Vận dụng | Tích hợp chức năng AI với trải nghiệm người dùng | Luồng sử dụng AI tự nhiên, hữu ích, không gây nhầm lẫn với chức năng quản lý chính. |
 Bài thi cuối kỳ: Hoàn thiện hệ thống, chất lượng phần mềm, chất lượng AI và báo cáo

| TT | Mức độ | Tiêu chí | Mô tả |
|----|--------|----------|-------|
| 1 | Biết | Hoàn thiện chức năng hệ thống | Các chức năng quản lý và chức năng AI hoạt động đầy đủ, ổn định, đúng yêu cầu. |
| 2 | Biết | Chất lượng kiến trúc và mã nguồn | Code rõ ràng, module hóa, dễ bảo trì, tuân thủ quy ước của framework/ngôn ngữ. |
| 3 | Hiểu | Chất lượng cơ sở dữ liệu | CSDL hợp lý, dữ liệu nhất quán, có ràng buộc, dữ liệu mẫu và khả năng sao lưu/khôi phục cơ bản. |
| 4 | Hiểu | Chất lượng giao diện và trải nghiệm người dùng | Giao diện dễ dùng, nhất quán, responsive ở mức phù hợp, có phản hồi thao tác và thông báo lỗi. |
| 5 | Hiểu | Chất lượng chức năng AI | Kết quả AI hữu ích, đúng ngữ cảnh, có kiểm soát sai lệch, có giới hạn và cảnh báo rõ. |
| 6 | Hiểu | Bảo mật, quyền riêng tư và đạo đức AI | Bảo vệ tài khoản, phân quyền dữ liệu, không lộ API key, cân nhắc dữ liệu nhạy cảm khi gọi AI. |
| 7 | Vận dụng | Hiệu năng và độ ổn định | Ứng dụng phản hồi hợp lý, xử lý được dữ liệu demo, có cơ chế tránh lỗi lặp lại hoặc lỗi do AI. |
| 8 | Vận dụng | Triển khai và đóng gói | Có hướng dẫn triển khai, cấu hình môi trường, dữ liệu mẫu; khuyến khích Docker hoặc cloud demo. |
| 9 | Vận dụng | Báo cáo kỹ thuật đầy đủ | Báo cáo mô tả phân tích, thiết kế, triển khai, kiểm thử, chức năng AI và vai trò của AI trong SDLC. |
| 10 | Vận dụng | Thuyết trình và demo | Demo mạch lạc, trình bày rõ chức năng quản lý, chức năng AI, minh chứng sử dụng AI và trả lời câu hỏi tốt. |
 Gợi ý minh chứng bắt buộc

- Nhật ký sử dụng AI theo từng giai đoạn: prompt, phản hồi, phần được dùng, phần đã chỉnh sửa.
- Tài liệu phân tích thiết kế: use case, ERD, kiến trúc, vị trí tích hợp AI.
- Mã nguồn và lịch sử commit.
- Test case hoặc biên bản kiểm thử.
- Dữ liệu mẫu để demo.
- Báo cáo chất lượng chức năng AI: prompt, kết quả thử nghiệm, lỗi/giới hạn, biện pháp kiểm soát.
