import os
import smtplib
from email.message import EmailMessage
from typing import Optional


def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name)
    return value if value not in (None, "") else default


def send_email(*, to_email: str, subject: str, body_text: str) -> None:
    """Send an email via SMTP using environment variables.

    Required env:
      - SMTP_HOST
    Optional env:
      - SMTP_PORT (default 587)
      - SMTP_USER
      - SMTP_PASSWORD
      - SMTP_FROM (default SMTP_USER)
      - SMTP_TLS (default true)

    Notes:
      - If SMTP_USER is provided, the function will attempt LOGIN auth.
      - Raises on configuration/connection/auth/send failures.
    """

    smtp_host = _env("SMTP_HOST")
    if not smtp_host:
        raise RuntimeError("SMTP_HOST is not configured")

    smtp_port = int(_env("SMTP_PORT", "587"))
    smtp_user = _env("SMTP_USER")
    smtp_password = _env("SMTP_PASSWORD")
    smtp_from = _env("SMTP_FROM", smtp_user or "no-reply@example.com")

    smtp_timeout = int(_env("SMTP_TIMEOUT", "20"))

    smtp_ssl_raw = (_env("SMTP_SSL", "false") or "false").strip().lower()
    smtp_ssl = smtp_ssl_raw in ("1", "true", "yes")

    smtp_tls_raw = (_env("SMTP_TLS", "true") or "true").strip().lower()
    smtp_tls = smtp_tls_raw not in ("0", "false", "no")

    msg = EmailMessage()
    msg["From"] = smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body_text)

    smtp_cls = smtplib.SMTP_SSL if smtp_ssl else smtplib.SMTP

    with smtp_cls(smtp_host, smtp_port, timeout=smtp_timeout) as server:
        server.ehlo()
        # For implicit TLS (SMTP_SSL), starttls() is not used.
        if smtp_tls and not smtp_ssl:
            server.starttls()
            server.ehlo()

        if smtp_user:
            if smtp_password is None:
                raise RuntimeError("SMTP_USER is set but SMTP_PASSWORD is missing")
            server.login(smtp_user, smtp_password)

        server.send_message(msg)


def send_password_reset_email(*, to_email: str, reset_link: str) -> None:
    subject = "Reset your DisasterWatch password"
    body = (
        "You requested a password reset for your DisasterWatch account.\n\n"
        f"Reset link: {reset_link}\n\n"
        "If you did not request this, you can ignore this email.\n"
    )
    send_email(to_email=to_email, subject=subject, body_text=body)
