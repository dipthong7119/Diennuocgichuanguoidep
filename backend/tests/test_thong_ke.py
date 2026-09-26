from datetime import date
from database import ChiSoTieuThu, HoaDon, HoGiaDinh, DongHo

def test_xep_hang_tieu_thu_dien(client, auth_admin, seed_db):
    # Thêm data
    seed_db.add_all([
        HoGiaDinh(MaHo="HO-002", TenChuHo="B", SoDienThoai="0", MaPhong="P102"),
        DongHo(MaDongHo="DH-D002", MaHo="HO-002", Loai="Điện", DonGia=3500),
        ChiSoTieuThu(MaChiSo="CS-1", MaDongHo="DH-D001", ThangNam=date(2026, 3, 1), ChiSoCu=0, ChiSoMoi=100), # HO-001 tiêu thụ 100
        ChiSoTieuThu(MaChiSo="CS-2", MaDongHo="DH-D002", ThangNam=date(2026, 3, 1), ChiSoCu=0, ChiSoMoi=250), # HO-002 tiêu thụ 250
    ])
    seed_db.commit()

    res = client.get("/thong-ke/xep-hang?loai=Dien&thang=2026-03", headers=auth_admin)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["ma_ho"] == "HO-002"
    assert data[0]["tieu_thu"] == 250
    assert data[1]["ma_ho"] == "HO-001"
    assert data[1]["tieu_thu"] == 100

def test_xep_hang_tieu_thu_tang_dan(client, auth_admin, seed_db):
    seed_db.add_all([
        HoGiaDinh(MaHo="HO-002", TenChuHo="B", SoDienThoai="0", MaPhong="P102"),
        DongHo(MaDongHo="DH-D002", MaHo="HO-002", Loai="Điện", DonGia=3500),
        ChiSoTieuThu(MaChiSo="CS-1", MaDongHo="DH-D001", ThangNam=date(2026, 3, 1), ChiSoCu=0, ChiSoMoi=100),
        ChiSoTieuThu(MaChiSo="CS-2", MaDongHo="DH-D002", ThangNam=date(2026, 3, 1), ChiSoCu=0, ChiSoMoi=250),
    ])
    seed_db.commit()

    res = client.get("/thong-ke/xep-hang?loai=Dien&thang=2026-03&sap_xep=tang_dan", headers=auth_admin)
    assert res.status_code == 200
    data = res.json()
    assert data[0]["ma_ho"] == "HO-001"
    assert data[0]["tieu_thu"] == 100

def test_xep_hang_user_thuong_bi_tu_choi(client, auth_user):
    res = client.get("/thong-ke/xep-hang", headers=auth_user)
    assert res.status_code == 403

def test_loc_hoa_don(client, auth_admin, seed_db):
    seed_db.add_all([
        HoaDon(MaHoaDon="HD-1", MaHo="HO-001", ThangNam=date(2026, 3, 1), TongTien=100000, TrangThaiThanhToan=False),
        HoaDon(MaHoaDon="HD-2", MaHo="HO-001", ThangNam=date(2026, 4, 1), TongTien=200000, TrangThaiThanhToan=True),
    ])
    seed_db.commit()

    # Lọc tất cả
    res = client.get("/thong-ke/hoa-don-loc", headers=auth_admin)
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Lọc theo năm và tháng
    res = client.get("/thong-ke/hoa-don-loc?nam=2026&thang=3", headers=auth_admin)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["ma_hoa_don"] == "HD-1"

def test_loc_hoa_don_user_thuong_bi_tu_choi(client, auth_user):
    res = client.get("/thong-ke/hoa-don-loc", headers=auth_user)
    assert res.status_code == 403
