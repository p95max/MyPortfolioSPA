"""Telegram command and location handlers."""

from __future__ import annotations

import logging
from typing import cast

from telegram import KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove, Update
from telegram.constants import ParseMode
from telegram.ext import ContextTypes

from .cache import Cache
from .config import Config, FUEL_TYPES
from .formatting import FUEL_LABELS, format_price_report
from .models import UserPreferences
from .tankerkoenig import TankerkoenigClient, TankerkoenigError, UpstreamRateLimited


LOGGER = logging.getLogger(__name__)

WELCOME = (
    "⛽ <b>Chemnitz Fuel Bot</b>\n\n"
    "Показываю актуальные цены на топливо по запросу и считаю возможную экономию.\n\n"
    "/cheap — дешёвые АЗС в Хемнице\n"
    "/nearby — поиск рядом с геолокацией\n"
    "/settings — топливо и радиус\n"
    "/about — источник данных и приватность\n"
    "/delete_me — удалить сохранённые настройки"
)


def _dependencies(context: ContextTypes.DEFAULT_TYPE) -> tuple[Config, Cache, TankerkoenigClient | None]:
    config = cast(Config, context.application.bot_data["config"])
    cache = cast(Cache, context.application.bot_data["cache"])
    client = cast(
        TankerkoenigClient | None, context.application.bot_data.get("tankerkoenig")
    )
    return config, cache, client


async def _preferences(user_id: int, config: Config, cache: Cache) -> UserPreferences:
    raw = await cache.get_json(f"fuel:user:{user_id}:preferences")
    if isinstance(raw, dict):
        fuel_type = raw.get("fuel_type")
        radius = raw.get("radius_km")
        if fuel_type in FUEL_TYPES and isinstance(radius, int) and 1 <= radius <= 25:
            return UserPreferences(fuel_type=fuel_type, radius_km=radius)
    return UserPreferences(
        fuel_type=config.default_fuel_type, radius_km=config.default_radius_km
    )


async def _allowed(user_id: int, config: Config, cache: Cache) -> bool:
    count = await cache.increment(
        f"fuel:user:{user_id}:rate", config.user_rate_window_seconds
    )
    return count <= config.user_rate_limit


def parse_fuel_and_radius(
    args: list[str], preferences: UserPreferences
) -> UserPreferences:
    fuel_type = preferences.fuel_type
    radius = preferences.radius_km
    for arg in args:
        normalized = arg.lower().strip()
        if normalized in FUEL_TYPES:
            fuel_type = normalized
            continue
        try:
            candidate = int(normalized)
        except ValueError as exc:
            raise ValueError("Использование: /cheap diesel 8") from exc
        if not 1 <= candidate <= 25:
            raise ValueError("Радиус должен быть от 1 до 25 км.")
        radius = candidate
    return UserPreferences(fuel_type=fuel_type, radius_km=radius)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_message:
        await update.effective_message.reply_text(WELCOME, parse_mode=ParseMode.HTML)


async def about(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message:
        return
    text = (
        "ℹ️ <b>О боте</b>\n\n"
        "Цены запрашиваются только по действию пользователя и кэшируются на 5 минут. "
        "Бот не создаёт архив цен. Настройки хранятся по Telegram ID; точная "
        "геолокация не записывается в журналы.\n\n"
        "Источник: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K. "
        "Лицензия данных: CC BY 4.0. Данные предоставляются без гарантии точности и доступности."
    )
    await update.effective_message.reply_text(
        text, parse_mode=ParseMode.HTML, disable_web_page_preview=True
    )


async def settings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message or not update.effective_user:
        return
    config, cache, _ = _dependencies(context)
    current = await _preferences(update.effective_user.id, config, cache)
    if context.args:
        try:
            current = parse_fuel_and_radius(context.args, current)
        except ValueError as exc:
            await update.effective_message.reply_text(str(exc))
            return
        await cache.set_json(
            f"fuel:user:{update.effective_user.id}:preferences",
            {"fuel_type": current.fuel_type, "radius_km": current.radius_km},
        )
        prefix = "✅ Настройки сохранены.\n"
    else:
        prefix = "⚙️ Текущие настройки:\n"
    await update.effective_message.reply_text(
        f"{prefix}Топливо: {FUEL_LABELS[current.fuel_type]}\n"
        f"Радиус: {current.radius_km} км\n\n"
        "Изменить: /settings diesel 8"
    )


async def delete_me(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message or not update.effective_user:
        return
    _, cache, _ = _dependencies(context)
    await cache.delete(f"fuel:user:{update.effective_user.id}:preferences")
    await update.effective_message.reply_text(
        "✅ Сохранённые настройки удалены. История местоположений не ведётся."
    )


async def _send_prices(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    *,
    lat: float,
    lng: float,
    title: str,
    preferences: UserPreferences,
) -> None:
    if not update.effective_message or not update.effective_user:
        return
    config, cache, client = _dependencies(context)
    if not await _allowed(update.effective_user.id, config, cache):
        await update.effective_message.reply_text(
            "Слишком много запросов. Попробуйте снова через минуту."
        )
        return
    if client is None:
        await update.effective_message.reply_text(
            "⏳ Источник цен ещё не активирован: API-ключ Tankerkönig ожидает проверки. "
            "Бот уже готов и заработает после добавления ключа администратором."
        )
        return
    try:
        stations = await client.search(
            lat=lat,
            lng=lng,
            radius_km=preferences.radius_km,
            fuel_type=preferences.fuel_type,
        )
    except UpstreamRateLimited:
        await update.effective_message.reply_text(
            "Источник допускает только один новый запрос в минуту. "
            "Повторите через минуту — кэшированные запросы доступны сразу."
        )
        return
    except TankerkoenigError:
        await update.effective_message.reply_text(
            "Не удалось получить цены от Tankerkönig. Попробуйте позже."
        )
        return
    await update.effective_message.reply_text(
        format_price_report(
            stations,
            fuel_type=preferences.fuel_type,
            radius_km=preferences.radius_km,
            title=title,
        ),
        parse_mode=ParseMode.HTML,
        disable_web_page_preview=True,
        reply_markup=ReplyKeyboardRemove(),
    )


async def cheap(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_user or not update.effective_message:
        return
    config, cache, _ = _dependencies(context)
    preferences = await _preferences(update.effective_user.id, config, cache)
    try:
        preferences = parse_fuel_and_radius(context.args, preferences)
    except ValueError as exc:
        await update.effective_message.reply_text(str(exc))
        return
    await _send_prices(
        update,
        context,
        lat=config.chemnitz_lat,
        lng=config.chemnitz_lng,
        title="Chemnitz",
        preferences=preferences,
    )


async def nearby(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message:
        return
    keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("📍 Отправить геолокацию", request_location=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await update.effective_message.reply_text(
        "Отправьте геолокацию кнопкой ниже. Она нужна только для текущего поиска.",
        reply_markup=keyboard,
    )


async def location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if (
        not update.effective_user
        or not update.effective_message
        or not update.effective_message.location
    ):
        return
    config, cache, _ = _dependencies(context)
    preferences = await _preferences(update.effective_user.id, config, cache)
    point = update.effective_message.location
    await _send_prices(
        update,
        context,
        lat=point.latitude,
        lng=point.longitude,
        title="рядом с вами",
        preferences=preferences,
    )


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    LOGGER.exception("Unhandled Telegram update error", exc_info=context.error)
