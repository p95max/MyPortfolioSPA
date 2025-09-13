set -o errexit

if ! command -v poetry &> /dev/null
then
  echo "Poetry not found. Installing..."
  python -m pip install --upgrade pip
  python -m pip install "poetry==1.7.1"
fi

echo "Installing dependencies with Poetry..."
poetry install --no-interaction --no-ansi

echo "Collecting static files..."
poetry run python manage.py collectstatic --no-input

echo "Applying migrations..."
poetry run python manage.py migrate

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

echo "Build completed!"