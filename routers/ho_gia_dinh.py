"""
routers/ho_gia_dinh.py — CRUD cho bảng HoGiaDinh
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, HoGiaDinh
from schemas import HoGiaDinhCreate, HoGiaDinhUpdate, HoGiaDinhResponse, MessageResponse

router = APIRouter(prefix="/ho-gia-dinh", tags=["Hộ Gia Đình"])


@router.get("/", response_model=List[HoGiaDinhResponse], summary="Lấy danh sách hộ gia đình")
def get_all_ho_gia_dinh(db: Session = Depends(get_db)):
    """Trả về toàn bộ danh sách hộ gia đình."""
    try:
        return db.query(HoGiaDinh).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.get("/{ma_ho}", response_model=HoGiaDinhResponse, summary="Lấy thông tin 1 hộ gia đình")
def get_ho_gia_dinh(ma_ho: str, db: Session = Depends(get_db)):
    """Trả về thông tin hộ gia đình theo MaHo."""
    try:
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
def create_ho_gia_dinh(payload: HoGiaDinhCreate, db: Session = Depends(get_db)):
    """Tạo một hộ gia đình mới. MaHo phải duy nhất."""
    try:
        existing = db.query(HoGiaDinh).filter(HoGiaDinh.MaHo == payload.MaHo).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"MaHo '{payload.MaHo}' đã tồn tại")

        ho = HoGiaDinh(**payload.model_dump())
        db.add(ho)
        db.commit()
        db.refresh(ho)
        return ho
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.put("/{ma_ho}", response_model=HoGiaDinhResponse, summary="Cập nhật hộ gia đình")
def update_ho_gia_dinh(ma_ho: str, payload: HoGiaDinhUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin hộ gia đình. Chỉ cần truyền các trường muốn thay đổi."""
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
def delete_ho_gia_dinh(ma_ho: str, db: Session = Depends(get_db)):
    """Xóa hộ gia đình theo MaHo."""
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
