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
    DiaChi: Optional[str] = None
    GioiTinh: Optional[str] = None       # 'Nam' | 'Nữ' | 'Khác'
    DonGiaDien: Optional[float] = None   # Tùy chọn, mặc định 3500
    DonGiaNuoc: Optional[float] = None   # Tùy chọn, mặc định 15000

    @field_validator("GioiTinh")
    @classmethod
    def gioi_tinh_hop_le(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("Nam", "Nữ", "Khác"):
            raise ValueError("GioiTinh phải là 'Nam', 'Nữ' hoặc 'Khác'")
        return v


class HoGiaDinhUpdate(BaseModel):
    TenChuHo: Optional[str] = None
    SoDienThoai: Optional[str] = None
    MaPhong: Optional[str] = None
    DiaChi: Optional[str] = None
    GioiTinh: Optional[str] = None

    @field_validator("GioiTinh")
    @classmethod
    def gioi_tinh_hop_le(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("Nam", "Nữ", "Khác"):
            raise ValueError("GioiTinh phải là 'Nam', 'Nữ' hoặc 'Khác'")
        return v


class HoGiaDinhResponse(BaseModel):
    MaHo: str
    TenChuHo: str
    SoDienThoai: str
    MaPhong: str
    DiaChi: Optional[str] = None
    GioiTinh: Optional[str] = None

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
    # True khi đồng hồ vừa được THAY MỚI / RESET (chỉ số mới hợp lệ dù < chỉ số cũ).
    # Mặc định False → giữ nguyên ràng buộc ChiSoMoi >= ChiSoCu để chặn số liệu
    # âm/mâu thuẫn do nhập sai (đúng yêu cầu kiểm thử biên của đề tài).
    # Khai báo TRƯỚC ChiSoMoi: validator của ChiSoMoi (bên dưới) đọc info.data
    # theo đúng thứ tự khai báo field, nên ThayDongHo phải có mặt trước đó.
    ThayDongHo: bool = False
    ChiSoMoi: int

    @field_validator("ChiSoMoi")
    @classmethod
    def chi_so_moi_lon_hon(cls, v: int, info) -> int:
        chi_so_cu = info.data.get("ChiSoCu")
        thay_dong_ho = info.data.get("ThayDongHo", False)
        if chi_so_cu is not None and v < chi_so_cu and not thay_dong_ho:
            raise ValueError(
                "ChiSoMoi phải >= ChiSoCu (nếu vừa thay đồng hồ mới, "
                "hãy đánh dấu ThayDongHo=true)"
            )
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
    DuLieuBieuDo: Optional[list[int]] = None  # Mảng tiêu thụ 3 kỳ gần nhất

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# AI Hỏi-đáp có truy vấn dữ liệu (retrieval theo hộ gia đình)
# ══════════════════════════════════════════════════════════════════════════════

class AIQueryRequest(BaseModel):
    ma_ho: str
    cau_hoi: str

    @field_validator("cau_hoi")
    @classmethod
    def cau_hoi_hop_le(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Câu hỏi không được để trống")
        if len(v) > 500:
            raise ValueError("Câu hỏi quá dài (tối đa 500 ký tự)")
        return v


class AIQueryResponse(BaseModel):
    cau_hoi: str
    tra_loi: str
    so_ky_du_lieu_dung: int


# ══════════════════════════════════════════════════════════════════════════════
# Generic
# ══════════════════════════════════════════════════════════════════════════════

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
