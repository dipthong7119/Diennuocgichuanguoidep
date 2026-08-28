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

# ── Serve Frontend (từ folder frontend/dist sau khi build) ───────────────────
BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.isdir(FRONTEND_DIST):
    # Serve assets (JS, CSS, images...) tại /assets
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve toàn bộ dist (bao gồm các file tĩnh khác)
    app.mount("/dist", StaticFiles(directory=FRONTEND_DIST), name="dist")

# ── Route / → trả về index.html từ frontend/dist ────────────────────────────
@app.get("/", tags=["Frontend"], summary="Trang chủ giao diện", include_in_schema=False)
def serve_frontend():
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {
        "status": "ok",
        "message": "Hệ thống Quản lý Hóa đơn Điện nước đang hoạt động. "
                   "Chạy 'npm run build' trong thư mục frontend/ để build giao diện.",
        "docs": "/docs",
    }

# ── Catch-all: trả index.html cho SPA routing ───────────────────────────────
@app.get("/{full_path:path}", tags=["Frontend"], include_in_schema=False)
def spa_fallback(full_path: str):
    """Fallback cho React Router — mọi route không khớp API đều trả index.html."""
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend chưa được build. Chạy 'npm run build' trong frontend/"}
