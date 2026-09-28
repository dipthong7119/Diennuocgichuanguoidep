"""
routers/auth.py — Xác thực đơn giản (session-based) cho demo
"""

import uuid
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db, NguoiDung, HoGiaDinh

router = APIRouter(prefix="/auth", tags=["Xác Thực"])

# ── In-memory session store (đủ cho demo) ────────────────────────────────────
sessions: dict = {}


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    token: str
    username: str
    role: str
    ma_ho: Optional[str] = None


class UserInfo(BaseModel):
    username: str
    role: str
    ma_ho: Optional[str] = None


def _hash_password(password: str) -> str:
    """Hash mật khẩu bằng SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()


def get_current_user(request: Request) -> Optional[dict]:
    """Lấy user hiện tại từ session token (trả về None nếu chưa đăng nhập)."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token and token in sessions:
        return sessions[token]
    return None


def require_login(request: Request) -> dict:
    """Dependency: bắt buộc phải đăng nhập. Raise 401 nếu chưa có token hợp lệ."""
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa đăng nhập hoặc phiên đã hết hạn"
        )
    return user


def require_admin(request: Request) -> dict:
    """Dependency: bắt buộc phải là admin. Raise 403 nếu là user thường."""
    user = require_login(request)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có quyền thực hiện thao tác này"
        )
    return user


@router.get("/users", summary="Danh sách tài khoản và thông tin người dùng (chỉ admin)")
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """Trả thông tin tài khoản và hộ liên kết, tuyệt đối không trả mật khẩu/hash."""
    rows = (
        db.query(NguoiDung, HoGiaDinh)
        .outerjoin(HoGiaDinh, NguoiDung.MaHo == HoGiaDinh.MaHo)
        .order_by(NguoiDung.Role, NguoiDung.Username)
        .all()
    )
    return [
        {
            "username": user.Username,
            "role": user.Role,
            "ma_ho": user.MaHo,
            "ten_nguoi_dung": household.TenChuHo if household else user.Username,
            "ma_phong": household.MaPhong if household else None,
            "so_dien_thoai": household.SoDienThoai if household else None,
            "dia_chi": household.DiaChi if household else None,
        }
        for user, household in rows
    ]


@router.post("/login", response_model=LoginResponse, summary="Đăng nhập")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập bằng username/password. Trả về session token."""
    try:
        user = db.query(NguoiDung).filter(
            NguoiDung.Username == payload.username
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

        hashed = _hash_password(payload.password)
        if user.PasswordHash != hashed:
            raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

        # Tạo session token — lưu cả ma_ho để dùng khi phân quyền
        token = f"session-{uuid.uuid4().hex}"
        sessions[token] = {
            "username": user.Username,
            "role": user.Role,
            "ma_ho": user.MaHo,  # None với admin, mã phòng với user thường
        }

        return {
            "message": "Đăng nhập thành công",
            "token": token,
            "username": user.Username,
            "role": user.Role,
            "ma_ho": user.MaHo,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xác thực: {str(e)}")


@router.post("/logout", summary="Đăng xuất")
def logout(request: Request):
    """Đăng xuất và xóa session."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token in sessions:
        del sessions[token]
    return {"message": "Đăng xuất thành công"}


@router.get("/me", response_model=UserInfo, summary="Kiểm tra phiên đăng nhập")
def check_session(request: Request):
    """Kiểm tra token hiện tại có hợp lệ không."""
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập hoặc phiên đã hết hạn")
    return user
