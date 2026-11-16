"""Telegram application assembly and lifecycle."""

from __future__ import annotations

import logging

from telegram import BotCommand
from telegram.ext import Application, CommandHandler, MessageHandler, filters

from .cache import Cache, RedisCache
from .config import Config
from .handlers import (
    about,
    cheap,
    delete_me,
    error_handler,
    location,
    nearby,
    settings,
    start,
)
from .tankerkoenig import TankerkoenigClient


LOGGER = logging.getLogger(__name__)


async def _post_init(application: Application) -> None:
    await application.bot.set_my_commands(
        [
            BotCommand("cheap", "Cheapest stations in Chemnitz"),
            BotCommand("nearby", "Stations near your location"),
            BotCommand("settings", "Fuel type and search radius"),
            BotCommand("about", "Data source and privacy"),
            BotCommand("delete_me", "Delete saved settings"),
            BotCommand("help", "Show help"),
        ]
    )


async def _post_shutdown(application: Application) -> None:
    client: TankerkoenigClient | None = application.bot_data.get("tankerkoenig")
    cache: Cache = application.bot_data["cache"]
    if client is not None:
        await client.close()
    await cache.close()


def build_application(config: Config, cache: Cache | None = None) -> Application:
    cache = cache or RedisCache(config.redis_url)
    application = (
        Application.builder()
        .token(config.telegram_bot_token)
        .post_init(_post_init)
        .post_shutdown(_post_shutdown)
        .concurrent_updates(False)
        .build()
    )
    application.bot_data["config"] = config
    application.bot_data["cache"] = cache
    application.bot_data["tankerkoenig"] = (
        TankerkoenigClient(
            api_key=config.tankerkoenig_api_key,
            api_url=config.api_url,
            cache=cache,
            cache_ttl=config.cache_ttl_seconds,
            upstream_interval=config.upstream_interval_seconds,
        )
        if config.tankerkoenig_api_key
        else None
    )

    application.add_handler(CommandHandler(["start", "help"], start))
    application.add_handler(CommandHandler("about", about))
    application.add_handler(CommandHandler("settings", settings))
    application.add_handler(CommandHandler("delete_me", delete_me))
    application.add_handler(CommandHandler("cheap", cheap))
    application.add_handler(CommandHandler("nearby", nearby))
    application.add_handler(MessageHandler(filters.LOCATION, location))
    application.add_error_handler(error_handler)
    return application
