"""Fuel bot process entry point."""

from __future__ import annotations

import logging

from .bot import build_application
from .config import Config


class SecretRedactingFilter(logging.Filter):
    """Remove configured secrets from every emitted log record."""

    def __init__(self, *secrets: str | None) -> None:
        super().__init__()
        self._secrets = tuple(secret for secret in secrets if secret)

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        redacted = message
        for secret in self._secrets:
            redacted = redacted.replace(secret, "[REDACTED]")
        if redacted != message:
            record.msg = redacted
            record.args = ()
        return True


def configure_logging(config: Config) -> None:
    logging.basicConfig(
        level=getattr(logging, config.log_level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    redacting_filter = SecretRedactingFilter(
        config.telegram_bot_token, config.tankerkoenig_api_key
    )
    for handler in logging.getLogger().handlers:
        handler.addFilter(redacting_filter)

    # httpx logs complete Telegram request URLs, which contain the bot token.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def main() -> None:
    config = Config.from_env()
    configure_logging(config)
    application = build_application(config)
    application.run_polling(allowed_updates=["message"], drop_pending_updates=True)


if __name__ == "__main__":
    main()
