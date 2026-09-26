"""
routers/ho_gia_dinh.py — CRUD cho bảng HoGiaDinh (có phân quyền)

Phân quyền:
  - admin : toàn quyền (GET list, GET one, POST, PUT, DELETE)
  - user  : chỉ GET thông tin phòng của chính họ
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, HoGiaDinh, DongHo
from schemas import HoGiaDinhCreate, HoGiaDinhUpdate, HoGiaDinhResponse, MessageResponse
from routers.auth import require_login, require_admin

router = APIRouter(prefix="/ho-gia-dinh", tags=["Hộ Gia Đình"])

# Đơn giá mặc định khi không truyền vào
DON_GIA_DIEN_MAC_DINH = 3500.0
DON_GIA_NUOC_MAC_DINH = 15000.0


@router.get("/", response_model=List[HoGiaDinhResponse], summary="Lấy danh sách hộ gia đình")
def get_all_ho_gia_dinh(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Trả về toàn bộ danh sách hộ gia đình. **Chỉ admin.**"""
    try:
        return db.query(HoGiaDinh).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/{ma_ho}", response_model=HoGiaDinhResponse, summary="Lấy thông tin 1 hộ gia đình")
def get_ho_gia_dinh(
    ma_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Trả về thông tin hộ gia đình theo MaHo.
    - **Admin**: xem bất kỳ phòng nào.
    - **User thường**: chỉ xem được phòng của chính mình.
    """
    try:
        # User thường chỉ xem phòng của mình
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != ma_ho:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem thông tin phòng này"
                )

        ho = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == ma_ho).first()
        if not ho:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy hộ có mã '{ma_ho}'")
        return ho
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.post("/", response_model=HoGiaDinhResponse, status_code=status.HTTP_201_CREATED,
             summary="Thêm hộ gia đình mới")
def create_ho_gia_dinh(
    payload: HoGiaDinhCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """
    Tạo một hộ gia đình mới. MaHo và MaPhong phải duy nhất. **Chỉ admin.**
    Tự động tạo kèm 2 đồng hồ (Điện + Nước) với đơn giá mặc định hoặc tùy chọn.
    """
    try:
        # Kiểm tra MaHo trùng
        existing = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == payload.MaHo).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"MaHo '{payload.MaHo}' đã tồn tại")

        # Kiểm tra MaPhong trùng
        existing_phong = db.query(HoGiaDinh).filter(HoGiaDinh.MaPhong == payload.MaPhong).first()
        if existing_phong:
            raise HTTPException(status_code=409, detail=f"MaPhong '{payload.MaPhong}' đã tồn tại")

        # Tạo hộ gia đình (loại bỏ DonGiaDien, DonGiaNuoc — không thuộc model HoGiaDinh)
        ho_data = payload.model_dump(exclude={"DonGiaDien", "DonGiaNuoc"})
        ho = HoGiaDinh(**ho_data)
        db.add(ho)

        # Tự động tạo 2 đồng hồ (Điện + Nước)
        don_gia_dien = payload.DonGiaDien or DON_GIA_DIEN_MAC_DINH
        don_gia_nuoc = payload.DonGiaNuoc or DON_GIA_NUOC_MAC_DINH

        ma_dong_ho_dien = f"DH-{payload.MaHo}-D"
        ma_dong_ho_nuoc = f"DH-{payload.MaHo}-N"

        db.add(DongHo(MaDongHo=ma_dong_ho_dien, MaHo=payload.MaHo, Loai="Điện", DonGia=don_gia_dien))
        db.add(DongHo(MaDongHo=ma_dong_ho_nuoc, MaHo=payload.MaHo, Loai="Nước", DonGia=don_gia_nuoc))

        db.commit()
        db.refresh(ho)
        return ho
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.put("/{ma_ho}", response_model=HoGiaDinhResponse, summary="Cập nhật hộ gia đình")
def update_ho_gia_dinh(
    ma_ho: str,
    payload: HoGiaDinhUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Cập nhật thông tin hộ gia đình. **Chỉ admin.**"""
    try:
        ho = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == ma_ho).first()
        if not ho:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy hộ có mã '{ma_ho}'")

        update_data = payload.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(ho, field, value)

        db.commit()
        db.refresh(ho)
        return ho
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.delete("/{ma_ho}", response_model=MessageResponse, summary="Xóa hộ gia đình")
def delete_ho_gia_dinh(
    ma_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Xóa hộ gia đình theo MaHo. **Chỉ admin.**"""
    try:
        ho = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == ma_ho).first()
        if not ho:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy hộ có mã '{ma_ho}'")

        db.delete(ho)
        db.commit()
        return {"message": f"Đã xóa hộ gia đình '{ma_ho}' thành công"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")
