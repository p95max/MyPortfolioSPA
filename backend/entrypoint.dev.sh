#!/bin/sh
set -e

echo "Waiting for database..."
poetry run python - <<'PY'
import os
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.db import connections

for attempt in range(1, 31):
    try:
        connections["default"].ensure_connection()
        print("Database is ready")
        break
    except Exception as exc:
        print(f"Database is not ready yet ({attempt}/30): {exc}")
        time.sleep(1)
else:
    raise SystemExit("Database is not ready")
PY

echo "Applying migrations..."
poetry run python manage.py migrate --noinput

echo "Creating superuser if needed..."
poetry run python manage.py shell -c "
from django.contrib.auth import get_user_model
import os

User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email or '', password=password)
    print(f'Superuser {username} created')
else:
    print('Superuser exists or env not provided')
"

echo "Loading fixtures if needed..."
poetry run python manage.py shell -c "
from django.core.management import call_command
from api.models import Project
import os

load_fixtures = os.environ.get('LOAD_FIXTURES', '').lower() in {'1', 'true', 'yes'}

if not load_fixtures:
    print('Fixture loading disabled')
elif Project.objects.exists():
    print('Fixtures skipped: projects already exist')
else:
    call_command('loaddata', 'api/fixtures/backup_db.json')
    print('Fixtures loaded')
"

echo "Starting Django development server..."
exec poetry run python manage.py runserver 0.0.0.0:${PORT:-8000}