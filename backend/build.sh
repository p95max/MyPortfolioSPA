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

echo "Build completed!"