import pytest

def test_admin_create_ho_gia_dinh_success(client, auth_admin, db_session):
    payload = {
        "MaHo": "HO-002",
        "TenChuHo": "Trần Thị B",
        "SoDienThoai": "0987654321",
        "MaPhong": "P102",
        "DiaChi": "123 Đường A",
        "GioiTinh": "Nữ",
        "DonGiaDien": 4000,
        "DonGiaNuoc": 16000
    }
    res = client.post("/ho-gia-dinh/", json=payload, headers=auth_admin)
    assert res.status_code == 201
    data = res.json()
    assert data["MaHo"] == "HO-002"
    assert data["DiaChi"] == "123 Đường A"
    assert data["GioiTinh"] == "Nữ"

    # Kiểm tra đồng hồ được tạo tự động
    from database import DongHo
    dhs = db_session.query(DongHo).filter(DongHo.MaHo == "HO-002").all()
    assert len(dhs) == 2
    dien = next((d for d in dhs if d.Loai == "Điện"), None)
    nuoc = next((d for d in dhs if d.Loai == "Nước"), None)
    assert dien is not None
    assert nuoc is not None
    assert dien.DonGia == 4000
    assert nuoc.DonGia == 16000

def test_admin_create_ho_gia_dinh_duplicate_ma_phong(client, auth_admin, seed_db):
    payload = {
        "MaHo": "HO-002",
        "TenChuHo": "Trần Thị B",
        "SoDienThoai": "0987654321",
        "MaPhong": "P101", # P101 đã tồn tại trong seed
    }
    res = client.post("/ho-gia-dinh/", json=payload, headers=auth_admin)
    assert res.status_code == 409
    assert "MaPhong 'P101' đã tồn tại" in res.json()["detail"]

def test_admin_create_ho_gia_dinh_duplicate_ma_ho(client, auth_admin, seed_db):
    payload = {
        "MaHo": "HO-001", # HO-001 đã tồn tại
        "TenChuHo": "Trần Thị B",
        "SoDienThoai": "0987654321",
        "MaPhong": "P102",
    }
    res = client.post("/ho-gia-dinh/", json=payload, headers=auth_admin)
    assert res.status_code == 409
    assert "MaHo 'HO-001' đã tồn tại" in res.json()["detail"]

def test_user_cannot_create_ho_gia_dinh(client, auth_user):
    payload = {
        "MaHo": "HO-002",
        "TenChuHo": "Trần Thị B",
        "SoDienThoai": "0987654321",
        "MaPhong": "P102",
    }
    res = client.post("/ho-gia-dinh/", json=payload, headers=auth_user)
    assert res.status_code == 403

def test_get_ho_gia_dinh_success(client, auth_admin, seed_db):
    res = client.get("/ho-gia-dinh/HO-001", headers=auth_admin)
    assert res.status_code == 200
    assert res.json()["MaHo"] == "HO-001"

def test_user_get_own_ho_gia_dinh(client, auth_user, seed_db):
    res = client.get("/ho-gia-dinh/HO-001", headers=auth_user)
    assert res.status_code == 200
    assert res.json()["MaHo"] == "HO-001"

def test_user_cannot_get_other_ho_gia_dinh(client, auth_user, seed_db):
    res = client.get("/ho-gia-dinh/HO-002", headers=auth_user)
    assert res.status_code == 403
