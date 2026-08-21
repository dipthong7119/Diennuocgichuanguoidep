"""
routers/ai_insight.py — Tích hợp AI phân tích lịch sử tiêu thụ điện/nước
Tuân thủ nguyên tắc ẩn danh hóa: KHÔNG gửi thông tin cá nhân lên AI API.
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from dotenv import load_dotenv

from database import get_db, HoaDon, ChiSoTieuThu, DongHo, PhanTichAI
from schemas import AIInsightRequest, AIInsightResponse

load_dotenv()

router = APIRouter(prefix="/ai-insight", tags=["Phân Tích AI"])

# ── Constants ─────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "System: Bạn là trợ lý phân tích hóa đơn điện nước. "
    "Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu."
)

USER_PROMPT_TEMPLATE = (
    "User: Lịch sử tiêu thụ 3 tháng qua: {mang_lich_su_dien_nuoc}. "
    "Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra rò rỉ nếu có, gợi ý cách tiết kiệm."
)

MUC_DO_CANH_BAO = {
    "binh_thuong": "Bình thường",
    "cao":         "Cao",
    "nguy_hiem":   "Nguy hiểm",
}


# ── Helper: Xác định mức độ cảnh báo ─────────────────────────────────────────

def _xac_dinh_muc_do(lich_su: List[int]) -> str:
    """
    Dựa vào % tăng của tháng gần nhất so với tháng trước để xác định mức cảnh báo.
    - Tăng < 20%: Bình thường
    - Tăng 20-50%: Cao
    - Tăng > 50%: Nguy hiểm
    """
    if len(lich_su) < 2:
        return MUC_DO_CANH_BAO["binh_thuong"]

    # lich_su được sắp xếp từ cũ → mới; so sánh 2 tháng gần nhất
    truoc = lich_su[-2]
    hien_tai = lich_su[-1]

    if truoc == 0:
        return MUC_DO_CANH_BAO["nguy_hiem"] if hien_tai > 0 else MUC_DO_CANH_BAO["binh_thuong"]

    phan_tram_tang = ((hien_tai - truoc) / truoc) * 100

    if phan_tram_tang < 20:
        return MUC_DO_CANH_BAO["binh_thuong"]
    elif phan_tram_tang <= 50:
        return MUC_DO_CANH_BAO["cao"]
    else:
        return MUC_DO_CANH_BAO["nguy_hiem"]


# ── Helper: Gọi AI API ────────────────────────────────────────────────────────

def _goi_ai_api(mang_lich_su: List[int]) -> str:
    """
    Gửi mảng số liệu ẩn danh đến LLM và nhận kết quả phân tích.
    Hỗ trợ Gemini và OpenAI. Nếu không có key → trả mock response.
    """
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    user_prompt = USER_PROMPT_TEMPLATE.format(mang_lich_su_dien_nuoc=mang_lich_su)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"

    # ── Gemini ────────────────────────────────────────────────────────────────
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            return _mock_response(mang_lich_su)

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            model = genai.GenerativeModel(model_name=model_name)
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f"[Lỗi Gemini API: {str(e)}] " + _mock_response(mang_lich_su)

    # ── OpenAI ────────────────────────────────────────────────────────────────
    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key or api_key == "your_openai_api_key_here":
            return _mock_response(mang_lich_su)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": user_prompt},
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Lỗi OpenAI API: {str(e)}] " + _mock_response(mang_lich_su)

    else:
        return _mock_response(mang_lich_su)


def _mock_response(mang_lich_su: List[int]) -> str:
    """Trả về phân tích mẫu khi không có AI API key."""
    if not mang_lich_su:
        return "Chưa đủ dữ liệu để phân tích."

    tb = sum(mang_lich_su) / len(mang_lich_su)
    max_val = max(mang_lich_su)
    return (
        f"[Mock - Chưa cấu hình AI API Key]\n"
        f"Dữ liệu tiêu thụ 3 tháng: {mang_lich_su}.\n"
        f"Trung bình: {tb:.1f} đơn vị/tháng. Mức cao nhất: {max_val} đơn vị.\n"
        f"Khuyến nghị: Kiểm tra thiết bị sử dụng nhiều điện/nước nhất để tiết kiệm chi phí."
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/generate",
    response_model=AIInsightResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo phân tích AI cho hóa đơn"
)
def generate_ai_insight(payload: AIInsightRequest, db: Session = Depends(get_db)):
    """
    Phân tích lịch sử tiêu thụ 3 tháng gần nhất bằng AI và lưu kết quả vào PhanTichAI.

    **Nguyên tắc ẩn danh hóa**: Chỉ gửi mảng số liệu lên AI, không gửi tên/SĐT/mã phòng.
    """
    try:
        # 1. Kiểm tra hóa đơn tồn tại
        hoa_don = db.query(HoaDon).filter(
            HoaDon.MaHoaDon == payload.ma_hoa_don,
            HoaDon.MaHo == payload.ma_ho
        ).first()
        if not hoa_don:
            raise HTTPException(
                status_code=404,
                detail=f"Không tìm thấy hóa đơn '{payload.ma_hoa_don}' của hộ '{payload.ma_ho}'"
            )

        # 2. Lấy đồng hồ thuộc hộ gia đình này
        dong_hos = db.query(DongHo).filter(DongHo.MaHo == payload.ma_ho).all()
        if not dong_hos:
            raise HTTPException(status_code=404,
                                detail=f"Hộ '{payload.ma_ho}' chưa có đồng hồ nào")

        ma_dong_ho_list = [dh.MaDongHo for dh in dong_hos]

        # 3. Lấy 3 tháng gần nhất — CHỈ LẤY SỐ LIỆU, ẨN DANH HÓA
        lich_su_records = (
            db.query(ChiSoTieuThu)
            .filter(ChiSoTieuThu.MaDongHo.in_(ma_dong_ho_list))
            .order_by(desc(ChiSoTieuThu.ThangNam))
            .limit(3)
            .all()
        )

        # 4. Chuẩn bị mảng số (ẩn danh — không chứa tên/SĐT/MaPhong)
        # Đảo ngược để thứ tự từ cũ → mới
        mang_tieu_thu: List[int] = [
            r.ChiSoMoi - r.ChiSoCu for r in reversed(lich_su_records)
        ]

        # 5. Gọi AI API (ẩn danh)
        noi_dung = _goi_ai_api(mang_tieu_thu)

        # 6. Xác định mức độ cảnh báo
        muc_do = _xac_dinh_muc_do(mang_tieu_thu)

        # 7. Lưu vào PhanTichAI
        ma_danh_gia = f"AI-{uuid.uuid4().hex[:8].upper()}"
        phan_tich = PhanTichAI(
            MaDanhGia=ma_danh_gia,
            MaHoaDon=payload.ma_hoa_don,
            NoiDungNhanXet=noi_dung,
            MucDoCanhBao=muc_do,
        )
        db.add(phan_tich)
        db.commit()
        db.refresh(phan_tich)
        return phan_tich

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI: {str(e)}")


@router.get(
    "/{ma_hoa_don}",
    response_model=List[AIInsightResponse],
    summary="Lấy kết quả phân tích AI của một hóa đơn"
)
def get_ai_insights(ma_hoa_don: str, db: Session = Depends(get_db)):
    """Lấy tất cả kết quả phân tích AI đã tạo cho một hóa đơn."""
    try:
        results = db.query(PhanTichAI).filter(
            PhanTichAI.MaHoaDon == ma_hoa_don
        ).all()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")
