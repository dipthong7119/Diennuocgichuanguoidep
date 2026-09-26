"""
routers/ai_insight.py — Tích hợp AI phân tích lịch sử tiêu thụ điện/nước (có phân quyền)
Tuân thủ nguyên tắc ẩn danh hóa: KHÔNG gửi thông tin cá nhân lên AI API.

Phân quyền:
  - admin : toàn quyền
  - user  : chỉ phân tích/xem hóa đơn của phòng mình
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from dotenv import load_dotenv

from database import get_db, HoaDon, ChiSoTieuThu, DongHo, PhanTichAI
from schemas import AIInsightRequest, AIInsightResponse, AIQueryRequest, AIQueryResponse
from routers.auth import require_login, require_admin

load_dotenv()

router = APIRouter(prefix="/ai-insight", tags=["Phân Tích AI"])

# ── Constants ─────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "System: Bạn là trợ lý phân tích hóa đơn điện nước. "
    "Chỉ nhận xét từ dữ liệu được cung cấp, không tự tạo số liệu. "
    "Hãy trả lời NGẮN GỌN: tối đa 3-4 câu nhận xét chính và tối đa 3 gạch đầu dòng gợi ý tiết kiệm. "
    "Không lặp lại số liệu thô dài dòng."
)

USER_PROMPT_TEMPLATE = (
    "User: Lịch sử tiêu thụ 3 tháng qua: {mang_lich_su_dien_nuoc}. "
    "Hãy tóm tắt biến động và chỉ ra tháng cần kiểm tra rò rỉ nếu có, gợi ý cách tiết kiệm. "
    "Trả lời ngắn gọn."
)

# System prompt riêng cho tính năng Hỏi-đáp có truy vấn dữ liệu (retrieval theo hộ).
# Ràng buộc: CHỈ được trả lời dựa trên dữ liệu truy vấn được cung cấp trong prompt,
# không tự bịa số liệu, không suy đoán ngoài phạm vi dữ liệu.
QUERY_SYSTEM_PROMPT = (
    "System: Bạn là trợ lý thông minh về điện nước cho hộ gia đình. "
    "Bạn có 2 chế độ trả lời:\n"
    "1. Nếu câu hỏi LIÊN QUAN đến dữ liệu tiêu thụ/hóa đơn của hộ (có dữ liệu được cung cấp bên dưới): "
    "Bắt buộc trả lời DỰA TRÊN DỮ LIỆU THẬT, không bịa số liệu. "
    "Ghi rõ đây là 'dựa trên dữ liệu thực tế của bạn'.\n"
    "2. Nếu câu hỏi KHÔNG liên quan đến dữ liệu hộ (ví dụ: mẹo tiết kiệm điện chung, "
    "kiến thức phổ thông, gợi ý thiết bị...): Cho phép trả lời bằng kiến thức chung. "
    "Ghi rõ đây là 'gợi ý/kiến thức chung, tham khảo thêm nguồn khác'. "
    "KHÔNG được bịa số liệu của hộ khi trả lời câu hỏi chung.\n"
    "Luôn phân biệt rõ trong câu trả lời đâu là dữ liệu thật và đâu là gợi ý chung."
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
    user_prompt = USER_PROMPT_TEMPLATE.format(mang_lich_su_dien_nuoc=mang_lich_su)
    return _goi_ai_raw(SYSTEM_PROMPT, user_prompt, fallback=lambda: _mock_response(mang_lich_su))


def _goi_ai_raw(system_prompt: str, user_prompt: str, fallback) -> str:
    """
    Hàm dùng chung để gọi LLM (Gemini/OpenAI).
    Tự động thử nhiều model Gemini theo thứ tự ưu tiên nếu gặp lỗi 404/503.
    """
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    # ── Gemini (ưu tiên google.genai SDK mới) ─────────────────────────────────
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            return fallback()

        # Thử lần lượt: model từ .env → mới nhất → cũ hơn
        models_to_try = list(dict.fromkeys([
            os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            "gemini-2.5-flash",
            "gemini-3.8-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
        ]))

        for model_name in models_to_try:
            try:
                # Thử google.genai SDK mới trước
                try:
                    from google import genai as genai_new
                    client = genai_new.Client(api_key=api_key)
                    response = client.models.generate_content(
                        model=model_name, contents=full_prompt
                    )
                    return response.text
                except ImportError:
                    pass

                # Fallback: google.generativeai cũ
                import google.generativeai as genai_old
                genai_old.configure(api_key=api_key)
                model = genai_old.GenerativeModel(model_name=model_name)
                response = model.generate_content(full_prompt)
                return response.text

            except Exception as e:
                err_str = str(e)
                # 404/503 → thử model tiếp theo
                if any(c in err_str for c in ["503", "404", "not found", "UNAVAILABLE", "NOT_FOUND", "no longer available"]):
                    continue
                # Lỗi khác (auth, quota...) → fallback ngay
                return f"[Lỗi Gemini: {err_str[:100]}] " + fallback()

        # Tất cả models đều lỗi → fallback
        return "[Gemini quá tải, dùng phân tích cục bộ] " + fallback()

    # ── OpenAI ────────────────────────────────────────────────────────────────
    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key or api_key == "your_openai_api_key_here":
            return fallback()

        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"[Lỗi OpenAI API: {str(e)}] " + fallback()

    else:
        return fallback()


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


# ── Helper: Truy vấn dữ liệu hệ thống cho tính năng Hỏi-đáp (retrieval) ───────

def _truy_van_du_lieu_ho(db: Session, ma_ho: str, so_ky: int = 12) -> List[dict]:
    """
    Truy vấn `so_ky` kỳ chỉ số/hóa đơn gần nhất của một hộ, ẨN DANH HÓA
    (không có tên chủ hộ/SĐT/mã phòng) — đây là bước "retrieval" trước khi
    đưa vào prompt cho AI trả lời câu hỏi tự do của người dùng.
    """
    dong_hos = db.query(DongHo).filter(DongHo.MaHo == ma_ho).all()
    if not dong_hos:
        return []

    ma_dong_ho_list = [dh.MaDongHo for dh in dong_hos]
    loai_theo_dong_ho = {dh.MaDongHo: dh.Loai for dh in dong_hos}

    chi_so_records = (
        db.query(ChiSoTieuThu)
        .filter(ChiSoTieuThu.MaDongHo.in_(ma_dong_ho_list))
        .order_by(desc(ChiSoTieuThu.ThangNam))
        .limit(so_ky)
        .all()
    )

    hoa_dons = {
        hd.ThangNam: hd
        for hd in db.query(HoaDon).filter(HoaDon.MaHo == ma_ho).all()
    }

    ket_qua = []
    for cs in reversed(chi_so_records):  # cũ → mới cho dễ đọc
        hd = hoa_dons.get(cs.ThangNam)
        ket_qua.append({
            "thang": cs.ThangNam.isoformat(),
            "loai": loai_theo_dong_ho.get(cs.MaDongHo, "?"),
            "tieu_thu": cs.ChiSoMoi - cs.ChiSoCu,
            "tong_tien_hoa_don_thang": hd.TongTien if hd else None,
            "da_thanh_toan": hd.TrangThaiThanhToan if hd else None,
        })
    return ket_qua


def _mock_query_response(du_lieu: List[dict], cau_hoi: str) -> str:
    """
    Phân tích thông minh từ dữ liệu thật khi chưa cấu hình AI API Key.
    Tự động trả lời các câu hỏi phổ biến dựa trên dữ liệu truy vấn được.
    """
    if not du_lieu:
        return "Chưa có dữ liệu lịch sử của hộ này để phân tích."

    # Tách riêng dữ liệu điện và nước
    dien_data = [r for r in du_lieu if r.get("loai") == "Điện"]
    nuoc_data = [r for r in du_lieu if r.get("loai") == "Nước"]

    q = cau_hoi.lower()

    # ── Câu hỏi về tháng dùng nhiều nhất ─────────────────────────────────────
    if any(k in q for k in ["nhiều nhất", "nhiêu nhất", "cao nhất", "nhiều nhat", "cao nhat"]):
        lines = []
        if any(k in q for k in ["điện", "dien"]) or not any(k in q for k in ["nước", "nuoc"]):
            if dien_data:
                max_dien = max(dien_data, key=lambda r: r["tieu_thu"])
                lines.append(f"⚡ **Điện**: Tháng {max_dien['thang'][:7]} tiêu thụ nhiều nhất với **{max_dien['tieu_thu']} kWh**.")
        if any(k in q for k in ["nước", "nuoc"]) or not any(k in q for k in ["điện", "dien"]):
            if nuoc_data:
                max_nuoc = max(nuoc_data, key=lambda r: r["tieu_thu"])
                lines.append(f"💧 **Nước**: Tháng {max_nuoc['thang'][:7]} tiêu thụ nhiều nhất với **{max_nuoc['tieu_thu']} m³**.")
        if not lines:
            lines.append("Chưa đủ dữ liệu để xác định tháng tiêu thụ nhiều nhất.")
        return "\n".join(lines)

    # ── Câu hỏi về thanh toán ─────────────────────────────────────────────────
    if any(k in q for k in ["thanh toán", "thanh toan", "đã trả", "da tra", "chua tra", "chưa trả"]):
        lines = []
        thang_list = sorted(set(r["thang"] for r in du_lieu))
        for thang in thang_list:
            rec = next((r for r in du_lieu if r["thang"] == thang), None)
            if rec and rec.get("da_thanh_toan") is not None:
                trang_thai = "✅ Đã thanh toán" if rec["da_thanh_toan"] else "❌ Chưa thanh toán"
                tien = f" — {int(rec['tong_tien_hoa_don_thang']):,} đ" if rec.get("tong_tien_hoa_don_thang") else ""
                lines.append(f"📅 Tháng {thang[:7]}: {trang_thai}{tien}")
        return "\n".join(lines) if lines else "Chưa có thông tin thanh toán."

    # ── Câu hỏi về hóa đơn / tổng tiền ──────────────────────────────────────
    if any(k in q for k in ["hóa đơn", "hoa don", "tiền", "tien", "bao nhiêu", "bao nhieu"]):
        lines = ["📋 **Lịch sử hóa đơn:**"]
        thang_list = sorted(set(r["thang"] for r in du_lieu))
        for thang in thang_list:
            rec = next((r for r in du_lieu if r["thang"] == thang), None)
            if rec and rec.get("tong_tien_hoa_don_thang"):
                trang_thai = "✅" if rec.get("da_thanh_toan") else "❌"
                lines.append(f"  • Tháng {thang[:7]}: {int(rec['tong_tien_hoa_don_thang']):,} đ {trang_thai}")
        return "\n".join(lines)

    # ── Câu hỏi về lịch sử / xu hướng ───────────────────────────────────────
    if any(k in q for k in ["lịch sử", "lich su", "xu hướng", "xu huong", "thống kê", "thong ke", "tóm tắt", "tom tat"]):
        lines = ["📊 **Tóm tắt tiêu thụ:**"]
        if dien_data:
            tong_dien = sum(r["tieu_thu"] for r in dien_data)
            tb_dien = tong_dien / len(dien_data)
            lines.append(f"⚡ Điện: Trung bình **{tb_dien:.0f} kWh/tháng** (tổng {tong_dien} kWh / {len(dien_data)} tháng)")
        if nuoc_data:
            tong_nuoc = sum(r["tieu_thu"] for r in nuoc_data)
            tb_nuoc = tong_nuoc / len(nuoc_data)
            lines.append(f"💧 Nước: Trung bình **{tb_nuoc:.1f} m³/tháng** (tổng {tong_nuoc} m³ / {len(nuoc_data)} tháng)")
        return "\n".join(lines)

    # ── Câu hỏi tháng gần nhất / tháng này ──────────────────────────────────
    if any(k in q for k in ["tháng này", "thang nay", "gần nhất", "gan nhat", "mới nhất", "moi nhat", "vừa rồi"]):
        lines = ["📅 **Kỳ gần nhất:**"]
        thang_max = max(r["thang"] for r in du_lieu)
        recs = [r for r in du_lieu if r["thang"] == thang_max]
        lines.append(f"Tháng: **{thang_max[:7]}**")
        for r in recs:
            icon = "⚡" if r["loai"] == "Điện" else "💧"
            don_vi = "kWh" if r["loai"] == "Điện" else "m³"
            lines.append(f"{icon} {r['loai']}: **{r['tieu_thu']} {don_vi}**")
        if recs and recs[0].get("tong_tien_hoa_don_thang"):
            trang_thai = "✅ Đã thanh toán" if recs[0].get("da_thanh_toan") else "❌ Chưa thanh toán"
            lines.append(f"💰 Tổng hóa đơn: **{int(recs[0]['tong_tien_hoa_don_thang']):,} đ** — {trang_thai}")
        return "\n".join(lines)

    # ── Câu hỏi kiến thức chung (mẹo tiết kiệm, thiết bị, ...) ──────────
    general_keywords = [
        "mẹo", "meo", "tiết kiệm", "tiet kiem", "cách", "cach", "làm sao", "lam sao",
        "thiết bị", "thiet bi", "nên", "nen", "gợi ý", "goi y", "khuyên", "khuyen",
        "tại sao", "tai sao", "vì sao", "vi sao", "giải thích", "giai thich",
        "công suất", "cong suat", "giá điện", "gia dien", "giá nước", "gia nuoc",
    ]
    if any(k in q for k in general_keywords):
        lines = [
            "💡 **Gợi ý / Kiến thức chung** *(tham khảo thêm nguồn khác)*:\n",
        ]
        if any(k in q for k in ["tiết kiệm", "tiet kiem", "mẹo", "meo"]):
            lines.extend([
                "• Tắt thiết bị khi không sử dụng, rút phích cắm để tránh điện chờ.",
                "• Sử dụng đèn LED thay bóng sợi đốt, tiết kiệm đến 80% điện chiếu sáng.",
                "• Đặt điều hòa 26-28°C, vệ sinh lọc gió định kỳ.",
                "• Kiểm tra vòi nước, bồn cầu tránh rò rỉ ngầm.",
                "• Sử dụng máy giặt/rửa bát đầy tải để tối ưu nước và điện.",
            ])
        else:
            lines.extend([
                "• Điều hòa là thiết bị tiêu thụ điện nhiều nhất (1-3 kWh/giờ).",
                "• Bình nóng lạnh nên đặt hẹn giờ thay vì bật cả ngày.",
                "• 1 m³ nước ≈ 1000 lít — một vòi rò rỉ có thể lãng phí 15 m³/tháng.",
            ])
        return "\n".join(lines)

    # ── Câu trả lời mặc định (không khớp câu hỏi nào) ───────────────────────
    thang_list = sorted(set(r["thang"] for r in du_lieu))
    lines = [
        f"📋 Tôi có dữ liệu {len(thang_list)} tháng của hộ này ({thang_list[0][:7]} → {thang_list[-1][:7]}).",
        "",
        "Bạn có thể hỏi tôi:",
        "  • Tháng nào dùng điện/nước nhiều nhất?",
        "  • Hóa đơn tháng [X] là bao nhiêu?",
        "  • Tháng nào chưa thanh toán?",
        "  • Tóm tắt lịch sử tiêu thụ",
        "  • Mẹo tiết kiệm điện nước",
        "",
        "💡 *Để có phân tích AI nâng cao bằng ngôn ngữ tự nhiên, hãy cấu hình*",
        "   *`GEMINI_API_KEY` trong file `.env` (miễn phí tại aistudio.google.com)*",
    ]
    return "\n".join(lines)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/generate",
    response_model=AIInsightResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo phân tích AI cho hóa đơn"
)
def generate_ai_insight(
    payload: AIInsightRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Phân tích lịch sử tiêu thụ 3 tháng gần nhất bằng AI và lưu kết quả vào PhanTichAI.

    **Nguyên tắc ẩn danh hóa**: Chỉ gửi mảng số liệu lên AI, không gửi tên/SĐT/mã phòng.
    - **Admin**: phân tích bất kỳ hóa đơn nào.
    - **User thường**: chỉ phân tích hóa đơn của phòng mình.
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

        # 2. Phân quyền: user thường chỉ được phân tích phòng của mình
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != payload.ma_ho:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền phân tích hóa đơn của phòng này"
                )

        # 3. Lấy đồng hồ thuộc hộ gia đình này
        dong_hos = db.query(DongHo).filter(DongHo.MaHo == payload.ma_ho).all()
        if not dong_hos:
            raise HTTPException(status_code=404,
                                detail=f"Hộ '{payload.ma_ho}' chưa có đồng hồ nào")

        ma_dong_ho_list = [dh.MaDongHo for dh in dong_hos]

        # 4. Lấy 3 tháng gần nhất — CHỈ LẤY SỐ LIỆU, ẨN DANH HÓA
        lich_su_records = (
            db.query(ChiSoTieuThu)
            .filter(ChiSoTieuThu.MaDongHo.in_(ma_dong_ho_list))
            .order_by(desc(ChiSoTieuThu.ThangNam))
            .limit(3)
            .all()
        )

        # 5. Chuẩn bị mảng số (ẩn danh — không chứa tên/SĐT/MaPhong)
        # Đảo ngược để thứ tự từ cũ → mới
        mang_tieu_thu: List[int] = [
            r.ChiSoMoi - r.ChiSoCu for r in reversed(lich_su_records)
        ]

        # 6. Gọi AI API (ẩn danh)
        noi_dung = _goi_ai_api(mang_tieu_thu)

        # 7. Xác định mức độ cảnh báo
        muc_do = _xac_dinh_muc_do(mang_tieu_thu)

        # 8. Lưu vào PhanTichAI
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

        # 9. Trả về kèm DuLieuBieuDo (không lưu vào DB, chỉ trả kèm response)
        from schemas import AIInsightResponse
        return AIInsightResponse(
            MaDanhGia=phan_tich.MaDanhGia,
            MaHoaDon=phan_tich.MaHoaDon,
            NoiDungNhanXet=phan_tich.NoiDungNhanXet,
            MucDoCanhBao=phan_tich.MucDoCanhBao,
            DuLieuBieuDo=mang_tieu_thu,
        )

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
def get_ai_insights(
    ma_hoa_don: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Lấy tất cả kết quả phân tích AI đã tạo cho một hóa đơn.
    - **Admin**: xem kết quả của bất kỳ hóa đơn nào.
    - **User thường**: chỉ xem kết quả hóa đơn thuộc phòng mình.
    """
    try:
        # Nếu là user thường, kiểm tra hóa đơn này có thuộc phòng của họ không
        if current_user["role"] != "admin":
            hoa_don = db.query(HoaDon).filter(HoaDon.MaHoaDon == ma_hoa_don).first()
            if not hoa_don:
                raise HTTPException(status_code=404,
                                    detail=f"Không tìm thấy hóa đơn '{ma_hoa_don}'")
            if current_user.get("ma_ho") != hoa_don.MaHo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền xem phân tích của hóa đơn này"
                )

        results = db.query(PhanTichAI).filter(
            PhanTichAI.MaHoaDon == ma_hoa_don
        ).all()
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi CSDL: {str(e)}")


@router.post(
    "/hoi-dap",
    response_model=AIQueryResponse,
    summary="Hỏi-đáp AI có truy vấn dữ liệu hệ thống (retrieval theo hộ)"
)
def hoi_dap_ai(
    payload: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_login),   # phải đăng nhập
):
    """
    Cho phép người dùng đặt câu hỏi tự do về dữ liệu tiêu thụ/hóa đơn hoặc câu hỏi chung.

    Luồng xử lý:
    1. **Truy vấn (Retrieval)**: lấy tối đa 12 kỳ chỉ số/hóa đơn gần nhất của hộ từ CSDL,
       ẩn danh hóa (không có tên/SĐT/mã phòng).
    2. **Augmentation**: chèn dữ liệu và câu hỏi vào prompt.
    3. **Generation**: AI trả lời dựa trên dữ liệu nếu câu hỏi về dữ liệu hộ;
       hoặc trả lời bằng kiến thức chung nếu câu hỏi ngoài phạm vi dữ liệu hộ
       (ví dụ: mẹo tiết kiệm điện, kiến thức phổ thông, gợi ý thiết bị).

    - **Admin**: hỏi về bất kỳ hộ nào.
    - **User thường**: chỉ hỏi về hộ của chính mình.
    """
    try:
        # 1. Phân quyền
        if current_user["role"] != "admin":
            if current_user.get("ma_ho") != payload.ma_ho:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Bạn không có quyền truy vấn dữ liệu của hộ khác"
                )

        # 2. Truy vấn hộ tồn tại
        du_lieu = _truy_van_du_lieu_ho(db, payload.ma_ho, so_ky=12)
        if not du_lieu:
            raise HTTPException(
                status_code=404,
                detail=f"Hộ '{payload.ma_ho}' chưa có dữ liệu chỉ số/hóa đơn nào để truy vấn"
            )

        # 3. Ghép prompt: dữ liệu truy vấn được (retrieval) + câu hỏi người dùng
        user_prompt = (
            f"User: Dữ liệu lịch sử tiêu thụ/hóa đơn của hộ (từ cũ đến mới, "
            f"đã ẩn danh): {du_lieu}\n"
            f"Câu hỏi: {payload.cau_hoi}"
        )

        # 4. Gọi AI (fallback sang mock nếu chưa cấu hình API key)
        tra_loi = _goi_ai_raw(
            QUERY_SYSTEM_PROMPT,
            user_prompt,
            fallback=lambda: _mock_query_response(du_lieu, payload.cau_hoi),
        )

        return AIQueryResponse(
            cau_hoi=payload.cau_hoi,
            tra_loi=tra_loi,
            so_ky_du_lieu_dung=len(du_lieu),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI hỏi-đáp: {str(e)}")
