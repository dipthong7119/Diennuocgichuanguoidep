"""
tests/test_ai.py — Test tích hợp AI: mock response, lưu kết quả, phân quyền

Bao gồm:
  - _mock_response trả đúng định dạng
  - _goi_ai_api dùng mock khi không có API key
  - POST /ai-insight/generate tạo phân tích và lưu DB
  - GET /ai-insight/{ma_hoa_don} lấy kết quả
  - Phân quyền: user chỉ xem kết quả phòng mình
"""

import pytest
from datetime import date
from database import HoaDon, HoGiaDinh, PhanTichAI, NguoiDung
import hashlib


def _hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


# ══════════════════════════════════════════════════════════════════════════════
# Unit test: hàm _mock_response
# ══════════════════════════════════════════════════════════════════════════════

class TestMockResponse:
    """Test hàm _mock_response trả về đúng nội dung khi không có API key."""

    def _mock(self, data):
        from routers.ai_insight import _mock_response
        return _mock_response(data)

    def test_danh_sach_rong_tra_thong_bao(self):
        """Danh sách rỗng → thông báo 'Chưa đủ dữ liệu'."""
        result = self._mock([])
        assert "Chưa đủ dữ liệu" in result

    def test_co_du_lieu_tra_string_khong_rong(self):
        """Có dữ liệu → trả về string không rỗng."""
        result = self._mock([50, 55, 60])
        assert isinstance(result, str)
        assert len(result) > 0

    def test_chua_khi_khong_co_api_key(self):
        """Nội dung phải ghi rõ là Mock khi chưa cấu hình key."""
        result = self._mock([100, 120, 90])
        assert "Mock" in result or "mock" in result.lower()

    def test_tinh_trung_binh_trong_ket_qua(self):
        """Kết quả Mock phải đề cập trung bình."""
        result = self._mock([100, 200, 300])
        # Trung bình = 200.0
        assert "200.0" in result or "200" in result

    def test_mot_gia_tri_khong_loi(self):
        """Chỉ có 1 điểm dữ liệu không được raise exception."""
        result = self._mock([150])
        assert isinstance(result, str)


# ══════════════════════════════════════════════════════════════════════════════
# Unit test: _goi_ai_api (mock mode - không có API key thật)
# ══════════════════════════════════════════════════════════════════════════════

class TestGoiAiApi:
    """Test _goi_ai_api fallback về mock khi không có API key."""

    def test_khong_co_key_dung_mock(self, monkeypatch):
        """Không có GEMINI_API_KEY → dùng _mock_response."""
        monkeypatch.setenv("GEMINI_API_KEY", "")
        monkeypatch.setenv("AI_PROVIDER", "gemini")
        from routers.ai_insight import _goi_ai_api
        result = _goi_ai_api([100, 120, 150])
        assert isinstance(result, str)
        assert len(result) > 0

    def test_provider_khong_hop_le_dung_mock(self, monkeypatch):
        """Provider không hợp lệ → fallback mock."""
        monkeypatch.setenv("AI_PROVIDER", "unknown_provider")
        from routers.ai_insight import _goi_ai_api
        result = _goi_ai_api([50, 60, 70])
        assert isinstance(result, str)

    def test_danh_sach_rong_khong_loi(self, monkeypatch):
        """Danh sách tiêu thụ rỗng không raise exception."""
        monkeypatch.setenv("GEMINI_API_KEY", "")
        from routers.ai_insight import _goi_ai_api
        result = _goi_ai_api([])
        assert isinstance(result, str)


# ══════════════════════════════════════════════════════════════════════════════
# Fixtures
# ══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def setup_ai_test(seed_db):
    """Seed hóa đơn + chỉ số cho HO-001 để test AI insight."""
    from database import DongHo, ChiSoTieuThu
    # Đồng hồ đã có từ conftest.seed_db
    # Tạo chỉ số 3 tháng
    seed_db.add_all([
        ChiSoTieuThu(MaChiSo="CS-AI01", MaDongHo="DH-D001",
                     ThangNam=date(2026, 6, 1), ChiSoCu=100, ChiSoMoi=150),
        ChiSoTieuThu(MaChiSo="CS-AI02", MaDongHo="DH-D001",
                     ThangNam=date(2026, 7, 1), ChiSoCu=150, ChiSoMoi=205),
        ChiSoTieuThu(MaChiSo="CS-AI03", MaDongHo="DH-D001",
                     ThangNam=date(2026, 8, 1), ChiSoCu=205, ChiSoMoi=315),
    ])
    # Hóa đơn tháng 8
    hd = HoaDon(
        MaHoaDon="HD-AI001",
        MaHo="HO-001",
        ThangNam=date(2026, 8, 1),
        TongTien=385_000.0,
        TrangThaiThanhToan=False,
    )
    seed_db.add(hd)
    seed_db.commit()
    return seed_db


@pytest.fixture
def setup_ai_phong_khac(seed_db):
    """Seed dữ liệu cho HO-002 để test phân quyền."""
    seed_db.add_all([
        NguoiDung(Username="user2", PasswordHash=_hash_pw("user456"),
                  Role="user", MaHo="HO-002"),
        HoGiaDinh(MaHo="HO-002", TenChuHo="Phòng khác",
                  SoDienThoai="0999", MaPhong="P999"),
    ])
    hd = HoaDon(
        MaHoaDon="HD-AI002",
        MaHo="HO-002",
        ThangNam=date(2026, 8, 1),
        TongTien=200_000.0,
        TrangThaiThanhToan=False,
    )
    seed_db.add(hd)
    seed_db.commit()
    return seed_db


# ══════════════════════════════════════════════════════════════════════════════
# Integration test: POST /ai-insight/generate
# ══════════════════════════════════════════════════════════════════════════════

class TestGenerateAiInsight:
    """Test POST /ai-insight/generate."""

    def test_admin_tao_ai_insight_thanh_cong(self, client, setup_ai_test, auth_admin):
        """Admin generate AI insight → 201, có NoiDungNhanXet và MucDoCanhBao."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI001",
            "ma_ho": "HO-001",
        }, headers=auth_admin)
        assert res.status_code == 201
        data = res.json()
        assert "MaDanhGia" in data
        assert "NoiDungNhanXet" in data
        assert "MucDoCanhBao" in data
        assert data["MucDoCanhBao"] in ("Bình thường", "Cao", "Nguy hiểm")

    def test_muc_do_canh_bao_hop_le(self, client, setup_ai_test, auth_admin):
        """MucDoCanhBao phải là một trong 3 giá trị hợp lệ."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI001",
            "ma_ho": "HO-001",
        }, headers=auth_admin)
        assert res.json()["MucDoCanhBao"] in ("Bình thường", "Cao", "Nguy hiểm")

    def test_noi_dung_nhan_xet_khong_rong(self, client, setup_ai_test, auth_admin):
        """NoiDungNhanXet không được rỗng."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI001",
            "ma_ho": "HO-001",
        }, headers=auth_admin)
        assert len(res.json()["NoiDungNhanXet"]) > 0

    def test_hoa_don_khong_ton_tai_tra_404(self, client, setup_ai_test, auth_admin):
        """MaHoaDon không tồn tại → 404."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-KHONG-CO",
            "ma_ho": "HO-001",
        }, headers=auth_admin)
        assert res.status_code == 404

    def test_user_tao_ai_phong_minh(self, client, setup_ai_test, auth_user):
        """User1 generate AI cho phòng của mình → 201."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI001",
            "ma_ho": "HO-001",
        }, headers=auth_user)
        assert res.status_code == 201

    def test_user_khong_tao_ai_phong_khac(self, client, setup_ai_phong_khac, auth_user):
        """User1 generate AI cho HO-002 → 403 Forbidden."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI002",
            "ma_ho": "HO-002",
        }, headers=auth_user)
        assert res.status_code == 403

    def test_chua_dang_nhap_tra_401(self, client, setup_ai_test):
        """Không token → 401."""
        res = client.post("/ai-insight/generate", json={
            "ma_hoa_don": "HD-AI001",
            "ma_ho": "HO-001",
        })
        assert res.status_code == 401


# ══════════════════════════════════════════════════════════════════════════════
# Integration test: GET /ai-insight/{ma_hoa_don}
# ══════════════════════════════════════════════════════════════════════════════

class TestGetAiInsight:
    """Test GET /ai-insight/{ma_hoa_don}."""

    @pytest.fixture(autouse=True)
    def setup_phan_tich(self, seed_db):
        """Seed hóa đơn + kết quả AI sẵn có."""
        hd = HoaDon(MaHoaDon="HD-AI010", MaHo="HO-001",
                    ThangNam=date(2026, 8, 1), TongTien=200_000, TrangThaiThanhToan=False)
        seed_db.add(hd)
        seed_db.commit()
        pt = PhanTichAI(MaDanhGia="AI-010", MaHoaDon="HD-AI010",
                        NoiDungNhanXet="Phân tích test", MucDoCanhBao="Bình thường")
        seed_db.add(pt)
        seed_db.commit()

    def test_admin_lay_ket_qua(self, client, auth_admin):
        """Admin lấy kết quả AI → 200, list."""
        res = client.get("/ai-insight/HD-AI010", headers=auth_admin)
        assert res.status_code == 200
        assert isinstance(res.json(), list)
        assert len(res.json()) == 1

    def test_user_xem_phong_minh(self, client, auth_user):
        """User1 xem kết quả AI hóa đơn phòng mình → 200."""
        res = client.get("/ai-insight/HD-AI010", headers=auth_user)
        assert res.status_code == 200

    def test_user_khong_xem_phong_khac(self, client, setup_ai_phong_khac, auth_user):
        """User1 xem kết quả AI hóa đơn HO-002 → 403."""
        # Tạo AI insight cho HO-002
        hd = setup_ai_phong_khac.query(HoaDon).filter_by(MaHoaDon="HD-AI002").first()
        setup_ai_phong_khac.add(
            PhanTichAI(MaDanhGia="AI-011", MaHoaDon="HD-AI002",
                       NoiDungNhanXet="Phân tích khác", MucDoCanhBao="Cao")
        )
        setup_ai_phong_khac.commit()
        res = client.get("/ai-insight/HD-AI002", headers=auth_user)
        assert res.status_code == 403

    def test_chua_dang_nhap_tra_401(self, client):
        """Không token → 401."""
        res = client.get("/ai-insight/HD-AI010")
        assert res.status_code == 401

    def test_hoa_don_khong_co_ai_tra_list_rong(self, client, seed_db, auth_admin):
        """Hóa đơn chưa có phân tích AI → trả list rỗng []."""
        seed_db.add(HoaDon(MaHoaDon="HD-NO-AI", MaHo="HO-001",
                           ThangNam=date(2026, 5, 1), TongTien=100_000, TrangThaiThanhToan=False))
        seed_db.commit()
        res = client.get("/ai-insight/HD-NO-AI", headers=auth_admin)
        assert res.status_code == 200
        assert res.json() == []
