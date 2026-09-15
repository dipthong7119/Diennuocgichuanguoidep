"""
tests/test_chi_so.py — Test nhập chỉ số điện/nước và tính hóa đơn

Bao gồm:
  - Kiểm tra công thức tính tiền đúng
  - Validate ChiSoMoi >= ChiSoCu (pydantic)
  - Validate chỉ số không âm
  - Tạo hóa đơn mới khi chưa có
  - Cộng dồn hóa đơn khi đã tồn tại tháng đó
  - Kiểm tra trùng MaChiSo
  - Kiểm tra phân quyền (user thường không nhập được)
"""

import pytest
from datetime import date


# ══════════════════════════════════════════════════════════════════════════════
# Unit test: hàm tính tiền thuần (không cần DB)
# ══════════════════════════════════════════════════════════════════════════════

class TestTinhTongTien:
    """Test hàm _tinh_tong_tien độc lập với DB."""

    def _tinh(self, cu: int, moi: int, don_gia: float) -> float:
        from routers.chi_so import _tinh_tong_tien
        return _tinh_tong_tien(cu, moi, don_gia)

    def test_tinh_dung_cong_thuc(self):
        """(ChiSoMoi - ChiSoCu) * DonGia phải đúng."""
        assert self._tinh(100, 150, 3500.0) == 175_000.0

    def test_tieu_thu_bang_0(self):
        """Chỉ số bằng nhau → tiền = 0."""
        assert self._tinh(200, 200, 3500.0) == 0.0

    def test_don_gia_nuoc(self):
        """Kiểm tra với đơn giá nước."""
        assert self._tinh(10, 18, 15_000.0) == 120_000.0

    def test_tieu_thu_lon(self):
        """Tiêu thụ lớn tính đúng."""
        assert self._tinh(0, 1000, 3500.0) == 3_500_000.0


# ══════════════════════════════════════════════════════════════════════════════
# Unit test: Pydantic schema validation
# ══════════════════════════════════════════════════════════════════════════════

class TestChiSoSchemaValidation:
    """Test validation ở tầng Pydantic schema."""

    def _make(self, cu: int, moi: int):
        from schemas import ChiSoCreate
        return ChiSoCreate(
            MaChiSo="CS-TEST",
            MaDongHo="DH-D001",
            ThangNam=date(2026, 8, 1),
            ChiSoCu=cu,
            ChiSoMoi=moi,
        )

    def test_chi_so_moi_nho_hon_cu_raise_error(self):
        """ChiSoMoi < ChiSoCu phải raise ValueError."""
        import pytest
        with pytest.raises(Exception, match="ChiSoMoi phải"):
            self._make(cu=200, moi=150)

    def test_chi_so_am_raise_error(self):
        """Chỉ số âm phải raise ValueError."""
        with pytest.raises(Exception):
            self._make(cu=-10, moi=50)

    def test_chi_so_bang_nhau_hop_le(self):
        """ChiSoMoi == ChiSoCu là hợp lệ (tiêu thụ = 0)."""
        obj = self._make(cu=100, moi=100)
        assert obj.ChiSoCu == obj.ChiSoMoi

    def test_chi_so_moi_lon_hon_cu_hop_le(self):
        """ChiSoMoi > ChiSoCu là hợp lệ."""
        obj = self._make(cu=100, moi=200)
        assert obj.ChiSoMoi == 200


# ══════════════════════════════════════════════════════════════════════════════
# Integration test: API endpoint
# ══════════════════════════════════════════════════════════════════════════════

class TestNhapChiSoAPI:
    """Integration test: POST /chi-so/ qua FastAPI TestClient."""

    def _payload(self, ma_chi_so="CS-001", cu=100, moi=150,
                 thang="2026-08-01", ma_dong_ho="DH-D001"):
        return {
            "MaChiSo": ma_chi_so,
            "MaDongHo": ma_dong_ho,
            "ThangNam": thang,
            "ChiSoCu": cu,
            "ChiSoMoi": moi,
        }

    def test_admin_nhap_chi_so_thanh_cong(self, client, seed_db, auth_admin):
        """Admin POST /chi-so/ → 201, tạo hóa đơn đúng."""
        res = client.post("/chi-so/", json=self._payload(), headers=auth_admin)
        assert res.status_code == 201
        data = res.json()
        assert "hoa_don" in data
        # TongTien = (150-100) * 3500 = 175_000
        assert data["hoa_don"]["TongTien"] == pytest.approx(175_000.0)

    def test_tao_hoa_don_moi(self, client, seed_db, auth_admin):
        """Lần đầu nhập → tạo hóa đơn mới."""
        res = client.post("/chi-so/", json=self._payload(), headers=auth_admin)
        assert res.status_code == 201
        assert "tạo hóa đơn mới" in res.json()["message"]

    def test_cong_don_hoa_don_da_ton_tai(self, client, seed_db, auth_admin):
        """Nhập chỉ số nước cùng tháng → cộng vào hóa đơn hiện có."""
        # Nhập điện trước
        client.post("/chi-so/", json=self._payload("CS-D01", 100, 150), headers=auth_admin)
        # Nhập nước cùng tháng
        res = client.post("/chi-so/",
                          json=self._payload("CS-N01", 10, 18, ma_dong_ho="DH-N001"),
                          headers=auth_admin)
        assert res.status_code == 201
        data = res.json()
        # TongTien điện + nước = 175_000 + (8*15000=120_000) = 295_000
        assert data["hoa_don"]["TongTien"] == pytest.approx(295_000.0)
        assert "cập nhật hóa đơn" in data["message"]

    def test_trung_ma_chi_so_tra_409(self, client, seed_db, auth_admin):
        """MaChiSo trùng → 409 Conflict."""
        client.post("/chi-so/", json=self._payload("CS-SAME"), headers=auth_admin)
        res = client.post("/chi-so/", json=self._payload("CS-SAME"), headers=auth_admin)
        assert res.status_code == 409

    def test_dong_ho_khong_ton_tai_tra_404(self, client, seed_db, auth_admin):
        """MaDongHo không tồn tại → 404."""
        res = client.post("/chi-so/",
                          json=self._payload(ma_dong_ho="DH-KHONG-CO"),
                          headers=auth_admin)
        assert res.status_code == 404

    def test_user_thuong_bi_tu_choi_403(self, client, seed_db, auth_user):
        """User thường POST /chi-so/ → 403 Forbidden."""
        res = client.post("/chi-so/", json=self._payload(), headers=auth_user)
        assert res.status_code == 403

    def test_chua_dang_nhap_tra_401(self, client, seed_db):
        """Không có token → 401 Unauthorized."""
        res = client.post("/chi-so/", json=self._payload())
        assert res.status_code == 401

    def test_chi_so_moi_nho_hon_cu_tra_422(self, client, seed_db, auth_admin):
        """ChiSoMoi < ChiSoCu → 422 Unprocessable Entity (Pydantic validation)."""
        res = client.post("/chi-so/",
                          json=self._payload(cu=200, moi=100),
                          headers=auth_admin)
        assert res.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# Test xem lịch sử chỉ số
# ══════════════════════════════════════════════════════════════════════════════

class TestXemChiSo:
    """Test GET /chi-so/{ma_dong_ho} với phân quyền."""

    def test_admin_xem_duoc_tat_ca(self, client, seed_db, auth_admin):
        """Admin GET /chi-so/{id} → 200."""
        res = client.get("/chi-so/DH-D001", headers=auth_admin)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_user_xem_duoc_phong_minh(self, client, seed_db, auth_user):
        """User1 xem đồng hồ thuộc phòng của mình → 200."""
        res = client.get("/chi-so/DH-D001", headers=auth_user)
        assert res.status_code == 200

    def test_user_khong_xem_duoc_phong_khac(self, client, seed_db, auth_user):
        """User1 xem đồng hồ không thuộc phòng mình → 403."""
        # Tạo hộ + đồng hồ khác
        seed_db.add_all([
            HoGiaDinh(MaHo="HO-002", TenChuHo="Khác", SoDienThoai="0", MaPhong="P999"),
            DongHo(MaDongHo="DH-D999", MaHo="HO-002", Loai="Điện", DonGia=3500),
        ])
        seed_db.commit()
        res = client.get("/chi-so/DH-D999", headers=auth_user)
        assert res.status_code == 403

    def test_chua_dang_nhap_tra_401(self, client, seed_db):
        """Không token → 401."""
        res = client.get("/chi-so/DH-D001")
        assert res.status_code == 401
