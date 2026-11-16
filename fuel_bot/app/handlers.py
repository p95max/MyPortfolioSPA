"""Telegram command and location handlers."""

from __future__ import annotations

import logging
from typing import cast

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.constants import ParseMode
from telegram.ext import ContextTypes

from .cache import Cache
from .config import Config, FUEL_TYPES
from .formatting import FUEL_LABELS, format_price_report
from .models import UserPreferences
from .tankerkoenig import TankerkoenigClient, TankerkoenigError, UpstreamRateLimited


LOGGER = logging.getLogger(__name__)
SETTINGS_RADIUS_OPTIONS = (1, 3, 5, 10, 15, 25)

WELCOME = (
    "⛽ <b>Chemnitz Fuel Bot</b>\n\n"
    "I show current fuel prices on demand and calculate potential savings.\n\n"
    "/cheap — cheapest stations in Chemnitz\n"
    "/nearby — search near your location\n"
    "/settings — fuel type and radius\n"
    "/about — data source and privacy\n"
    "/delete_me — delete saved settings"
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
            raise ValueError("Usage: /cheap diesel 8") from exc
        if not 1 <= candidate <= 25:
            raise ValueError("Radius must be between 1 and 25 km.")
        radius = candidate
    return UserPreferences(fuel_type=fuel_type, radius_km=radius)


def settings_keyboard(
    preferences: UserPreferences, user_id: int
) -> InlineKeyboardMarkup:
    fuel_buttons = [
        InlineKeyboardButton(
            f"{'✅ ' if preferences.fuel_type == fuel_type else ''}{FUEL_LABELS[fuel_type]}",
            callback_data=f"settings:{user_id}:fuel:{fuel_type}",
        )
        for fuel_type in FUEL_TYPES
    ]
    radius_buttons = [
        InlineKeyboardButton(
            f"{'✅ ' if preferences.radius_km == radius else ''}{radius} km",
            callback_data=f"settings:{user_id}:radius:{radius}",
        )
        for radius in SETTINGS_RADIUS_OPTIONS
    ]
    return InlineKeyboardMarkup(
        [fuel_buttons, radius_buttons[:3], radius_buttons[3:]]
    )


def settings_text(preferences: UserPreferences, *, saved: bool = False) -> str:
    heading = "✅ Settings updated:" if saved else "⚙️ Current settings:"
    return (
        f"{heading}\n"
        f"Fuel: {FUEL_LABELS[preferences.fuel_type]}\n"
        f"Radius: {preferences.radius_km} km\n\n"
        "Choose fuel type and search radius:"
    )


async def _save_preferences(
    user_id: int, preferences: UserPreferences, cache: Cache
) -> None:
    await cache.set_json(
        f"fuel:user:{user_id}:preferences",
        {
            "fuel_type": preferences.fuel_type,
            "radius_km": preferences.radius_km,
        },
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message or not update.effective_user:
        return
    config, cache, _ = _dependencies(context)
    current = await _preferences(update.effective_user.id, config, cache)
    await update.effective_message.reply_text(
        f"{WELCOME}\n\n{settings_text(current)}",
        parse_mode=ParseMode.HTML,
        reply_markup=settings_keyboard(current, update.effective_user.id),
    )


async def about(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message:
        return
    text = (
        "ℹ️ <b>About this bot</b>\n\n"
        "Prices are requested only after a user action and cached for 5 minutes. "
        "The bot does not build a price archive. Settings are stored by Telegram ID; "
        "precise locations are not written to application logs.\n\n"
        "Source: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K. "
        "Data license: CC BY 4.0. Accuracy and availability are not guaranteed."
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
        await _save_preferences(update.effective_user.id, current, cache)
    await update.effective_message.reply_text(
        settings_text(current, saved=bool(context.args)),
        reply_markup=settings_keyboard(current, update.effective_user.id),
    )


async def settings_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    if not query or not query.data or not update.effective_user:
        return

    parts = query.data.split(":")
    if len(parts) != 4 or parts[0] != "settings":
        await query.answer("Invalid settings action.", show_alert=True)
        return

    try:
        menu_user_id = int(parts[1])
    except ValueError:
        await query.answer("Invalid settings action.", show_alert=True)
        return
    if menu_user_id != update.effective_user.id:
        await query.answer("Open your own /settings menu.", show_alert=True)
        return

    config, cache, _ = _dependencies(context)
    current = await _preferences(update.effective_user.id, config, cache)
    setting, value = parts[2], parts[3]
    if setting == "fuel" and value in FUEL_TYPES:
        updated = UserPreferences(fuel_type=value, radius_km=current.radius_km)
    elif setting == "radius":
        try:
            radius = int(value)
        except ValueError:
            radius = 0
        if radius not in SETTINGS_RADIUS_OPTIONS:
            await query.answer("Invalid radius.", show_alert=True)
            return
        updated = UserPreferences(fuel_type=current.fuel_type, radius_km=radius)
    else:
        await query.answer("Invalid settings action.", show_alert=True)
        return

    if updated == current:
        await query.answer("Already selected.")
        return

    await _save_preferences(update.effective_user.id, updated, cache)
    await query.answer("Saved")
    await query.edit_message_text(
        settings_text(updated, saved=True),
        reply_markup=settings_keyboard(updated, update.effective_user.id),
    )


async def delete_me(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.effective_message or not update.effective_user:
        return
    _, cache, _ = _dependencies(context)
    await cache.delete(f"fuel:user:{update.effective_user.id}:preferences")
    await update.effective_message.reply_text(
        "✅ Saved settings deleted. Location history is not stored."
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
            "Too many requests. Please try again later."
        )
        return
    if client is None:
        await update.effective_message.reply_text(
            "⏳ The price source is not active yet: the Tankerkönig API key is "
            "still awaiting approval. The bot will work after the administrator adds it."
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
            "The data source allows only one new request per minute. "
            "Please retry in a minute; cached searches remain available immediately."
        )
        return
    except TankerkoenigError:
        await update.effective_message.reply_text(
            "Could not retrieve prices from Tankerkönig. Please try again later."
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
        [[KeyboardButton("📍 Share location", request_location=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await update.effective_message.reply_text(
        "Share your location using the button below. It is used only for this search.",
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
        title="Near you",
        preferences=preferences,
    )


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    LOGGER.exception("Unhandled Telegram update error", exc_info=context.error)
