"""
tests/test_canh_bao.py — Test logic cảnh báo tiêu thụ bất thường

Bao gồm:
  - Unit test hàm _xac_dinh_muc_do với các ngưỡng 20% / 50%
  - Integration test endpoint GET /thong-ke/canh-bao
"""

import pytest
from datetime import date
from database import HoaDon, HoGiaDinh, PhanTichAI


# ══════════════════════════════════════════════════════════════════════════════
# Unit test: hàm _xac_dinh_muc_do (không cần DB)
# ══════════════════════════════════════════════════════════════════════════════

class TestXacDinhMucDo:
    """Test hàm phân loại mức độ cảnh báo từ lịch sử tiêu thụ."""

    def _muc_do(self, lich_su):
        from routers.ai_insight import _xac_dinh_muc_do
        return _xac_dinh_muc_do(lich_su)

    # ── Bình thường ──────────────────────────────────────────────────────────

    def test_tang_duoi_20_phan_tram_binh_thuong(self):
        """Tăng 10% → Bình thường."""
        assert self._muc_do([100, 110]) == "Bình thường"

    def test_tang_bang_0_binh_thuong(self):
        """Không tăng → Bình thường."""
        assert self._muc_do([100, 100]) == "Bình thường"

    def test_giam_binh_thuong(self):
        """Giảm tiêu thụ → Bình thường."""
        assert self._muc_do([100, 80]) == "Bình thường"

    def test_du_lieu_mot_gia_tri_binh_thuong(self):
        """Chỉ có 1 điểm dữ liệu → chưa đủ so sánh → Bình thường."""
        assert self._muc_do([150]) == "Bình thường"

    def test_danh_sach_rong_binh_thuong(self):
        """Danh sách rỗng → Bình thường."""
        assert self._muc_do([]) == "Bình thường"

    # ── Cao ──────────────────────────────────────────────────────────────────

    def test_tang_dung_20_phan_tram_la_cao(self):
        """Tăng đúng 20% → Cao (biên dưới)."""
        assert self._muc_do([100, 120]) == "Cao"

    def test_tang_dung_50_phan_tram_la_cao(self):
        """Tăng đúng 50% → Cao (biên trên)."""
        assert self._muc_do([100, 150]) == "Cao"

    def test_tang_35_phan_tram_la_cao(self):
        """Tăng 35% → Cao."""
        assert self._muc_do([200, 270]) == "Cao"

    def test_nhieu_thang_chi_so_sanh_2_cuoi(self):
        """Lịch sử 3 tháng, chỉ so sánh 2 tháng gần nhất."""
        # Tháng 1→2: tăng 0%, tháng 2→3: tăng 30% → Cao
        assert self._muc_do([100, 100, 130]) == "Cao"

    # ── Nguy hiểm ────────────────────────────────────────────────────────────

    def test_tang_tren_50_phan_tram_nguy_hiem(self):
        """Tăng 51% → Nguy hiểm."""
        assert self._muc_do([100, 151]) == "Nguy hiểm"

    def test_tang_100_phan_tram_nguy_hiem(self):
        """Tăng gấp đôi → Nguy hiểm."""
        assert self._muc_do([100, 200]) == "Nguy hiểm"

    def test_tu_khong_sang_co_tieu_thu_nguy_hiem(self):
        """Tháng trước = 0, tháng này > 0 → Nguy hiểm."""
        assert self._muc_do([0, 50]) == "Nguy hiểm"

    def test_ca_hai_bang_0_binh_thuong(self):
        """Tháng trước = 0, tháng này = 0 → Bình thường."""
        assert self._muc_do([0, 0]) == "Bình thường"

    def test_tang_manh_nhieu_thang(self):
        """3 tháng, tháng gần nhất tăng 80% so với tháng trước → Nguy hiểm."""
        assert self._muc_do([50, 50, 90]) == "Nguy hiểm"


# ══════════════════════════════════════════════════════════════════════════════
# Integration test: endpoint GET /thong-ke/canh-bao
# ══════════════════════════════════════════════════════════════════════════════

class TestCanhBaoEndpoint:
    """Test endpoint GET /thong-ke/canh-bao."""

    @pytest.fixture(autouse=True)
    def setup_canh_bao(self, seed_db):
        """Seed hóa đơn + kết quả AI với các mức cảnh báo khác nhau."""
        # Hóa đơn của HO-001
        hd1 = HoaDon(MaHoaDon="HD-CB001", MaHo="HO-001",
                     ThangNam=date(2026, 8, 1), TongTien=500_000, TrangThaiThanhToan=False)
        # Hóa đơn bình thường (không nên xuất hiện trong kết quả)
        hd2 = HoaDon(MaHoaDon="HD-CB002", MaHo="HO-001",
                     ThangNam=date(2026, 7, 1), TongTien=200_000, TrangThaiThanhToan=True)
        seed_db.add_all([hd1, hd2])
        seed_db.commit()

        # Kết quả AI: HD-CB001 mức Nguy hiểm, HD-CB002 Bình thường
        seed_db.add_all([
            PhanTichAI(MaDanhGia="AI-001", MaHoaDon="HD-CB001",
                       NoiDungNhanXet="Tiêu thụ tăng mạnh", MucDoCanhBao="Nguy hiểm"),
            PhanTichAI(MaDanhGia="AI-002", MaHoaDon="HD-CB002",
                       NoiDungNhanXet="Tiêu thụ bình thường", MucDoCanhBao="Bình thường"),
        ])
        seed_db.commit()

    def test_admin_lay_danh_sach_canh_bao(self, client, auth_admin):
        """Admin GET /thong-ke/canh-bao → 200, trả danh sách đúng."""
        res = client.get("/thong-ke/canh-bao", headers=auth_admin)
        assert res.status_code == 200
        data = res.json()
        assert "tong_canh_bao" in data
        assert "danh_sach" in data

    def test_chi_tra_muc_cao_va_nguy_hiem(self, client, auth_admin):
        """Chỉ trả về mức Cao hoặc Nguy hiểm, không có Bình thường."""
        res = client.get("/thong-ke/canh-bao", headers=auth_admin)
        for item in res.json()["danh_sach"]:
            assert item["muc_do_canh_bao"] in ("Cao", "Nguy hiểm")

    def test_co_day_du_truong_thong_tin(self, client, auth_admin):
        """Mỗi mục cảnh báo phải có đủ các trường cần thiết."""
        res = client.get("/thong-ke/canh-bao", headers=auth_admin)
        if res.json()["tong_canh_bao"] > 0:
            item = res.json()["danh_sach"][0]
            required_fields = {
                "ma_ho", "ten_chu_ho", "ma_phong", "thang_nam",
                "muc_do_canh_bao", "tong_tien", "trang_thai_thanh_toan"
            }
            assert required_fields.issubset(item.keys())

    def test_tong_canh_bao_dung_so_luong(self, client, auth_admin):
        """tong_canh_bao khớp với len(danh_sach)."""
        res = client.get("/thong-ke/canh-bao", headers=auth_admin)
        data = res.json()
        assert data["tong_canh_bao"] == len(data["danh_sach"])

    def test_khong_co_canh_bao_binh_thuong(self, client, auth_admin):
        """HD-CB002 có mức Bình thường không được xuất hiện."""
        res = client.get("/thong-ke/canh-bao", headers=auth_admin)
        ma_hoa_dons = [item.get("ma_ho") for item in res.json()["danh_sach"]]
        # Không kiểm tra trực tiếp MaHoaDon vì endpoint trả MaHo
        # Đảm bảo không có item nào có muc_do_canh_bao = Bình thường
        for item in res.json()["danh_sach"]:
            assert item["muc_do_canh_bao"] != "Bình thường"

    def test_user_thuong_bi_tu_choi_403(self, client, auth_user):
        """User thường GET /thong-ke/canh-bao → 403 Forbidden."""
        res = client.get("/thong-ke/canh-bao", headers=auth_user)
        assert res.status_code == 403

    def test_chua_dang_nhap_tra_401(self, client):
        """Không token → 401."""
        res = client.get("/thong-ke/canh-bao")
        assert res.status_code == 401
