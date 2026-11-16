FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN pip install --no-cache-dir poetry==2.5.1

COPY pyproject.toml README.md ./
RUN poetry install --only main --no-root

COPY app ./app

FROM base AS test

RUN poetry install --with dev --no-root
COPY tests ./tests
RUN python -m pytest

FROM base AS runtime

RUN useradd --create-home --uid 10001 botuser \
    && chown -R botuser:botuser /app

USER botuser

CMD ["python", "-m", "app.main"]
