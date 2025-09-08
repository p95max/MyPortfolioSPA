FROM python:3.12-slim

WORKDIR /app

COPY backend/pyproject.toml backend/poetry.lock* /app/
COPY backend/ /app/

RUN apt-get update && apt-get install -y build-essential curl gcc libpq-dev && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3 -

ENV PATH="/root/.local/bin:$PATH"

RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi --no-root

EXPOSE 8000

CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]