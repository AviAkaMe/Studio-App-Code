# Studio Lessons Booking App

## Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL

## Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env to set DATABASE_URL and JWT_SECRET_KEY
flask db upgrade
python seed.py
flask run

## Signup Roles
When creating an account in the frontend signup form, you can check the
"Register as admin" box to create an admin (trainer) account. Leaving it
unchecked will create a normal student account.

## Running with Docker

You can run the entire application (frontend, backend and database) using
`docker-compose`.

```bash
docker-compose up --build
```

The backend will be available on <http://localhost:5000> and the React
frontend on <http://localhost:5173>.