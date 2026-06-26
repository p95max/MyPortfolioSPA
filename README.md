# Portfolio SPA Project

Single Page Application portfolio with **React (Vite)** frontend and **Django REST** backend, containerized via **Docker Compose** and deployed by **render.com**.

---

## Features

- Projects and skills **content management** via the Django Admin Panel.
- Full CRUD support for portfolio projects, including **inline screenshot management**.
- **Fast PDF Preview:** instant in-browser PDF previews powered by PDF.js.  
  The first page is rendered directly on the frontend without opening external tabs, ensuring fast load times and a smooth user experience for CVs, documents, and reports.
- **Interactive Helper Widget:** a lightweight, browser-only helper widget that provides quick guidance, preconfigured answers, and basic navigation support.  
  It works without any backend or external APIs, but can be extended with AI capabilities if required.
- **Contact form** with:
  - **CAPTCHA** validation (server-side token verification)
  - **Anti-spam safeguards** (rate limits per IP/email, minimal payload checks, optional honeypot)
  - **Email notifications** sent to a configurable list of recipients
- The **mobile version** of the website is fully optimized for smaller screens and touch interaction.

## Architecture

- **Backend:** Django REST API
- **Frontend:** React + Vite, served by Nginx
- **Database:** PostgreSQL 17
- **Orchestration:** Docker Compose

---

## Live Demo

You can test the full workflow — frontend UI, API, contact form with CAPTCHA and email notifications - on the production instance:

🔗 https://myportfoliospa-1.onrender.com/

---

## Getting Started

```bash
git clone https://github.com/p95max/MyPortfolioSPA.git
cd MyPortfolioSPA
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## Environment Variables

### Backend (`backend/.env`)

```
#Django
DEBUG=True
SECRET_KEY=django-

#DB
DB_NAME=dbname
DB_USER=user
DB_PASSWORD=pass
DB_HOST=localhost
DB_PORT=5432

# superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@admin.com
DJANGO_SUPERUSER_PASSWORD=adminpass

# django admin
DJANGO_ADMIN_URL=admin

# local dev db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=S3cur3P@ss
POSTGRES_DB=mydb

# email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

NOTIFY_EMAIL=your_email@gmail.com

TURNSTILE_SECRET=your-capcha-secret-key
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE=http://localhost:8000
VITE_CAPTCHA_SITE_KEY=your-site-key
```

## Django Admin

- Superuser is **auto-created on startup** if it does not exist (via environment variables).
- Custom admin URL is supported via `DJANGO_ADMIN_URL`.
- Admin URL is **not hardcoded** and can be changed safely through `.env`.
- **Jazzmin Admin Theme** is enabled to provide a modernized Django Admin UI with improved navigation and usability.
- The admin panel provides **full CRUD management** for portfolio projects.
- Projects can be **created, edited, reordered, and removed** directly from the admin interface.
- Each project supports **inline management of screenshots**, including:
  - Adding new screenshots
  - Editing captions and image paths
  - Removing screenshots
- Projects support **manual ordering** via the `sort_order`(by Drag&drop) field (editable directly in the admin list view).

### Screenshots Storage Note

- Project screenshots are currently stored in the **frontend public directory**:
`frontend/public/screenshots`
- The backend stores **relative paths** (e.g. `/screenshots/project1.png`) and uses the frontend domain to display previews in the admin panel.
- This approach is intentional for simplicity in a portfolio setup.
- **Planned improvement**: move screenshots to a dedicated media storage solution (e.g. S3 / Cloudinary / MinIO) to decouple backend administration from frontend static assets and improve scalability.

---

## Email Notifications for New Contact Messages

The backend automatically sends an email notification whenever a new contact message is submitted successfully.

### How It Works

- Incoming messages pass CAPTCHA verification and multiple anti-spam throttles.
- The contact message is saved to the database.
- An email notification is sent to all recipients defined in `NOTIFY_EMAILS`.
- The email includes:
  - Sender name
  - Sender email
  - Message text
  - Human-readable timestamp (configurable timezone)
- The email contains a **direct reference to the Django Admin**, where the message can be reviewed.

### Configuration

Add the following variables to `backend/.env`:

```
NOTIFY_EMAILS=owner@example.com,backup@example.com
EMAIL_SUBJECT_PREFIX=[Portfolio]
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=bot@example.com
EMAIL_HOST_PASSWORD=app-password
EMAIL_USE_TLS=1
ADMIN_PANEL=https://myportfoliospa.onrender.com/deus_ex_adm/api/contactmessage/
```

### Email Example

```
📩 New Contact Message

Name: John Doe
Email: john@example.com

Message:
Hello, I would like to get in touch...

See details in Admin:
https://myportfoliospa.onrender.com/deus_ex_adm/api/contactmessage/123/
```

This ensures you never miss incoming messages from your portfolio website.

---

###  Backend validation

- CAPTCHA verify using `CAPTCHA_SECRET`
- Throttles
- Honeypot check
- Persists ContactMessage
- Sends notification email

---

## Testing

```bash
curl -X POST http://localhost:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"a@a.com","message":"hi","cf_turnstile_token":"x"}'
```

---

## Security Notes

- Server-side CAPTCHA validation
- Throttling
- Escape user input

---

## Development

- Backend: `/backend`
- Frontend: `/frontend`

---

## License

MIT

---

## Contacts

Author: Maksym Petrykin  
Email: [m.petrykin@gmx.de](mailto:m.petrykin@gmx.de)  
Telegram: [@max_p95](https://t.me/max_p95)

---