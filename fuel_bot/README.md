# Chemnitz Fuel Bot

Standalone public Telegram bot that retrieves current fuel prices from the
Tankerkönig API on demand. It is intentionally independent from the Django
backend and React frontend, but shares the repository's Docker network.

## MVP commands

- `/cheap [diesel|e5|e10] [radius]` — cheapest open stations around Chemnitz.
- `/nearby` — open the signed Telegram Mini App location picker and search nearby.
- `/settings [diesel|e5|e10] [radius]` — view or save personal defaults.
- `/delete_me` — delete saved personal defaults.
- `/about` — data source, license, and privacy information.

The response includes a small price analysis: minimum, median, spread, and the
possible saving for a 50-litre fill. Tankerkönig data is requested only after a
user action. Results are cached for five minutes and the upstream API is gated
globally to respect its rate limit.

## Configuration

```bash
cp fuel_bot/env.example fuel_bot/.env
```

Set `TELEGRAM_BOT_TOKEN`. `TANKERKOENIG_API_KEY` may stay empty while the
application is under manual review; commands that need live prices return a
neutral temporary-unavailability message. `LOCATION_WEB_APP_URL` must be an
HTTPS URL that serves `frontend/public/fuel-location/`.

Run only the bot and its cache:

```bash
docker compose up -d --build redis fuel_bot
```

Run tests locally:

```bash
cd fuel_bot
poetry install
poetry run pytest
```

## Data and API policy

Fuel data is supplied by [Tankerkönig](https://creativecommons.tankerkoenig.de/)
under CC BY 4.0 and originates from MTS-K. The service does not poll in the
background or build a price archive. Telegram user preferences are stored in
Redis; location searches are cached only temporarily and precise locations are
not added to application logs. The Mini App backend validates Telegram's signed
`initData`, rejects sessions older than ten minutes and prevents query replay
before sending the location back through `answerWebAppQuery`.
