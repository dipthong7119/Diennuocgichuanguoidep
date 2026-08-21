"""
main.py — Entry point của ứng dụng FastAPI
Hệ thống Quản lý Hóa đơn Điện nước Hộ gia đình có tích hợp AI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
from routers import ho_gia_dinh, dong_ho, chi_so, ai_insight

# ── Khởi tạo App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Hệ thống Quản lý Hóa đơn Điện nước",
    description=(
        "Backend API cho hệ thống quản lý hóa đơn điện nước hộ gia đình "
        "có tích hợp AI phân tích tiêu thụ.\n\n"
        "**Tài liệu API đầy đủ có tại `/docs` (Swagger UI) hoặc `/redoc`.**"
    ),
    version="1.0.0",
    contact={
        "name": "Admin",
        "email": "admin@example.com",
    },
)

# ── CORS — cho phép Frontend HTML/JS gọi API ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Thay bằng domain cụ thể khi deploy production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Tạo bảng CSDL khi khởi động ──────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_tables()
    print("[OK] Da khoi tao CSDL SQLite thanh cong.")

# ── Mount Routers ─────────────────────────────────────────────────────────────
app.include_router(ho_gia_dinh.router)
app.include_router(dong_ho.router)
app.include_router(chi_so.router)
app.include_router(ai_insight.router)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"], summary="Kiểm tra server")
def root():
    return {
        "status": "ok",
        "message": "Hệ thống Quản lý Hóa đơn Điện nước đang hoạt động",
        "docs": "/docs",
    }
