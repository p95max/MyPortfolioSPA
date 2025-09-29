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

COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

COPY . /app/

RUN poetry run python manage.py collectstatic --no-input

EXPOSE 8000

CMD ["/app/entrypoint.sh"]