#!/bin/sh
set -e

echo "Applying migrations..."
poetry run python manage.py migrate --noinput

echo "Creating superuser if not exists..."
poetry run python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
u = os.environ.get('DJANGO_SUPERUSER_USERNAME')
e = os.environ.get('DJANGO_SUPERUSER_EMAIL')
p = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if u and not User.objects.filter(username=u).exists():
    User.objects.create_superuser(u, e, p)
    print(f'Superuser {u} created')
else:
    print('Superuser exists or env not provided')
"

echo "Starting Gunicorn..."
exec poetry run gunicorn portfolio_backend.wsgi --bind 0.0.0.0:${PORT:-8000} --log-file -