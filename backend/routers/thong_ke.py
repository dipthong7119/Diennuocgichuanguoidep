"""
routers/thong_ke.py — API thống kê doanh thu, tiêu thụ, công nợ (có phân quyền)

Phân quyền:
  - admin : xem tất cả (tổng quan, doanh thu toàn hệ thống)
  - user  : chỉ xem lịch sử tiêu thụ của phòng mình
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db, HoaDon, HoGiaDinh, DongHo, ChiSoTieuThu
from routers.auth import require_login, require_admin

router = APIRouter(prefix="/thong-ke", tags=["Thống Kê"])


@router.get("/tong-quan", summary="Thống kê tổng quan dashboard")
def thong_ke_tong_quan(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Trả về các số liệu tổng quan cho dashboard. **Chỉ admin.**"""
    try:
        tong_ho = db.query(func.count(HoGiaDinh.MaHo)).scalar() or 0
        tong_dong_ho = db.query(func.count(DongHo.MaDongHo)).scalar() or 0
        tong_hoa_don = db.query(func.count(HoaDon.MaHoaDon)).scalar() or 0

        tong_doanh_thu = db.query(func.sum(HoaDon.TongTien)).scalar() or 0.0
        da_thu = db.query(func.sum(HoaDon.TongTien)).filter(
            HoaDon.TrangThaiThanhToan == True
        ).scalar() or 0.0
        cong_no = db.query(func.sum(HoaDon.TongTien)).filter(
            HoaDon.TrangThaiThanhToan == False
        ).scalar() or 0.0

        hoa_don_chua_thanh_toan = db.query(func.count(HoaDon.MaHoaDon)).filter(
            HoaDon.TrangThaiThanhToan == False
        ).scalar() or 0

        return {
            "tong_ho_gia_dinh": tong_ho,
            "tong_dong_ho": tong_dong_ho,
            "tong_hoa_don": tong_hoa_don,
            "tong_doanh_thu": round(tong_doanh_thu, 0),
            "da_thu": round(da_thu, 0),
            "cong_no": round(cong_no, 0),
            "hoa_don_chua_thanh_toan": hoa_don_chua_thanh_toan,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thống kê: {str(e)}")


@router.get("/tieu-thu-theo-ho/{ma_ho}", summary="Lịch sử tiêu thụ của hộ")
def tieu_thu_theo_ho(
    ma_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Trả về lịch sử tiêu thụ điện/nước của một hộ, sắp xếp theo tháng.
    - **Admin**: xem lịch sử của bất kỳ hộ nào.
    - **User thường**: chỉ xem lịch sử tiêu thụ của phòng mình.
    """
    try:
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != ma_ho:
                raise HTTPException(
                    status_code=403,
                    detail="Bạn không có quyền xem lịch sử tiêu thụ của phòng này"
                )

        dong_hos = db.query(DongHo).filter(DongHo.MaHo == ma_ho).all()
        if not dong_hos:
            return {"dien": [], "nuoc": []}

        result = {"dien": [], "nuoc": []}

        for dh in dong_hos:
            chi_so_list = (
                db.query(ChiSoTieuThu)
                .filter(ChiSoTieuThu.MaDongHo == dh.MaDongHo)
                .order_by(ChiSoTieuThu.ThangNam.asc())
                .all()
            )
            loai_key = "dien" if dh.Loai == "Điện" else "nuoc"
            for cs in chi_so_list:
                result[loai_key].append({
                    "thang": str(cs.ThangNam),
                    "tieu_thu": cs.ChiSoMoi - cs.ChiSoCu,
                    "chi_so_cu": cs.ChiSoCu,
                    "chi_so_moi": cs.ChiSoMoi,
                })

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn: {str(e)}")


@router.get("/doanh-thu-theo-thang", summary="Doanh thu theo tháng")
def doanh_thu_theo_thang(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Trả về doanh thu tổng hợp theo từng tháng. **Chỉ admin.**"""
    try:
        results = (
            db.query(
                HoaDon.ThangNam,
                func.sum(HoaDon.TongTien).label("tong_tien"),
                func.count(HoaDon.MaHoaDon).label("so_hoa_don"),
            )
            .group_by(HoaDon.ThangNam)
            .order_by(HoaDon.ThangNam.asc())
            .all()
        )

        return [
            {
                "thang": str(r.ThangNam),
                "tong_tien": round(r.tong_tien, 0),
                "so_hoa_don": r.so_hoa_don,
            }
            for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thống kê: {str(e)}")


@router.get("/canh-bao", summary="Danh sách phòng có tiêu thụ bất thường")
def canh_bao_tieu_thu(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """
    Trả về danh sách các hộ gia đình có mức tiêu thụ bất thường
    dựa trên kết quả phân tích AI. **Chỉ admin.**

    Mức độ cảnh báo:
    - **Cao** : tăng 20% – 50%
    - **Nguy hiểm** : tăng > 50%
    """
    try:
        from database import PhanTichAI
        # Join PhanTichAI → HoaDon → HoGiaDinh, lọc mức Cao/Nguy hiểm
        alerts = (
            db.query(PhanTichAI, HoaDon, HoGiaDinh)
            .join(HoaDon, PhanTichAI.MaHoaDon == HoaDon.MaHoaDon)
            .join(HoGiaDinh, HoaDon.MaHo == HoGiaDinh.MaHo)
            .filter(PhanTichAI.MucDoCanhBao.in_(["Cao", "Nguy hiểm"]))
            .order_by(HoaDon.ThangNam.desc())
            .all()
        )

        # Deduplicate: mỗi hộ chỉ lấy cảnh báo mới nhất
        seen: set = set()
        result = []
        for pt, hd, ho in alerts:
            if ho.MaHo not in seen:
                seen.add(ho.MaHo)
                result.append({
                    "ma_ho": ho.MaHo,
                    "ten_chu_ho": ho.TenChuHo,
                    "ma_phong": ho.MaPhong,
                    "so_dien_thoai": ho.SoDienThoai,
                    "thang_nam": str(hd.ThangNam),
                    "tong_tien": hd.TongTien,
                    "trang_thai_thanh_toan": hd.TrangThaiThanhToan,
                    "muc_do_canh_bao": pt.MucDoCanhBao,
                    "noi_dung_nhan_xet": pt.NoiDungNhanXet,
                })

        return {
            "tong_canh_bao": len(result),
            "danh_sach": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn cảnh báo: {str(e)}")
