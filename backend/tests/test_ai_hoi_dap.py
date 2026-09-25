"""
tests/test_ai_hoi_dap.py — Test tính năng Hỏi-đáp AI có truy vấn dữ liệu (retrieval)

Bao gồm:
  - Truy vấn đúng dữ liệu ẩn danh của hộ (retrieval)
  - Trả lời khi chưa cấu hình API key (mock)
  - Phân quyền: user chỉ hỏi được hộ của mình
  - Hộ chưa có dữ liệu -> 404
  - Câu hỏi rỗng / quá dài -> 422
"""

import pytest
from datetime import date

from database import DongHo, ChiSoTieuThu, HoaDon


class TestHoiDapAI:
    def _seed_chi_so(self, seed_db):
        seed_db.add_all([
            ChiSoTieuThu(MaChiSo="CS-D1", MaDongHo="DH-D001",
                         ThangNam=date(2026, 1, 1), ChiSoCu=0, ChiSoMoi=100),
            ChiSoTieuThu(MaChiSo="CS-D2", MaDongHo="DH-D001",
                         ThangNam=date(2026, 2, 1), ChiSoCu=100, ChiSoMoi=250),
            HoaDon(MaHoaDon="HD-001", MaHo="HO-001",
                   ThangNam=date(2026, 2, 1), TongTien=525000, TrangThaiThanhToan=False),
        ])
        seed_db.commit()

    def test_admin_hoi_dap_thanh_cong(self, client, seed_db, auth_admin):
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "Tháng nào tôi dùng điện nhiều nhất?"},
            headers=auth_admin,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["so_ky_du_lieu_dung"] == 2
        assert "tra_loi" in data and len(data["tra_loi"]) > 0

    def test_du_lieu_truy_van_an_danh_khong_lo_ten_sdt(self, client, seed_db, auth_admin):
        """Câu trả lời (mock) chỉ chứa số liệu, không được lộ tên/SĐT chủ hộ."""
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "Tổng tiền tháng 2 là bao nhiêu?"},
            headers=auth_admin,
        )
        assert res.status_code == 200
        tra_loi = res.json()["tra_loi"]
        assert "Nguyen Van An" not in tra_loi
        assert "0901234567" not in tra_loi

    def test_user_hoi_phong_minh_thanh_cong(self, client, seed_db, auth_user):
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "Hóa đơn tháng 2 đã thanh toán chưa?"},
            headers=auth_user,
        )
        assert res.status_code == 200

    def test_user_khong_hoi_duoc_ho_khac_tra_403(self, client, seed_db, auth_user):
        seed_db.add(DongHo(MaDongHo="DH-D999", MaHo="HO-002", Loai="Điện", DonGia=3500))
        seed_db.commit()
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-002", "cau_hoi": "Nhà này dùng bao nhiêu điện?"},
            headers=auth_user,
        )
        assert res.status_code == 403

    def test_ho_chua_co_du_lieu_tra_404(self, client, seed_db, auth_admin):
        """HO-001 đã seed (có đồng hồ) nhưng chưa có bản ghi chỉ số nào."""
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "Tháng này dùng bao nhiêu điện?"},
            headers=auth_admin,
        )
        assert res.status_code == 404

    def test_cau_hoi_rong_tra_422(self, client, seed_db, auth_admin):
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "   "},
            headers=auth_admin,
        )
        assert res.status_code == 422

    def test_cau_hoi_qua_dai_tra_422(self, client, seed_db, auth_admin):
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "a" * 501},
            headers=auth_admin,
        )
        assert res.status_code == 422

    def test_chua_dang_nhap_tra_401(self, client, seed_db):
        self._seed_chi_so(seed_db)
        res = client.post(
            "/ai-insight/hoi-dap",
            json={"ma_ho": "HO-001", "cau_hoi": "Tháng nào dùng nhiều điện nhất?"},
        )
        assert res.status_code == 401
