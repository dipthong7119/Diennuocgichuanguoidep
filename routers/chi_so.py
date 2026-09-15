"""
routers/chi_so.py — Nhập chỉ số điện/nước và tự động tính hóa đơn (có phân quyền)

Phân quyền:
  - admin : toàn quyền (nhập chỉ số, xem tất cả)
  - user  : chỉ xem lịch sử + hóa đơn của phòng mình,
            và CHỈ được thanh toán hóa đơn của chính mình
"""

import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, ChiSoTieuThu, DongHo, HoaDon
from schemas import ChiSoCreate, ChiSoResponse, HoaDonResponse
from routers.auth import require_login, require_admin

router = APIRouter(prefix="/chi-so", tags=["Chỉ Số & Hóa Đơn"])


def _tinh_tong_tien(chi_so_cu: int, chi_so_moi: int, don_gia: float) -> float:
    """Tính TongTien = (ChiSoMoi - ChiSoCu) * DonGia."""
    return (chi_so_moi - chi_so_cu) * don_gia


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED,
             summary="Nhập chỉ số và tự động tạo hóa đơn")
def nhap_chi_so(
    payload: ChiSoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin được nhập chỉ số
):
    """
    Nhập chỉ số điện/nước mới. **Chỉ admin.**
    - Tự động validate: ChiSoMoi >= ChiSoCu (Pydantic)
    - Tự động tính TongTien và tạo/cập nhật HoaDon tháng tương ứng
    """
    try:
        # 1. Kiểm tra đồng hồ tồn tại
        dong_ho = db.query(DongHo).filter(DongHo.MaDongHo == payload.MaDongHo).first()
        if not dong_ho:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy đồng hồ '{payload.MaDongHo}'")

        # 2. Kiểm tra MaChiSo trùng lặp
        existing_chi_so = db.query(ChiSoTieuThu).filter(
            ChiSoTieuThu.MaChiSo == payload.MaChiSo
        ).first()
        if existing_chi_so:
            raise HTTPException(status_code=409,
                                detail=f"MaChiSo '{payload.MaChiSo}' đã tồn tại")

        # 3. Lưu chỉ số
        chi_so = ChiSoTieuThu(**payload.model_dump())
        db.add(chi_so)

        # 4. Tính TongTien
        tong_tien = _tinh_tong_tien(payload.ChiSoCu, payload.ChiSoMoi, dong_ho.DonGia)

        # 5. Kiểm tra HoaDon tháng này đã tồn tại chưa → nếu có thì cộng thêm
        hoa_don = db.query(HoaDon).filter(
            HoaDon.MaHo == dong_ho.MaHo,
            HoaDon.ThangNam == payload.ThangNam
        ).first()

        if hoa_don:
            hoa_don.TongTien += tong_tien
            db.commit()
            db.refresh(hoa_don)
            db.refresh(chi_so)
            return {
                "chi_so": ChiSoResponse.model_validate(chi_so).model_dump(),
                "hoa_don": HoaDonResponse.model_validate(hoa_don).model_dump(),
                "message": "Đã thêm chỉ số và cập nhật hóa đơn tháng hiện tại"
            }
        else:
            # 6. Tạo HoaDon mới
            ma_hoa_don = f"HD-{uuid.uuid4().hex[:8].upper()}"
            hoa_don = HoaDon(
                MaHoaDon=ma_hoa_don,
                MaHo=dong_ho.MaHo,
                ThangNam=payload.ThangNam,
                TongTien=tong_tien,
                TrangThaiThanhToan=False
            )
            db.add(hoa_don)
            db.commit()
            db.refresh(hoa_don)
            db.refresh(chi_so)
            return {
                "chi_so": ChiSoResponse.model_validate(chi_so).model_dump(),
                "hoa_don": HoaDonResponse.model_validate(hoa_don).model_dump(),
                "message": "Đã thêm chỉ số và tạo hóa đơn mới thành công"
            }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/{ma_dong_ho}", response_model=List[ChiSoResponse],
            summary="Lịch sử chỉ số của một đồng hồ")
def get_lich_su_chi_so(
    ma_dong_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Lấy toàn bộ lịch sử chỉ số tiêu thụ của một đồng hồ.
    - **Admin**: xem bất kỳ đồng hồ nào.
    - **User thường**: chỉ xem đồng hồ thuộc phòng của mình.
    """
    try:
        # Kiểm tra đồng hồ tồn tại và lấy MaHo
        dong_ho = db.query(DongHo).filter(DongHo.MaDongHo == ma_dong_ho).first()
        if not dong_ho:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy đồng hồ '{ma_dong_ho}'")

        # User thường chỉ xem đồng hồ của phòng mình
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != dong_ho.MaHo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem lịch sử chỉ số của đồng hồ này"
                )

        lich_su = (
            db.query(ChiSoTieuThu)
            .filter(ChiSoTieuThu.MaDongHo == ma_dong_ho)
            .order_by(ChiSoTieuThu.ThangNam.desc())
            .all()
        )
        return lich_su
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/hoa-don/{ma_ho}", response_model=List[HoaDonResponse],
            summary="Danh sách hóa đơn của hộ gia đình")
def get_hoa_don_by_ho(
    ma_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Lấy toàn bộ hóa đơn của một hộ gia đình, sắp xếp mới nhất trước.
    - **Admin**: xem hóa đơn của bất kỳ hộ nào.
    - **User thường**: chỉ xem hóa đơn của phòng mình.
    """
    try:
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != ma_ho:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem hóa đơn của phòng này"
                )

        hoa_dons = (
            db.query(HoaDon)
            .filter(HoaDon.MaHo == ma_ho)
            .order_by(HoaDon.ThangNam.desc())
            .all()
        )
        return hoa_dons
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.patch("/hoa-don/{ma_hoa_don}/thanh-toan", response_model=HoaDonResponse,
              summary="Đánh dấu hóa đơn đã thanh toán")
def mark_thanh_toan(
    ma_hoa_don: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Cập nhật TrangThaiThanhToan = True cho hóa đơn.
    - **Admin**: thanh toán bất kỳ hóa đơn nào.
    - **User thường**: chỉ được thanh toán hóa đơn của phòng CHÍNH MÌNH.
    """
    try:
        hoa_don = db.query(HoaDon).filter(HoaDon.MaHoaDon == ma_hoa_don).first()
        if not hoa_don:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy hóa đơn '{ma_hoa_don}'")

        # ← Điểm phân quyền quan trọng nhất: kiểm tra hóa đơn có thuộc về user không
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != hoa_don.MaHo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền thanh toán hóa đơn của phòng khác"
                )

        hoa_don.TrangThaiThanhToan = True
        db.commit()
        db.refresh(hoa_don)
        return hoa_don
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")
