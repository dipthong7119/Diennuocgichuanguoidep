"""Gửi SMS nhắc các phòng còn hóa đơn chưa thanh toán từ ba tháng trở lên."""

import base64
import os
import re
import uuid
from datetime import date, datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from database import HoaDon, HoGiaDinh, LogNhacNo


def sms_configuration() -> dict:
    enabled = os.getenv("SMS_ENABLED", "false").strip().lower() == "true"
    sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    sender = os.getenv("TWILIO_FROM_NUMBER", "").strip()
    configured = bool(sid and token and sender)
    return {
        "enabled": enabled,
        "configured": configured,
        "ready": enabled and configured,
        "provider": "Twilio",
        "schedule": "Mỗi ngày lúc 09:00 (giờ Việt Nam)",
    }


def _e164_vietnam(phone: str) -> str | None:
    compact = re.sub(r"[\s().-]", "", phone)
    if compact.startswith("+"):
        digits = compact[1:]
        return compact if digits.isdigit() and 8 <= len(digits) <= 15 else None
    digits = re.sub(r"\D", "", compact)
    if digits.startswith("0"):
        digits = "84" + digits[1:]
    if not digits.startswith("84") or not 10 <= len(digits) <= 12:
        return None
    return "+" + digits


def _send_twilio_sms(phone: str, message: str) -> None:
    sid = os.environ["TWILIO_ACCOUNT_SID"].strip()
    token = os.environ["TWILIO_AUTH_TOKEN"].strip()
    sender = os.environ["TWILIO_FROM_NUMBER"].strip()
    endpoint = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    form = urlencode({"To": phone, "From": sender, "Body": message}).encode("utf-8")
    credentials = base64.b64encode(f"{sid}:{token}".encode("utf-8")).decode("ascii")
    request = Request(
        endpoint,
        data=form,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=15) as response:
            if response.status >= 300:
                raise RuntimeError(f"Twilio trả về HTTP {response.status}")
    except HTTPError as error:
        raise RuntimeError(f"Twilio từ chối tin nhắn (HTTP {error.code})") from None
    except URLError as error:
        raise RuntimeError("Không kết nối được dịch vụ SMS") from error


def _month_age(period: date, today: date) -> int:
    return (today.year - period.year) * 12 + today.month - period.month


def send_overdue_reminders(db: Session, today: date | None = None) -> dict:
    """Gửi tối đa một SMS cho mỗi phòng trong tháng, chỉ ghi nhận khi gửi thành công."""
    config = sms_configuration()
    if not config["ready"]:
        return {"sent": 0, "skipped": 0, "failed": 0, "ready": False}

    today = today or date.today()
    reminder_period = today.strftime("%Y-%m")
    rows = (
        db.query(HoaDon, HoGiaDinh)
        .join(HoGiaDinh, HoaDon.MaHo == HoGiaDinh.MaHo)
        .filter(HoaDon.TrangThaiThanhToan.is_(False))
        .order_by(HoaDon.ThangNam.asc())
        .all()
    )
    overdue_by_household: dict[str, tuple[HoGiaDinh, list[HoaDon]]] = {}
    for invoice, household in rows:
        if _month_age(invoice.ThangNam, today) < 3:
            continue
        if household.MaHo not in overdue_by_household:
            overdue_by_household[household.MaHo] = (household, [])
        overdue_by_household[household.MaHo][1].append(invoice)

    result = {"sent": 0, "skipped": 0, "failed": 0, "ready": True}
    for household, invoices in overdue_by_household.values():
        already_sent = db.query(LogNhacNo.MaLog).filter(
            LogNhacNo.MaHo == household.MaHo,
            LogNhacNo.KyNhac == reminder_period,
        ).first()
        if already_sent:
            result["skipped"] += 1
            continue

        recipient = _e164_vietnam(household.SoDienThoai or "")
        if not recipient:
            result["skipped"] += 1
            continue

        total = round(sum(invoice.TongTien for invoice in invoices))
        periods = ", ".join(invoice.ThangNam.strftime("%m/%Y") for invoice in invoices)
        message = (
            f"[Điện Nước] Phòng {household.MaPhong} còn {len(invoices)} hóa đơn "
            f"chưa thanh toán từ 3 tháng trở lên ({periods}), tổng {total:,} đ. "
            "Vui lòng kiểm tra và liên hệ quản lý nếu cần hỗ trợ."
        )

        try:
            _send_twilio_sms(recipient, message)
            db.add(LogNhacNo(
                MaLog=f"SMS-{uuid.uuid4().hex[:12].upper()}",
                MaHo=household.MaHo,
                KyNhac=reminder_period,
                MaHoaDonCuNhat=invoices[0].MaHoaDon,
                ThoiDiemGui=datetime.utcnow(),
            ))
            db.commit()
            result["sent"] += 1
        except Exception:
            db.rollback()
            result["failed"] += 1

    return result
