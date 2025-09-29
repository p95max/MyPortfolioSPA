#!/usr/bin/env bash
set -o errexit

echo ">>> Installing/Updating Poetry..."
pip install --upgrade pip
pip install "poetry==1.7.1"

poetry config virtualenvs.create false
poetry install --no-interaction --no-ansi

echo ">>> Running migrations..."
poetry run python manage.py migrate --noinput

echo ">>> Collecting static files..."
poetry run python manage.py collectstatic --no-input

echo ">>> Build completed!"