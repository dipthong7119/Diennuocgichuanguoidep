"""
database.py — Cấu hình SQLAlchemy ORM và định nghĩa 5 bảng CSDL
"""

from sqlalchemy import (
    create_engine, Column, String, Float, Integer, Boolean, Text, Date, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator

# ── Engine & Session ──────────────────────────────────────────────────────────
DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # bắt buộc với SQLite + FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────

class HoGiaDinh(Base):
    """Thông tin hộ gia đình."""
    __tablename__ = "HoGiaDinh"

    MaHo          = Column(String, primary_key=True, index=True)
    TenChuHo      = Column(String, nullable=False)
    SoDienThoai   = Column(String, nullable=False)
    MaPhong       = Column(String, nullable=False)


class DongHo(Base):
    """Đồng hồ điện/nước gắn với hộ gia đình."""
    __tablename__ = "DongHo"

    MaDongHo  = Column(String, primary_key=True, index=True)
    MaHo      = Column(String, ForeignKey("HoGiaDinh.MaHo"), nullable=False)
    Loai      = Column(String, nullable=False)   # 'Điện' hoặc 'Nước'
    DonGia    = Column(Float, nullable=False)


class ChiSoTieuThu(Base):
    """Chỉ số điện/nước đọc hàng tháng."""
    __tablename__ = "ChiSoTieuThu"

    MaChiSo   = Column(String, primary_key=True, index=True)
    MaDongHo  = Column(String, ForeignKey("DongHo.MaDongHo"), nullable=False)
    ThangNam  = Column(Date, nullable=False)
    ChiSoCu   = Column(Integer, nullable=False)
    ChiSoMoi  = Column(Integer, nullable=False)


class HoaDon(Base):
    """Hóa đơn tổng hợp theo tháng của hộ gia đình."""
    __tablename__ = "HoaDon"

    MaHoaDon              = Column(String, primary_key=True, index=True)
    MaHo                  = Column(String, ForeignKey("HoGiaDinh.MaHo"), nullable=False)
    ThangNam              = Column(Date, nullable=False)
    TongTien              = Column(Float, nullable=False, default=0.0)
    TrangThaiThanhToan    = Column(Boolean, nullable=False, default=False)


class PhanTichAI(Base):
    """Kết quả phân tích AI liên kết với hóa đơn."""
    __tablename__ = "PhanTichAI"

    MaDanhGia         = Column(String, primary_key=True, index=True)
    MaHoaDon          = Column(String, ForeignKey("HoaDon.MaHoaDon"), nullable=False)
    NoiDungNhanXet    = Column(Text, nullable=False)
    MucDoCanhBao      = Column(String, nullable=False)  # 'Bình thường' | 'Cao' | 'Nguy hiểm'


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db() -> Generator[Session, None, None]:
    """Dependency FastAPI: cung cấp DB session, đảm bảo đóng sau mỗi request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Tạo toàn bộ bảng nếu chưa tồn tại."""
    Base.metadata.create_all(bind=engine)
