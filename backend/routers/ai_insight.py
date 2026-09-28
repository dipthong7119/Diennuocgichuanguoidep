"""
routers/ai_insight.py — Tích hợp AI phân tích lịch sử tiêu thụ điện/nước (có phân quyền)
Tuân thủ nguyên tắc ẩn danh hóa: KHÔNG gửi thông tin cá nhân lên AI API.

Phân quyền:
  - admin : toàn quyền
  - user  : chỉ phân tích/xem hóa đơn của phòng mình
"""

import json
import os
import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from dotenv import load_dotenv
from urllib.parse import urlencode
from urllib.request import Request as URLRequest, urlopen

from database import get_db, HoaDon, ChiSoTieuThu, DongHo, PhanTichAI
from schemas import AIInsightRequest, AIInsightResponse, AIQueryRequest, AIQueryResponse
from routers.auth import require_login, require_admin

load_dotenv()

router = APIRouter(prefix="/ai-insight", tags=["Phân Tích AI"])

# ── Constants ─────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "System: Bạn là trợ lý phân tích hóa đơn điện nước. "
    "Trả lời bằng tiếng Việt tự nhiên, rõ ràng và dễ đọc. Chỉ dùng dữ liệu được cung cấp, không tự tạo số liệu. "
    "Không chào hỏi, không nhắc lại mảng số thô, không dùng thuật ngữ kỹ thuật nếu không cần. "
    "Dùng đúng hai mục: '**Nhận xét**' với 1-2 câu ngắn nêu mức dùng và thay đổi đáng chú ý; "
    "'**Gợi ý tiết kiệm**' với tối đa 3 gạch đầu dòng cụ thể. "
    "So sánh riêng điện (kWh) và nước (m³), không cộng hai đơn vị. "
    "Chỉ nêu phần trăm khi tính được từ dữ liệu; nếu thiếu kỳ so sánh, nói rõ chưa đủ dữ liệu."
)

USER_PROMPT_TEMPLATE = (
    "User: Lịch sử tối đa 3 tháng, mỗi phần tử có tháng, điện (kWh) và nước (m³): "
    "{mang_lich_su_dien_nuoc}. Không cộng hai đơn vị với nhau. "
    "Hãy nêu kỳ mới nhất, xu hướng so với kỳ trước nếu có dữ liệu, và một vài gợi ý phù hợp. "
    "Chỉ nhắc đến rò rỉ nước khi số liệu nước thực sự cho thấy mức tăng đáng chú ý."
)

# System prompt riêng cho tính năng Hỏi-đáp có truy vấn dữ liệu (retrieval theo hộ).
# Ràng buộc: CHỈ được trả lời dựa trên dữ liệu truy vấn được cung cấp trong prompt,
# không tự bịa số liệu, không suy đoán ngoài phạm vi dữ liệu.
QUERY_SYSTEM_PROMPT = (
    "System: Bạn là trợ lý điện nước thân thiện, trả lời bằng tiếng Việt tự nhiên và súc tích. "
    "Nếu câu hỏi về hóa đơn hoặc mức tiêu thụ, chỉ dùng dữ liệu hộ được cung cấp; nêu kỳ và đơn vị rõ ràng, "
    "không đoán số. Có thể mở đầu tự nhiên bằng 'Theo hóa đơn...' khi cần phân biệt dữ liệu. "
    "Nếu câu hỏi là kiến thức chung, hãy trả lời trực tiếp, không ép mọi câu trả lời vào một mẫu cố định. "
    "Với thông tin có thể thay đổi theo thời gian như giá điện, hãy dùng Google Search và dẫn nguồn; "
    "nếu không xác minh được, nói ngắn gọn rằng chưa có nguồn cập nhật. "
    "Trình bày theo đoạn ngắn hoặc gạch đầu dòng khi hữu ích; tránh lời dẫn dài, lặp lại câu hỏi, "
    "các nhãn máy móc như 'dữ liệu thật/kiến thức chung', và mọi số liệu không có căn cứ."
)

MUC_DO_CANH_BAO = {
    "binh_thuong": "Bình thường",
    "cao":         "Cao",
    "nguy_hiem":   "Nguy hiểm",
}


# ── Helper: Xác định mức độ cảnh báo ─────────────────────────────────────────

def _xac_dinh_muc_do(lich_su: List[int] | List[dict]) -> str:
    """
    Dựa vào % tăng của tháng gần nhất so với tháng trước để xác định mức cảnh báo.
    - Tăng < 20%: Bình thường
    - Tăng 20-50%: Cao
    - Tăng > 50%: Nguy hiểm
    """
    if len(lich_su) < 2:
        return MUC_DO_CANH_BAO["binh_thuong"]

    # lich_su được sắp xếp từ cũ → mới. Nếu có dữ liệu từng loại,
    # đánh giá riêng điện và nước để không cộng hai đơn vị khác nhau.
    if isinstance(lich_su[-1], dict):
        changes = []
        for utility in ("dien", "nuoc"):
            previous = lich_su[-2].get(utility, 0)
            current = lich_su[-1].get(utility, 0)
            if previous == 0:
                if current > 0:
                    changes.append(100.0)
            else:
                changes.append(((current - previous) / previous) * 100)
        if not changes:
            return MUC_DO_CANH_BAO["binh_thuong"]
        phan_tram_tang = max(changes)
    else:
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

def _goi_ai_api(mang_lich_su: List[int] | List[dict]) -> str:
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


def _goi_ai_hoi_dap(system_prompt: str, user_prompt: str, fallback) -> tuple[str, list[dict[str, str]]]:
    """Trả lời hội thoại tự do; Gemini dùng Google Search cho câu hỏi cần dữ liệu mới."""
    if os.getenv("AI_PROVIDER", "gemini").lower() != "gemini":
        return _goi_ai_raw(system_prompt, user_prompt, fallback), []

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return fallback(), []

    model_name = os.getenv("GEMINI_SEARCH_MODEL", "gemini-2.5-flash")
    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?{urlencode({'key': api_key})}"
    )
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
        "tools": [{"google_search": {}}],
        "generationConfig": {"temperature": 0.2},
    }

    try:
        request = URLRequest(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))

        candidate = (result.get("candidates") or [{}])[0]
        parts = candidate.get("content", {}).get("parts", [])
        answer = "\n".join(part["text"] for part in parts if part.get("text"))
        if not answer:
            return fallback(), []

        sources = []
        seen_urls = set()
        for chunk in candidate.get("groundingMetadata", {}).get("groundingChunks", []):
            web_source = chunk.get("web") or {}
            url = web_source.get("uri")
            if url and url not in seen_urls:
                seen_urls.add(url)
                sources.append({
                    "title": web_source.get("title") or "Nguồn tham khảo",
                    "url": url,
                })
        return answer, sources[:5]
    except Exception:
        # Không báo một câu trả lời chưa được kiểm chứng là thông tin hiện hành.
        return fallback(), []


def _mock_response(mang_lich_su: List[int] | List[dict]) -> str:
    """Trả về phân tích mẫu khi không có AI API key."""
    if not mang_lich_su:
        return "Chưa có đủ số liệu để phân tích hóa đơn này."

    if isinstance(mang_lich_su[0], dict):
        lines = ["**Phân tích mẫu** *(Gemini chưa được cấu hình)*", "", "**Nhận xét**"]
        for key, label, unit in (("dien", "Điện", "kWh"), ("nuoc", "Nước", "m³")):
            records = [item for item in mang_lich_su if key in item]
            if not records:
                continue

            latest = records[-1]
            value = latest.get(key, 0)
            period = latest.get("thang", "")
            try:
                year, month = period.split("-")
                period_label = f"{int(month)}/{year}"
            except (ValueError, AttributeError):
                period_label = period or "gần nhất"

            sentence = f"{label} kỳ {period_label}: {value} {unit}"
            if len(records) > 1:
                previous = records[-2].get(key, 0)
                previous_period = records[-2].get("thang", "")
                try:
                    previous_year, previous_month = previous_period.split("-")
                    previous_label = f"{int(previous_month)}/{previous_year}"
                except (ValueError, AttributeError):
                    previous_label = "trước"

                if previous == 0:
                    if value > 0:
                        sentence += f", bắt đầu tăng so với kỳ {previous_label}"
                else:
                    change = round((value - previous) / previous * 100)
                    if change > 0:
                        sentence += f", tăng {change}% so với kỳ {previous_label}"
                    elif change < 0:
                        sentence += f", giảm {abs(change)}% so với kỳ {previous_label}"
                    else:
                        sentence += f", giữ nguyên so với kỳ {previous_label}"
            lines.append(f"• {sentence}.")

        lines.extend([
            "",
            "**Gợi ý tiết kiệm**",
            "• Theo dõi chỉ số điện và nước mỗi kỳ để nhận ra thay đổi sớm.",
            "• Tắt thiết bị khi không sử dụng; kiểm tra vòi nước nếu mức dùng tăng bất thường.",
        ])
        return "\n".join(lines)

    return (
        "**Phân tích mẫu** *(Gemini chưa được cấu hình)*\n\n"
        "Chưa có đủ thông tin từng loại đồng hồ để tách riêng xu hướng điện và nước. "
        "Hãy xem biểu đồ tiêu thụ để đối chiếu các kỳ gần đây."
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


def _du_lieu_bieu_do(db: Session, ma_ho: str, den_ky: date) -> List[dict]:
    """Gom tối đa 3 kỳ gần nhất thành hai chuỗi điện/nước cùng trục thời gian."""
    records = (
        db.query(ChiSoTieuThu, DongHo.Loai)
        .join(DongHo, ChiSoTieuThu.MaDongHo == DongHo.MaDongHo)
        .filter(DongHo.MaHo == ma_ho, ChiSoTieuThu.ThangNam <= den_ky)
        .order_by(ChiSoTieuThu.ThangNam.asc())
        .all()
    )
    by_month: dict[date, dict] = {}
    for reading, utility_type in records:
        month = reading.ThangNam.replace(day=1)
        item = by_month.setdefault(month, {
            "thang": month.strftime("%Y-%m"), "dien": 0, "nuoc": 0,
        })
        key = "dien" if utility_type == "Điện" else "nuoc"
        item[key] += reading.ChiSoMoi - reading.ChiSoCu
    return [by_month[month] for month in sorted(by_month)[-3:]]


def _tao_hoac_cap_nhat_phan_tich(db: Session, hoa_don: HoaDon) -> AIInsightResponse:
    chart_data = _du_lieu_bieu_do(db, hoa_don.MaHo, hoa_don.ThangNam)
    noi_dung = _goi_ai_api(chart_data)
    muc_do = _xac_dinh_muc_do(chart_data)

    phan_tich = (
        db.query(PhanTichAI)
        .filter(PhanTichAI.MaHoaDon == hoa_don.MaHoaDon)
        .order_by(PhanTichAI.MaDanhGia.desc())
        .first()
    )
    if phan_tich:
        phan_tich.NoiDungNhanXet = noi_dung
        phan_tich.MucDoCanhBao = muc_do
    else:
        phan_tich = PhanTichAI(
            MaDanhGia=f"AI-{uuid.uuid4().hex[:8].upper()}",
            MaHoaDon=hoa_don.MaHoaDon,
            NoiDungNhanXet=noi_dung,
            MucDoCanhBao=muc_do,
        )
        db.add(phan_tich)

    db.commit()
    db.refresh(phan_tich)
    return AIInsightResponse(
        MaDanhGia=phan_tich.MaDanhGia,
        MaHoaDon=phan_tich.MaHoaDon,
        NoiDungNhanXet=phan_tich.NoiDungNhanXet,
        MucDoCanhBao=phan_tich.MucDoCanhBao,
        DuLieuBieuDo=chart_data,
    )


def _dinh_dang_ky_chat(ky: str) -> str:
    """Đổi YYYY-MM thành MM/YYYY để câu trả lời dễ đọc hơn."""
    try:
        year, month = ky[:7].split("-")
        return f"{int(month):02d}/{year}"
    except (ValueError, AttributeError):
        return ky


def _dinh_dang_tien_chat(amount: float | int) -> str:
    return f"{int(amount):,}".replace(",", ".") + " đ"


def _mock_query_response(du_lieu: List[dict], cau_hoi: str) -> str:
    """
    Phân tích thông minh từ dữ liệu thật khi chưa cấu hình AI API Key.
    Tự động trả lời các câu hỏi phổ biến dựa trên dữ liệu truy vấn được.
    """
    q = cau_hoi.lower()
    asks_electric_price = any(term in q for term in ("giá", "gia", "bao nhiêu", "bao nhieu")) and any(
        term in q for term in ("điện", "dien", "kwh", "số điện", "so dien")
    )
    if asks_electric_price:
        return (
            "Biểu giá điện sinh hoạt được chia theo bậc tiêu thụ nên không có một mức chung cho mọi kWh. "
            "Nhà cho thuê có thể áp dụng cách tính riêng. Hiện Gemini chưa được cấu hình nên tôi chưa thể "
            "xác minh mức giá mới nhất; bạn có thể xem nguồn EVN bên dưới."
        )

    if not du_lieu:
        if any(k in q for k in ["mẹo", "meo", "tiết kiệm", "tiet kiem", "cách", "cach", "thiết bị", "thiet bi"]):
            return (
                "**Gợi ý tiết kiệm**\n"
                "• Tắt thiết bị khi không sử dụng và ưu tiên đèn LED.\n"
                "• Vệ sinh điều hòa định kỳ để thiết bị hoạt động hiệu quả.\n"
                "• Kiểm tra vòi nước và bồn cầu nếu nghi có rò rỉ."
            )
        return "Chưa có lịch sử hóa đơn để trả lời câu hỏi về mức tiêu thụ của phòng."

    # Tách riêng dữ liệu điện và nước
    dien_data = [r for r in du_lieu if r.get("loai") == "Điện"]
    nuoc_data = [r for r in du_lieu if r.get("loai") == "Nước"]

    # ── Câu hỏi về tháng dùng nhiều nhất ─────────────────────────────────────
    if any(k in q for k in ["nhiều nhất", "nhiêu nhất", "cao nhất", "nhiều nhat", "cao nhat"]):
        lines = ["**Mức tiêu thụ cao nhất**"]
        if any(k in q for k in ["điện", "dien"]) or not any(k in q for k in ["nước", "nuoc"]):
            if dien_data:
                max_dien = max(dien_data, key=lambda r: r["tieu_thu"])
                lines.append(f"• Điện: {max_dien['tieu_thu']} kWh trong kỳ {_dinh_dang_ky_chat(max_dien['thang'])}.")
        if any(k in q for k in ["nước", "nuoc"]) or not any(k in q for k in ["điện", "dien"]):
            if nuoc_data:
                max_nuoc = max(nuoc_data, key=lambda r: r["tieu_thu"])
                lines.append(f"• Nước: {max_nuoc['tieu_thu']} m³ trong kỳ {_dinh_dang_ky_chat(max_nuoc['thang'])}.")
        if len(lines) == 1:
            lines.append("Chưa đủ dữ liệu để xác định kỳ tiêu thụ cao nhất.")
        return "\n".join(lines)

    # ── Câu hỏi về thanh toán ─────────────────────────────────────────────────
    if any(k in q for k in ["thanh toán", "thanh toan", "đã trả", "da tra", "chua tra", "chưa trả"]):
        lines = ["**Tình trạng thanh toán**"]
        thang_list = sorted(set(r["thang"] for r in du_lieu))
        for thang in thang_list:
            rec = next((r for r in du_lieu if r["thang"] == thang), None)
            if rec and rec.get("da_thanh_toan") is not None:
                trang_thai = "Đã thanh toán" if rec["da_thanh_toan"] else "Chưa thanh toán"
                tien = f" · {_dinh_dang_tien_chat(rec['tong_tien_hoa_don_thang'])}" if rec.get("tong_tien_hoa_don_thang") else ""
                lines.append(f"• Kỳ {_dinh_dang_ky_chat(thang)}: {trang_thai}{tien}.")
        return "\n".join(lines) if len(lines) > 1 else "Chưa có thông tin thanh toán cho các kỳ này."

    # ── Câu hỏi về hóa đơn / tổng tiền ──────────────────────────────────────
    if any(k in q for k in ["hóa đơn", "hoa don", "tiền", "tien", "bao nhiêu", "bao nhieu"]):
        lines = ["**Các hóa đơn gần đây**"]
        thang_list = sorted(set(r["thang"] for r in du_lieu))
        for thang in thang_list:
            rec = next((r for r in du_lieu if r["thang"] == thang), None)
            if rec and rec.get("tong_tien_hoa_don_thang") is not None:
                trang_thai = "đã thu" if rec.get("da_thanh_toan") else "chưa thu"
                lines.append(f"• Kỳ {_dinh_dang_ky_chat(thang)}: {_dinh_dang_tien_chat(rec['tong_tien_hoa_don_thang'])} · {trang_thai}.")
        return "\n".join(lines)

    # ── Câu hỏi về lịch sử / xu hướng ───────────────────────────────────────
    if any(k in q for k in ["lịch sử", "lich su", "xu hướng", "xu huong", "thống kê", "thong ke", "tóm tắt", "tom tat"]):
        lines = ["**Tóm tắt tiêu thụ**"]
        if dien_data:
            tong_dien = sum(r["tieu_thu"] for r in dien_data)
            tb_dien = tong_dien / len(dien_data)
            lines.append(f"• Điện: trung bình {tb_dien:.0f} kWh/tháng trong {len(dien_data)} kỳ.")
        if nuoc_data:
            tong_nuoc = sum(r["tieu_thu"] for r in nuoc_data)
            tb_nuoc = tong_nuoc / len(nuoc_data)
            lines.append(f"• Nước: trung bình {tb_nuoc:.1f} m³/tháng trong {len(nuoc_data)} kỳ.")
        return "\n".join(lines)

    # ── Câu hỏi tháng gần nhất / tháng này ──────────────────────────────────
    if any(k in q for k in ["tháng này", "thang nay", "gần nhất", "gan nhat", "mới nhất", "moi nhat", "vừa rồi"]):
        lines = ["**Kỳ gần nhất**"]
        thang_max = max(r["thang"] for r in du_lieu)
        recs = [r for r in du_lieu if r["thang"] == thang_max]
        lines.append(f"Kỳ {_dinh_dang_ky_chat(thang_max)}:")
        for r in recs:
            don_vi = "kWh" if r["loai"] == "Điện" else "m³"
            lines.append(f"• {r['loai']}: {r['tieu_thu']} {don_vi}.")
        if recs and recs[0].get("tong_tien_hoa_don_thang"):
            trang_thai = "đã thu" if recs[0].get("da_thanh_toan") else "chưa thu"
            lines.append(f"Tổng hóa đơn: {_dinh_dang_tien_chat(recs[0]['tong_tien_hoa_don_thang'])} · {trang_thai}.")
        return "\n".join(lines)

    # ── Câu hỏi kiến thức chung (mẹo tiết kiệm, thiết bị, ...) ──────────
    general_keywords = [
        "mẹo", "meo", "tiết kiệm", "tiet kiem", "cách", "cach", "làm sao", "lam sao",
        "thiết bị", "thiet bi", "nên", "nen", "gợi ý", "goi y", "khuyên", "khuyen",
        "tại sao", "tai sao", "vì sao", "vi sao", "giải thích", "giai thich",
        "công suất", "cong suat", "giá điện", "gia dien", "giá nước", "gia nuoc",
    ]
    if any(k in q for k in general_keywords):
        lines = ["**Một vài gợi ý**"]
        if any(k in q for k in ["tiết kiệm", "tiet kiem", "mẹo", "meo"]):
            lines.extend([
                "• Tắt thiết bị khi không sử dụng và ưu tiên đèn LED.",
                "• Vệ sinh điều hòa định kỳ; đặt nhiệt độ phù hợp với nhu cầu.",
                "• Kiểm tra vòi nước, bồn cầu để phát hiện rò rỉ sớm.",
            ])
        else:
            lines.extend([
                "• Kiểm tra công suất trên nhãn thiết bị và thời gian sử dụng để ước tính điện năng.",
                "• Bình nóng lạnh nên tắt khi không cần dùng.",
                "• Nếu chỉ số nước tăng bất thường, kiểm tra vòi và bồn cầu trước.",
            ])
        return "\n".join(lines)

    # ── Câu trả lời mặc định (không khớp câu hỏi nào) ───────────────────────
    thang_list = sorted(set(r["thang"] for r in du_lieu))
    lines = [
        f"Tôi có dữ liệu {len(thang_list)} kỳ, từ {_dinh_dang_ky_chat(thang_list[0])} đến {_dinh_dang_ky_chat(thang_list[-1])}.",
        "",
        "Bạn có thể hỏi, chẳng hạn:",
        "• Kỳ nào dùng điện hoặc nước nhiều nhất?",
        "• Hóa đơn nào còn chưa thanh toán?",
        "• Tóm tắt mức tiêu thụ gần đây.",
        "• Cho tôi vài mẹo tiết kiệm điện nước.",
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

        # Phân tích theo kỳ của hóa đơn, gom riêng điện/nước và chỉ gửi số liệu ẩn danh.
        return _tao_hoac_cap_nhat_phan_tich(db, hoa_don)

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

        hoa_don = db.query(HoaDon).filter(HoaDon.MaHoaDon == ma_hoa_don).first()
        results = db.query(PhanTichAI).filter(
            PhanTichAI.MaHoaDon == ma_hoa_don
        ).all()
        if not hoa_don:
            return results
        return [
            AIInsightResponse(
                MaDanhGia=result.MaDanhGia,
                MaHoaDon=result.MaHoaDon,
                NoiDungNhanXet=result.NoiDungNhanXet,
                MucDoCanhBao=result.MucDoCanhBao,
                DuLieuBieuDo=_du_lieu_bieu_do(db, hoa_don.MaHo, hoa_don.ThangNam),
            )
            for result in results
        ]
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
        # 3. Ghép prompt: dữ liệu truy vấn được (retrieval) + câu hỏi người dùng
        user_prompt = (
            f"Dữ liệu lịch sử tiêu thụ/hóa đơn của hộ (từ cũ đến mới, đã ẩn danh): "
            f"{du_lieu if du_lieu else 'Chưa có dữ liệu lịch sử.'}\n"
            f"Câu hỏi: {payload.cau_hoi}"
        )

        # 4. Hỏi AI tự do; Gemini có thể tra cứu Google Search cho thông tin mới.
        tra_loi, sources = _goi_ai_hoi_dap(
            QUERY_SYSTEM_PROMPT,
            user_prompt,
            fallback=lambda: _mock_query_response(du_lieu, payload.cau_hoi),
        )
        question = payload.cau_hoi.lower()
        asks_electric_price = any(term in question for term in ("giá", "gia", "bao nhiêu", "bao nhieu")) and any(
            term in question for term in ("điện", "dien", "kwh", "số điện", "so dien")
        )
        if asks_electric_price and not sources:
            sources = [{
                "title": "Biểu giá bán lẻ điện – EVN",
                "url": "https://evn.com.vn/d/vi-VN/news/Bieu-gia-ban-le-dien-theo-Quyet-dinh-so-1279QD-BCTngay-0952025-cua-Bo-Cong-Thuong-60-28-502668",
            }]

        return AIQueryResponse(
            cau_hoi=payload.cau_hoi,
            tra_loi=tra_loi,
            so_ky_du_lieu_dung=len(du_lieu),
            sources=sources,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI hỏi-đáp: {str(e)}")
