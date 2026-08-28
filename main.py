"""
main.py — Entry point của ứng dụng FastAPI
Hệ thống Quản lý Hóa đơn Điện nước Hộ gia đình có tích hợp AI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from database import create_tables
from routers import ho_gia_dinh, dong_ho, chi_so, ai_insight
from routers import auth, thong_ke

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
app.include_router(auth.router)
app.include_router(ho_gia_dinh.router)
app.include_router(dong_ho.router)
app.include_router(chi_so.router)
app.include_router(ai_insight.router)
app.include_router(thong_ke.router)

# ── Serve Static Files (CSS, JS, Assets từ Vite build) ───────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    # Mount thư mục assets (JS/CSS chunks của Vite)
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# ── Serve Frontend HTML (catch-all để React Router hoạt động) ─────────────────
@app.get("/", tags=["Frontend"], summary="Trang chủ giao diện", include_in_schema=False)
def serve_frontend():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {
        "status": "ok",
        "message": "Hệ thống Quản lý Hóa đơn Điện nước đang hoạt động",
        "docs": "/docs",
    }

@app.get("/{full_path:path}", include_in_schema=False)
def serve_spa(full_path: str):
    """Catch-all route — trả về index.html để React Router tự xử lý."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"status": "ok", "message": "API đang chạy", "docs": "/docs"}
