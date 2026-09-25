"""
routers/dong_ho.py — CRUD cho bảng DongHo (có phân quyền)

Phân quyền:
  - admin : toàn quyền
  - user  : chỉ xem đồng hồ thuộc phòng của chính mình
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, DongHo, HoGiaDinh
from schemas import DongHoCreate, DongHoUpdate, DongHoResponse, MessageResponse
from routers.auth import require_login, require_admin

router = APIRouter(prefix="/dong-ho", tags=["Đồng Hồ"])


@router.get("/", response_model=List[DongHoResponse], summary="Lấy danh sách đồng hồ")
def get_all_dong_ho(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Trả về toàn bộ danh sách đồng hồ điện/nước. **Chỉ admin.**"""
    try:
        return db.query(DongHo).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/theo-ho/{ma_ho}", response_model=List[DongHoResponse],
            summary="Lấy đồng hồ theo hộ gia đình")
def get_dong_ho_by_ho(
    ma_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Trả về danh sách đồng hồ thuộc một hộ gia đình.
    - **Admin**: xem bất kỳ hộ nào.
    - **User thường**: chỉ xem đồng hồ thuộc phòng của mình.
    """
    try:
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != ma_ho:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem đồng hồ của phòng này"
                )
        return db.query(DongHo).filter(DongHo.MaHo == ma_ho).all()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/{ma_dong_ho}", response_model=DongHoResponse, summary="Lấy thông tin 1 đồng hồ")
def get_dong_ho(
    ma_dong_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Trả về thông tin đồng hồ theo MaDongHo.
    - **Admin**: xem bất kỳ đồng hồ nào.
    - **User thường**: chỉ xem đồng hồ thuộc phòng của mình.
    """
    try:
        dh = db.query(DongHo).filter(DongHo.MaDongHo == ma_dong_ho).first()
        if not dh:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy đồng hồ '{ma_dong_ho}'")

        # User thường chỉ được xem đồng hồ thuộc phòng của mình
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != dh.MaHo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem đồng hồ này"
                )
        return dh
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.post("/", response_model=DongHoResponse, status_code=status.HTTP_201_CREATED,
             summary="Thêm đồng hồ mới")
def create_dong_ho(
    payload: DongHoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Thêm đồng hồ điện hoặc nước mới. **Chỉ admin.**"""
    try:
        ho = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == payload.MaHo).first()
        if not ho:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy hộ gia đình '{payload.MaHo}'")

        existing = db.query(DongHo).filter(DongHo.MaDongHo == payload.MaDongHo).first()
        if existing:
            raise HTTPException(status_code=409,
                                detail=f"MaDongHo '{payload.MaDongHo}' đã tồn tại")

        dh = DongHo(**payload.model_dump())
        db.add(dh)
        db.commit()
        db.refresh(dh)
        return dh
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.put("/{ma_dong_ho}", response_model=DongHoResponse, summary="Cập nhật đồng hồ")
def update_dong_ho(
    ma_dong_ho: str,
    payload: DongHoUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Cập nhật Loai hoặc DonGia của đồng hồ. **Chỉ admin.**"""
    try:
        dh = db.query(DongHo).filter(DongHo.MaDongHo == ma_dong_ho).first()
        if not dh:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy đồng hồ '{ma_dong_ho}'")

        update_data = payload.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(dh, field, value)

        db.commit()
        db.refresh(dh)
        return dh
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.delete("/{ma_dong_ho}", response_model=MessageResponse, summary="Xóa đồng hồ")
def delete_dong_ho(
    ma_dong_ho: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),   # chỉ admin
):
    """Xóa đồng hồ theo MaDongHo. **Chỉ admin.**"""
    try:
        dh = db.query(DongHo).filter(DongHo.MaDongHo == ma_dong_ho).first()
        if not dh:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy đồng hồ '{ma_dong_ho}'")

        db.delete(dh)
        db.commit()
        return {"message": f"Đã xóa đồng hồ '{ma_dong_ho}' thành công"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")
