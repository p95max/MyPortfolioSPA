FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock* /app/

RUN pip install --upgrade pip && pip install "poetry==1.7.1"

RUN poetry install --no-interaction --no-ansi

COPY . /app/

EXPOSE 8000

CMD ["poetry", "run", "gunicorn", "portfolio_backend.wsgi", "--bind", "0.0.0.0:8000", "--log-file", "-"]