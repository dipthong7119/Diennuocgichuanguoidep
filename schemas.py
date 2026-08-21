"""
schemas.py — Pydantic models cho request/response của toàn bộ API
"""

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


# ══════════════════════════════════════════════════════════════════════════════
# HoGiaDinh
# ══════════════════════════════════════════════════════════════════════════════

class HoGiaDinhCreate(BaseModel):
    MaHo: str
    TenChuHo: str
    SoDienThoai: str
    MaPhong: str


class HoGiaDinhUpdate(BaseModel):
    TenChuHo: Optional[str] = None
    SoDienThoai: Optional[str] = None
    MaPhong: Optional[str] = None


class HoGiaDinhResponse(BaseModel):
    MaHo: str
    TenChuHo: str
    SoDienThoai: str
    MaPhong: str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# DongHo
# ══════════════════════════════════════════════════════════════════════════════

class DongHoCreate(BaseModel):
    MaDongHo: str
    MaHo: str
    Loai: str   # 'Điện' hoặc 'Nước'
    DonGia: float

    @field_validator("Loai")
    @classmethod
    def loai_hop_le(cls, v: str) -> str:
        if v not in ("Điện", "Nước"):
            raise ValueError("Loai phải là 'Điện' hoặc 'Nước'")
        return v

    @field_validator("DonGia")
    @classmethod
    def don_gia_duong(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("DonGia phải lớn hơn 0")
        return v


class DongHoUpdate(BaseModel):
    Loai: Optional[str] = None
    DonGia: Optional[float] = None

    @field_validator("Loai")
    @classmethod
    def loai_hop_le(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("Điện", "Nước"):
            raise ValueError("Loai phải là 'Điện' hoặc 'Nước'")
        return v


class DongHoResponse(BaseModel):
    MaDongHo: str
    MaHo: str
    Loai: str
    DonGia: float

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# ChiSoTieuThu
# ══════════════════════════════════════════════════════════════════════════════

class ChiSoCreate(BaseModel):
    MaChiSo: str
    MaDongHo: str
    ThangNam: date
    ChiSoCu: int
    ChiSoMoi: int

    @field_validator("ChiSoMoi")
    @classmethod
    def chi_so_moi_lon_hon(cls, v: int, info) -> int:
        chi_so_cu = info.data.get("ChiSoCu")
        if chi_so_cu is not None and v < chi_so_cu:
            raise ValueError("ChiSoMoi phải >= ChiSoCu")
        return v

    @field_validator("ChiSoCu", "ChiSoMoi")
    @classmethod
    def chi_so_khong_am(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Chỉ số không được âm")
        return v


class ChiSoResponse(BaseModel):
    MaChiSo: str
    MaDongHo: str
    ThangNam: date
    ChiSoCu: int
    ChiSoMoi: int

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# HoaDon
# ══════════════════════════════════════════════════════════════════════════════

class HoaDonResponse(BaseModel):
    MaHoaDon: str
    MaHo: str
    ThangNam: date
    TongTien: float
    TrangThaiThanhToan: bool

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# PhanTichAI
# ══════════════════════════════════════════════════════════════════════════════

class AIInsightRequest(BaseModel):
    ma_hoa_don: str
    ma_ho: str


class AIInsightResponse(BaseModel):
    MaDanhGia: str
    MaHoaDon: str
    NoiDungNhanXet: str
    MucDoCanhBao: str

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# Generic
# ══════════════════════════════════════════════════════════════════════════════

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
