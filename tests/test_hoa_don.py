"""
tests/test_hoa_don.py — Test hóa đơn: tính tiền, thanh toán, phân quyền

Bao gồm:
  - Xem danh sách hóa đơn theo hộ (GET /chi-so/hoa-don/{ma_ho})
  - Thanh toán hóa đơn (PATCH /chi-so/hoa-don/{id}/thanh-toan)
  - User chỉ thanh toán hóa đơn của chính mình
  - Không thể thanh toán hóa đơn đã thanh toán (idempotent)
"""

import pytest
from datetime import date
from database import HoaDon, HoGiaDinh, DongHo, NguoiDung
import hashlib


def _hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


# ══════════════════════════════════════════════════════════════════════════════
# Fixtures bổ sung
# ══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def hoa_don_chua_tt(seed_db):
    """Tạo 1 hóa đơn chưa thanh toán cho HO-001."""
    hd = HoaDon(
        MaHoaDon="HD-TEST01",
        MaHo="HO-001",
        ThangNam=date(2026, 8, 1),
        TongTien=295_000.0,
        TrangThaiThanhToan=False,
    )
    seed_db.add(hd)
    seed_db.commit()
    return hd


@pytest.fixture
def hoa_don_da_tt(seed_db):
    """Tạo 1 hóa đơn đã thanh toán cho HO-001."""
    hd = HoaDon(
        MaHoaDon="HD-TEST02",
        MaHo="HO-001",
        ThangNam=date(2026, 7, 1),
        TongTien=200_000.0,
        TrangThaiThanhToan=True,
    )
    seed_db.add(hd)
    seed_db.commit()
    return hd


@pytest.fixture
def hoa_don_ho_khac(seed_db):
    """Tạo hóa đơn của HO-002 (không phải phòng của user1)."""
    seed_db.add_all([
        NguoiDung(Username="user2", PasswordHash=_hash_pw("user456"),
                  Role="user", MaHo="HO-002"),
        HoGiaDinh(MaHo="HO-002", TenChuHo="Người khác",
                  SoDienThoai="0999", MaPhong="P999"),
    ])
    hd = HoaDon(
        MaHoaDon="HD-TEST03",
        MaHo="HO-002",
        ThangNam=date(2026, 8, 1),
        TongTien=150_000.0,
        TrangThaiThanhToan=False,
    )
    seed_db.add(hd)
    seed_db.commit()
    return hd


# ══════════════════════════════════════════════════════════════════════════════
# Test xem hóa đơn
# ══════════════════════════════════════════════════════════════════════════════

class TestXemHoaDon:

    def test_admin_xem_hoa_don_bat_ky_ho(self, client, hoa_don_chua_tt, auth_admin):
        """Admin GET /chi-so/hoa-don/HO-001 → 200, trả list."""
        res = client.get("/chi-so/hoa-don/HO-001", headers=auth_admin)
        assert res.status_code == 200
        assert len(res.json()) >= 1

    def test_user_xem_hoa_don_phong_minh(self, client, hoa_don_chua_tt, auth_user):
        """User1 xem hóa đơn phòng mình → 200."""
        res = client.get("/chi-so/hoa-don/HO-001", headers=auth_user)
        assert res.status_code == 200

    def test_user_khong_xem_duoc_phong_khac(self, client, hoa_don_ho_khac, auth_user):
        """User1 xem hóa đơn HO-002 → 403 Forbidden."""
        res = client.get("/chi-so/hoa-don/HO-002", headers=auth_user)
        assert res.status_code == 403

    def test_hoa_don_chua_thanh_toan_dung(self, client, hoa_don_chua_tt, auth_admin):
        """Hóa đơn trả về có TrangThaiThanhToan = False."""
        res = client.get("/chi-so/hoa-don/HO-001", headers=auth_admin)
        hds = res.json()
        chua_tt = [hd for hd in hds if hd["MaHoaDon"] == "HD-TEST01"]
        assert len(chua_tt) == 1
        assert chua_tt[0]["TrangThaiThanhToan"] is False

    def test_tong_tien_dung(self, client, hoa_don_chua_tt, auth_admin):
        """TongTien trong response khớp với giá trị seed."""
        res = client.get("/chi-so/hoa-don/HO-001", headers=auth_admin)
        hds = res.json()
        target = next(h for h in hds if h["MaHoaDon"] == "HD-TEST01")
        assert target["TongTien"] == pytest.approx(295_000.0)


# ══════════════════════════════════════════════════════════════════════════════
# Test thanh toán hóa đơn
# ══════════════════════════════════════════════════════════════════════════════

class TestThanhToanHoaDon:

    def test_admin_thanh_toan_thanh_cong(self, client, hoa_don_chua_tt, auth_admin):
        """Admin PATCH thanh toán → 200, TrangThaiThanhToan = True."""
        res = client.patch("/chi-so/hoa-don/HD-TEST01/thanh-toan", headers=auth_admin)
        assert res.status_code == 200
        assert res.json()["TrangThaiThanhToan"] is True

    def test_user_thanh_toan_hoa_don_chinh_minh(self, client, hoa_don_chua_tt, auth_user):
        """User1 thanh toán hóa đơn phòng mình → 200."""
        res = client.patch("/chi-so/hoa-don/HD-TEST01/thanh-toan", headers=auth_user)
        assert res.status_code == 200
        assert res.json()["TrangThaiThanhToan"] is True

    def test_user_khong_thanh_toan_phong_khac(self, client, hoa_don_ho_khac, auth_user):
        """User1 cố thanh toán hóa đơn của HO-002 → 403 Forbidden."""
        res = client.patch("/chi-so/hoa-don/HD-TEST03/thanh-toan", headers=auth_user)
        assert res.status_code == 403

    def test_hoa_don_khong_ton_tai_tra_404(self, client, seed_db, auth_admin):
        """Thanh toán MaHoaDon không tồn tại → 404."""
        res = client.patch("/chi-so/hoa-don/HD-KHONG-CO/thanh-toan", headers=auth_admin)
        assert res.status_code == 404

    def test_thanh_toan_da_thanh_toan_van_200(self, client, hoa_don_da_tt, auth_admin):
        """Thanh toán lần 2 (idempotent) vẫn trả 200, TrangThaiThanhToan = True."""
        res = client.patch("/chi-so/hoa-don/HD-TEST02/thanh-toan", headers=auth_admin)
        assert res.status_code == 200
        assert res.json()["TrangThaiThanhToan"] is True

    def test_chua_dang_nhap_tra_401(self, client, hoa_don_chua_tt):
        """Không token → 401."""
        res = client.patch("/chi-so/hoa-don/HD-TEST01/thanh-toan")
        assert res.status_code == 401
