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

# ── Serve Static Files (hỗ trợ cả static/ và frontend/dist/) ─────────────────
# Ưu tiên 1: thư mục static/ (khi dùng start.ps1 build+copy)
# Ưu tiên 2: thư mục frontend/dist/ (khi npm run build trực tiếp)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")

def _get_serve_dir():
    """Trả về thư mục frontend để serve, ưu tiên static/ trước."""
    if os.path.isdir(STATIC_DIR) and os.path.isfile(os.path.join(STATIC_DIR, "index.html")):
        return STATIC_DIR
    if os.path.isdir(FRONTEND_DIST) and os.path.isfile(os.path.join(FRONTEND_DIST, "index.html")):
        return FRONTEND_DIST
    return None

# Mount /assets từ thư mục được chọn
serve_dir = _get_serve_dir()
if serve_dir:
    assets_dir = os.path.join(serve_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# ── Serve Frontend HTML (catch-all để React Router hoạt động) ─────────────────
@app.get("/", tags=["Frontend"], summary="Trang chủ giao diện", include_in_schema=False)
def serve_frontend():
    d = _get_serve_dir()
    if d:
        return FileResponse(os.path.join(d, "index.html"))
    return {
        "status": "ok",
        "message": "Hệ thống Quản lý Hóa đơn Điện nước đang hoạt động. Chạy '.\\start.ps1' hoặc 'npm run build' trong frontend/.",
        "docs": "/docs",
    }

@app.get("/{full_path:path}", include_in_schema=False)
def serve_spa(full_path: str):
    """Catch-all route — trả về index.html để React Router tự xử lý."""
    d = _get_serve_dir()
    if d:
        # Kiểm tra file tĩnh (favicon, icons, etc.)
        target = os.path.join(d, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(d, "index.html"))
    return {"status": "ok", "message": "API đang chạy", "docs": "/docs"}


# ── Chạy trực tiếp qua: python main.py ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print("🚀 Đang khởi chạy Server Hệ thống Quản lý Điện Nước:")
    print("👉 Giao diện Web/Mini App: http://127.0.0.1:8000")
    print("👉 Tài liệu Swagger API:   http://127.0.0.1:8000/docs")
    print("=" * 60 + "\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
