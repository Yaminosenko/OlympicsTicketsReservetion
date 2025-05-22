web: gunicorn config.wsgi --log-file - --timeout 120
release: python manage.py migrate && python manage.py collectstatic --noinput

# Frontend React
# web: npm start --prefix frontend