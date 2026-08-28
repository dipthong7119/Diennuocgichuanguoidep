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

# ── Serve React Frontend (dist) ───────────────────────────────────────────────
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")

# Mount /assets from frontend/dist (React bundle: JS, CSS, SVG)
if os.path.isdir(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# ── Serve Frontend SPA / Index ───────────────────────────────────────────────
@app.get("/{full_path:path}", tags=["Frontend"], summary="Giao diện Frontend", include_in_schema=False)
def serve_frontend(full_path: str = ""):
    if os.path.isdir(FRONTEND_DIST):
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        react_index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(react_index):
            return FileResponse(react_index)

    return {
        "status": "ok",
        "message": "Hệ thống Quản lý Hóa đơn Điện nước đang hoạt động. Vui lòng chạy 'npm run build' trong folder frontend.",
        "docs": "/docs",
    }


# ── Chạy trực tiếp qua: python main.py ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print("🚀 Đang khởi chạy Server Hệ thống Quản lý Điện Nước:")
    print("👉 Giao diện Web/Mini App: http://127.0.0.1:8000")
    print("👉 Tài liệu Swagger API:   http://127.0.0.1:8000/docs")
    print("=" * 60 + "\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

