## Local commands

```bash
cd backend
poetry run python manage.py makemigrations api
poetry run python manage.py migrate
poetry run python manage.py loaddata api/fixtures/backup_db.json
Docker commands
docker compose up -d --build
docker compose down

docker compose exec web poetry run python manage.py migrate
docker compose exec web poetry run python manage.py loaddata api/fixtures/backup_db.json
```

# Reset local database
```bash
docker compose down -v
docker compose up -d --build
```

# Frontend
```bash
cd frontend
npm ci
npm run build
npm run dev
```
# Deploy flow
```bash
git checkout prod
git pull origin prod
git merge dev
git push origin prod
```