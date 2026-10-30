"""Gửi SMS nhắc các phòng còn hóa đơn chưa thanh toán từ ba tháng trở lên."""

import base64
import json
import os
import re
import uuid
from datetime import date, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import HoaDon, HoGiaDinh, LogNhacNo

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class SmsProviderError(RuntimeError):
    """Lỗi gửi SMS được rút gọn để không làm lộ thông tin tài khoản."""


def sms_configuration() -> dict:
    enabled = os.getenv("SMS_ENABLED", "false").strip().lower() == "true"
    trial_mode = os.getenv("TWILIO_TRIAL_MODE", "false").strip().lower() == "true"
    bulk_enabled = os.getenv("TWILIO_BULK_REMINDERS_ENABLED", "false").strip().lower() == "true"
    sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    api_key_sid = os.getenv("TWILIO_API_KEY_SID", "").strip()
    api_key_secret = os.getenv("TWILIO_API_KEY_SECRET", "").strip()
    sender = os.getenv("TWILIO_FROM_NUMBER", "").strip()
    valid_account_sid = bool(re.fullmatch(r"AC[0-9a-fA-F]{32}", sid))
    valid_api_key_sid = bool(re.fullmatch(r"SK[0-9a-fA-F]{32}", api_key_sid))
    has_auth = bool(token) or bool(valid_api_key_sid and api_key_secret)
    valid_sender = _is_valid_sender(sender)
    configured = bool(valid_account_sid and has_auth and valid_sender)
    issues = []
    if not enabled:
        issues.append("Đặt SMS_ENABLED=true trong backend/.env.")
    if not valid_account_sid:
        issues.append("TWILIO_ACCOUNT_SID phải là Account SID Twilio hợp lệ (bắt đầu bằng AC).")
    if not has_auth:
        issues.append("Điền Auth Token hoặc đủ cặp TWILIO_API_KEY_SID và TWILIO_API_KEY_SECRET.")
    if not valid_sender:
        issues.append(
            "Điền TWILIO_FROM_NUMBER bằng số E.164 hoặc Sender ID chữ-số đã đăng ký (3-11 ký tự)."
        )
    return {
        "enabled": enabled,
        "configured": configured,
        "ready": enabled and configured,
        "bulk_enabled": bulk_enabled,
        "bulk_ready": enabled and configured and not trial_mode and bulk_enabled,
        "trial_mode": trial_mode,
        "sender": sender,
        "issues": issues,
        "provider": "Twilio",
        "schedule": "Mỗi ngày lúc 09:00 (giờ Việt Nam)",
    }


def _e164_vietnam(phone: str) -> str | None:
    compact = re.sub(r"[\s().-]", "", phone)
    if compact.startswith("+"):
        digits = compact[1:]
        if digits.startswith("840"):
            digits = "84" + digits[3:]
        if not digits.isdigit():
            return None
        if digits.startswith("84"):
            return "+" + digits if 10 <= len(digits) <= 12 else None
        return compact if 8 <= len(digits) <= 15 else None
    digits = re.sub(r"\D", "", compact)
    if digits.startswith("0"):
        digits = "84" + digits[1:]
    if not digits.startswith("84") or not 10 <= len(digits) <= 12:
        return None
    return "+" + digits


def _is_valid_sender(sender: str) -> bool:
    valid_phone = bool(re.fullmatch(r"\+[1-9][0-9]{7,14}", sender))
    valid_alpha = bool(
        3 <= len(sender) <= 11
        and re.fullmatch(r"[A-Za-z0-9 ]+", sender)
        and re.search(r"[A-Za-z]", sender)
    )
    return valid_phone or valid_alpha


def _send_twilio_sms(phone: str, message: str) -> str | None:
    sid = os.environ["TWILIO_ACCOUNT_SID"].strip()
    sender = os.environ["TWILIO_FROM_NUMBER"].strip()
    api_key_sid = os.getenv("TWILIO_API_KEY_SID", "").strip()
    api_key_secret = os.getenv("TWILIO_API_KEY_SECRET", "").strip()
    token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    endpoint = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    form = urlencode({"To": phone, "From": sender, "Body": message}).encode("utf-8")
    # Prefer the Account SID/Auth Token pair when supplied. This lets an operator
    # override a stale API Key pair by adding a valid Auth Token to .env.
    if token:
        username, password = sid, token
    else:
        username, password = api_key_sid, api_key_secret
    credentials = base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("ascii")
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
                raise SmsProviderError(f"Twilio trả về HTTP {response.status}.")
            try:
                payload = json.loads(response.read().decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                return None
            return payload.get("sid")
    except HTTPError as error:
        try:
            payload = json.loads(error.read().decode("utf-8"))
            twilio_code = payload.get("code")
        except (UnicodeDecodeError, json.JSONDecodeError):
            twilio_code = None
        if twilio_code is not None:
            twilio_message = payload.get("message")
            if twilio_code == 572002:
                raise SmsProviderError(
                    "Twilio chưa gán được số gửi Trial cho số nhận này. "
                    "Hãy xác minh số nhận trong Twilio Try out SMS rồi thử lại."
                ) from None
            if twilio_code == 572006:
                raise SmsProviderError(
                    "Tài khoản Trial chỉ chấp nhận tên template SMS có sẵn của Twilio."
                ) from None
            raise SmsProviderError(
                f"Twilio trả HTTP {error.code}, mã lỗi {twilio_code}"
                + (f": {twilio_message}" if isinstance(twilio_message, str) and twilio_message else ".")
            ) from None
        raise SmsProviderError(
            f"HTTP {error.code}; phản hồi không phải JSON của Twilio (có thể do mạng hoặc proxy)."
        ) from None
    except URLError as error:
        raise SmsProviderError("Không kết nối được dịch vụ SMS.") from error


def send_single_sms(phone: str) -> dict:
    """Gửi một SMS tới đúng một số; Trial chỉ dùng mẫu Appointment Reminders."""
    config = sms_configuration()
    if not config["ready"]:
        reason = " ".join(config["issues"]) or "Cấu hình SMS chưa đầy đủ."
        raise SmsProviderError(reason)

    recipient = _e164_vietnam(phone)
    if not recipient:
        raise ValueError("Số nhận không hợp lệ; hãy nhập số Việt Nam hoặc số quốc tế đúng định dạng.")

    if config["trial_mode"]:
        # Trial requires its predefined template and the Twilio trial sender
        # shown for this verified recipient in the Console.
        message_sid = _send_twilio_sms(
            recipient,
            "sms_appointment_reminders",
        )
    else:
        message_sid = _send_twilio_sms(
            recipient,
            "[Điện Nước] Đây là tin nhắn từ hệ thống quản lý hóa đơn điện nước. Vui lòng kiểm tra thông tin hóa đơn của bạn.",
        )

    return {
        "sent": True,
        "recipient": recipient,
        "trial_mode": config["trial_mode"],
        "message_sid": message_sid,
    }


def _month_age(period: date, today: date) -> int:
    return (today.year - period.year) * 12 + today.month - period.month


def send_overdue_reminders(db: Session, today: date | None = None) -> dict:
    """Gửi tối đa một SMS cho mỗi phòng trong tháng, chỉ ghi nhận khi gửi thành công."""
    config = sms_configuration()
    if not config["bulk_ready"]:
        if config["trial_mode"] and config["ready"]:
            reason = (
                "Tài khoản Twilio Trial chưa hỗ trợ gửi nhắc nợ tự động; "
                "hãy nâng cấp tài khoản để gửi tin nhắn tùy chỉnh."
            )
        elif config["ready"] and not config["bulk_enabled"]:
            reason = "Gửi nhắc nợ tự động đang tắt trong backend/.env."
        else:
            reason = "Cấu hình SMS chưa đầy đủ."
        return {
            "sent": 0,
            "skipped": 0,
            "failed": 0,
            "ready": False,
            "errors": [{"reason": reason, "count": 0}],
        }

    today = today or datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).date()
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
    error_counts: dict[str, int] = {}
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
            f"[Điện Nước] Kính chào phòng {household.MaPhong}. "
            f"Bạn còn {len(invoices)} hóa đơn điện nước chưa thanh toán ({periods}), "
            f"tổng cộng {total:,} đồng. Vui lòng thanh toán hoặc liên hệ ban quản lý. Xin cảm ơn."
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
        except SmsProviderError as error:
            db.rollback()
            result["failed"] += 1
            reason = str(error)
            error_counts[reason] = error_counts.get(reason, 0) + 1
        except Exception:
            db.rollback()
            result["failed"] += 1
            reason = "Lỗi nội bộ khi gửi hoặc ghi nhận SMS."
            error_counts[reason] = error_counts.get(reason, 0) + 1

    result["errors"] = [
        {"reason": reason, "count": count}
        for reason, count in error_counts.items()
    ]
    return result
