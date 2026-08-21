"""
routers/dong_ho.py — CRUD cho bảng DongHo
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, DongHo, HoGiaDinh
from schemas import DongHoCreate, DongHoUpdate, DongHoResponse, MessageResponse

router = APIRouter(prefix="/dong-ho", tags=["Đồng Hồ"])


@router.get("/", response_model=List[DongHoResponse], summary="Lấy danh sách đồng hồ")
def get_all_dong_ho(db: Session = Depends(get_db)):
    """Trả về toàn bộ danh sách đồng hồ điện/nước."""
    try:
        return db.query(DongHo).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/{ma_dong_ho}", response_model=DongHoResponse, summary="Lấy thông tin 1 đồng hồ")
def get_dong_ho(ma_dong_ho: str, db: Session = Depends(get_db)):
    """Trả về thông tin đồng hồ theo MaDongHo."""
    try:
        dh = db.query(DongHo).filter(DongHo.MaDongHo == ma_dong_ho).first()
        if not dh:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy đồng hồ '{ma_dong_ho}'")
        return dh
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/theo-ho/{ma_ho}", response_model=List[DongHoResponse],
            summary="Lấy đồng hồ theo hộ gia đình")
def get_dong_ho_by_ho(ma_ho: str, db: Session = Depends(get_db)):
    """Trả về danh sách đồng hồ thuộc một hộ gia đình."""
    try:
        return db.query(DongHo).filter(DongHo.MaHo == ma_ho).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.post("/", response_model=DongHoResponse, status_code=status.HTTP_201_CREATED,
             summary="Thêm đồng hồ mới")
def create_dong_ho(payload: DongHoCreate, db: Session = Depends(get_db)):
    """Thêm đồng hồ điện hoặc nước mới. Loai phải là 'Điện' hoặc 'Nước'."""
    try:
        # Kiểm tra HoGiaDinh tồn tại
        ho = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == payload.MaHo).first()
        if not ho:
            raise HTTPException(status_code=404,
                                detail=f"Không tìm thấy hộ gia đình '{payload.MaHo}'")

        # Kiểm tra MaDongHo trùng lặp
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
def update_dong_ho(ma_dong_ho: str, payload: DongHoUpdate, db: Session = Depends(get_db)):
    """Cập nhật Loai hoặc DonGia của đồng hồ."""
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
def delete_dong_ho(ma_dong_ho: str, db: Session = Depends(get_db)):
    """Xóa đồng hồ theo MaDongHo."""
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
