"""
seed_data.py — Tạo dữ liệu mẫu cho demo
Chạy: python seed_data.py
"""

import hashlib
from datetime import date
from database import SessionLocal, create_tables, HoGiaDinh, DongHo, ChiSoTieuThu, HoaDon, NguoiDung


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def seed():
    create_tables()
    db = SessionLocal()

    try:
        # ── 1. Tạo tài khoản mặc định ────────────────────────────────────────
        if not db.query(NguoiDung).first():
            db.add_all([
                NguoiDung(Username="admin", PasswordHash=hash_pw("admin123"), Role="admin"),
                NguoiDung(Username="user1", PasswordHash=hash_pw("user123"), Role="user"),
            ])
            print("[+] Đã tạo 2 tài khoản: admin/admin123, user1/user123")

        # ── 2. Tạo hộ gia đình ───────────────────────────────────────────────
        if not db.query(HoGiaDinh).first():
            db.add_all([
                HoGiaDinh(MaHo="HO-001", TenChuHo="Nguyễn Văn An", SoDienThoai="0901234567", MaPhong="P101"),
                HoGiaDinh(MaHo="HO-002", TenChuHo="Trần Thị Bình", SoDienThoai="0912345678", MaPhong="P102"),
                HoGiaDinh(MaHo="HO-003", TenChuHo="Lê Minh Cường", SoDienThoai="0923456789", MaPhong="P201"),
                HoGiaDinh(MaHo="HO-004", TenChuHo="Phạm Thị Dung", SoDienThoai="0934567890", MaPhong="P202"),
                HoGiaDinh(MaHo="HO-005", TenChuHo="Hoàng Văn Em", SoDienThoai="0945678901", MaPhong="P301"),
            ])
            print("[+] Đã tạo 5 hộ gia đình")

        # ── 3. Tạo đồng hồ ──────────────────────────────────────────────────
        if not db.query(DongHo).first():
            dong_ho_list = []
            for i in range(1, 6):
                ma_ho = f"HO-00{i}"
                dong_ho_list.append(
                    DongHo(MaDongHo=f"DH-D{i:03d}", MaHo=ma_ho, Loai="Điện", DonGia=3500.0)
                )
                dong_ho_list.append(
                    DongHo(MaDongHo=f"DH-N{i:03d}", MaHo=ma_ho, Loai="Nước", DonGia=15000.0)
                )
            db.add_all(dong_ho_list)
            print("[+] Đã tạo 10 đồng hồ (5 điện + 5 nước)")

        # ── 4. Tạo chỉ số tiêu thụ 3 tháng ─────────────────────────────────
        if not db.query(ChiSoTieuThu).first():
            chi_so_list = []
            # Dữ liệu mẫu cho 5 hộ, 3 tháng (06, 07, 08/2026)
            dien_data = {
                1: [(100, 150), (150, 205), (205, 255)],    # Bình thường
                2: [(200, 240), (240, 285), (285, 435)],    # Tháng 8 tăng mạnh
                3: [(50, 80),   (80, 115),  (115, 148)],    # Ổn định
                4: [(300, 380), (380, 450), (450, 510)],    # Tiêu thụ cao
                5: [(0, 30),    (30, 65),   (65, 95)],      # Tiêu thụ thấp
            }
            nuoc_data = {
                1: [(10, 18),  (18, 27),  (27, 35)],      # Bình thường
                2: [(20, 28),  (28, 35),  (35, 60)],      # Tháng 8 tăng mạnh
                3: [(5, 10),   (10, 16),  (16, 21)],      # Ổn định
                4: [(30, 42),  (42, 55),  (55, 66)],      # Tiêu thụ cao
                5: [(0, 5),    (5, 11),   (11, 16)],      # Tiêu thụ thấp
            }
            months = [date(2026, 6, 1), date(2026, 7, 1), date(2026, 8, 1)]

            idx = 1
            for ho_idx in range(1, 6):
                for m_idx, month in enumerate(months):
                    cu, moi = dien_data[ho_idx][m_idx]
                    chi_so_list.append(ChiSoTieuThu(
                        MaChiSo=f"CS-{idx:04d}",
                        MaDongHo=f"DH-D{ho_idx:03d}",
                        ThangNam=month,
                        ChiSoCu=cu,
                        ChiSoMoi=moi,
                    ))
                    idx += 1

                    cu_n, moi_n = nuoc_data[ho_idx][m_idx]
                    chi_so_list.append(ChiSoTieuThu(
                        MaChiSo=f"CS-{idx:04d}",
                        MaDongHo=f"DH-N{ho_idx:03d}",
                        ThangNam=month,
                        ChiSoCu=cu_n,
                        ChiSoMoi=moi_n,
                    ))
                    idx += 1

            db.add_all(chi_so_list)
            print(f"[+] Đã tạo {len(chi_so_list)} bản ghi chỉ số tiêu thụ")

        # ── 5. Tạo hóa đơn ──────────────────────────────────────────────────
        if not db.query(HoaDon).first():
            hoa_don_list = []
            months = [date(2026, 6, 1), date(2026, 7, 1), date(2026, 8, 1)]

            dien_data = {
                1: [50, 55, 50],
                2: [40, 45, 150],
                3: [30, 35, 33],
                4: [80, 70, 60],
                5: [30, 35, 30],
            }
            nuoc_data = {
                1: [8, 9, 8],
                2: [8, 7, 25],
                3: [5, 6, 5],
                4: [12, 13, 11],
                5: [5, 6, 5],
            }

            hd_idx = 1
            for ho_idx in range(1, 6):
                for m_idx, month in enumerate(months):
                    tien_dien = dien_data[ho_idx][m_idx] * 3500
                    tien_nuoc = nuoc_data[ho_idx][m_idx] * 15000
                    tong = tien_dien + tien_nuoc
                    da_tt = m_idx < 2  # 2 tháng đầu đã thanh toán, tháng 8 chưa

                    hoa_don_list.append(HoaDon(
                        MaHoaDon=f"HD-{hd_idx:04d}",
                        MaHo=f"HO-00{ho_idx}",
                        ThangNam=month,
                        TongTien=tong,
                        TrangThaiThanhToan=da_tt,
                    ))
                    hd_idx += 1

            db.add_all(hoa_don_list)
            print(f"[+] Đã tạo {len(hoa_don_list)} hóa đơn")

        db.commit()
        print("\n[OK] Seed data hoàn tất!")
        print("=" * 50)
        print("Tài khoản demo:")
        print("  Admin: admin / admin123")
        print("  User:  user1 / user123")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
