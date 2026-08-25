"""
routers/thong_ke.py — API thống kê doanh thu, tiêu thụ, công nợ
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db, HoaDon, HoGiaDinh, DongHo, ChiSoTieuThu

router = APIRouter(prefix="/thong-ke", tags=["Thống Kê"])


@router.get("/tong-quan", summary="Thống kê tổng quan dashboard")
def thong_ke_tong_quan(db: Session = Depends(get_db)):
    """Trả về các số liệu tổng quan cho dashboard."""
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
def tieu_thu_theo_ho(ma_ho: str, db: Session = Depends(get_db)):
    """Trả về lịch sử tiêu thụ điện/nước của một hộ, sắp xếp theo tháng."""
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn: {str(e)}")


@router.get("/doanh-thu-theo-thang", summary="Doanh thu theo tháng")
def doanh_thu_theo_thang(db: Session = Depends(get_db)):
    """Trả về doanh thu tổng hợp theo từng tháng."""
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
