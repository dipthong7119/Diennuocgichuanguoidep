"""
tests/conftest.py — Fixtures dùng chung cho toàn bộ bộ test

Root cause fix: on_startup gọi create_tables() trên engine thật.
Giải pháp: tạo bảng trên in-memory engine TRƯỚC khi TestClient khởi động,
và patch create_tables để không ghi đè.
"""

import hashlib
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from database import Base, get_db, HoGiaDinh, DongHo, NguoiDung
from main import app

# ── SQLite in-memory engine (shared toàn module) ──────────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def _hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


@pytest.fixture(scope="function")
def db_session():
    """DB session in-memory, bảng được tạo trước và drop sau mỗi test."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    FastAPI TestClient dùng cùng db_session.
    Patch create_tables() để không ghi đè bảng in-memory đã tạo.
    """
    import routers.auth as auth_module
    auth_module.sessions.clear()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Patch create_tables để on_startup không tạo lại bảng trên engine thật
    with patch("main.create_tables"):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c

    app.dependency_overrides.clear()
    auth_module.sessions.clear()


@pytest.fixture(scope="function")
def seed_db(db_session):
    """
    Seed dữ liệu cơ bản:
      - admin (toàn quyền)
      - user1 → HO-001
      - HO-001 với đồng hồ điện và nước
    """
    db_session.add_all([
        NguoiDung(Username="admin", PasswordHash=_hash_pw("admin123"),
                  Role="admin", MaHo=None),
        NguoiDung(Username="user1", PasswordHash=_hash_pw("user123"),
                  Role="user", MaHo="HO-001"),
        HoGiaDinh(MaHo="HO-001", TenChuHo="Nguyen Van An",
                  SoDienThoai="0901234567", MaPhong="P101"),
        DongHo(MaDongHo="DH-D001", MaHo="HO-001", Loai="Điện", DonGia=3500.0),
        DongHo(MaDongHo="DH-N001", MaHo="HO-001", Loai="Nước", DonGia=15000.0),
    ])
    db_session.commit()
    return db_session


# ── Token helpers ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def admin_token(client, seed_db):
    """Đăng nhập admin → Bearer token."""
    res = client.post("/auth/login",
                      json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200, f"Login admin failed: {res.status_code} | {res.text}"
    return res.json()["token"]


@pytest.fixture(scope="function")
def user_token(client, seed_db):
    """Đăng nhập user1 → Bearer token."""
    res = client.post("/auth/login",
                      json={"username": "user1", "password": "user123"})
    assert res.status_code == 200, f"Login user1 failed: {res.status_code} | {res.text}"
    return res.json()["token"]


@pytest.fixture
def auth_admin(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def auth_user(user_token):
    return {"Authorization": f"Bearer {user_token}"}
