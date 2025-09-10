# db
python manage.py dumpdata portfolio_backend > backup_db.json

# docker
docker compose up --build
docker compose down

# front
npm run build
npm run dev