# Bộ tài liệu hỗ trợ AI

Các file trong thư mục này giúp coding agent nắm bối cảnh dự án trước khi phân tích hoặc sửa code.

## Đọc theo mục đích

1. Bắt đầu với [CLAUDE.md](CLAUDE.md) để biết quy tắc làm việc và giới hạn dữ liệu.
2. Mở [CODEBASE_MAP.md](CODEBASE_MAP.md) để tìm file/API; mở [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu luồng hệ thống.
3. Khi sửa phân tích hoặc hỏi đáp AI, đọc [specs/ai-insight.md](specs/ai-insight.md) và dùng [evals/ai_quality_cases.md](evals/ai_quality_cases.md) để rà soát chất lượng.
4. Khi rà soát bảo mật, điền [RISK_REVIEW_TEMPLATE.md](RISK_REVIEW_TEMPLATE.md) và đối chiếu [RISK_REVIEW_SOLUTION.md](RISK_REVIEW_SOLUTION.md). Rủi ro trong bản tham khảo cần được xác nhận lại với code hiện hành.

Các tài liệu học tập khác trong `prompts/` bổ sung đề bài, rubric và nhật ký theo từng giai đoạn. Nếu tài liệu cũ mâu thuẫn với backend/frontend đang có, kiểm tra mã nguồn, schemas và kiểm thử hiện tại trước khi kết luận.
