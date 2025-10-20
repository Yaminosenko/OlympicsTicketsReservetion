#!/bin/bash
set -e  # Arrête au premier erreur

cd backend

echo "=== Checking migrations ==="
python manage.py showmigrations

echo "=== Applying migrations ==="
python manage.py migrate --noinput

echo "=== Migration result ==="
python manage.py showmigrations --list

echo "=== Starting server ==="
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT