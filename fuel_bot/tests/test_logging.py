import logging

from app.main import SecretRedactingFilter


def test_secret_redacting_filter_removes_token() -> None:
    token = "123456:secret-token"
    record = logging.LogRecord(
        name="httpx",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="POST https://api.telegram.org/bot%s/getMe",
        args=(token,),
        exc_info=None,
    )

    assert SecretRedactingFilter(token).filter(record)
    assert token not in record.getMessage()
    assert "[REDACTED]" in record.getMessage()
