#!/bin/bash

echo "Waiting for database connection..."
if python wait_for_db.py; then
    echo "Database connection established."
else
    echo "Warning: Database connection failed. The application may not work correctly."
fi

echo "Running migrations..."
if python manage.py migrate --noinput; then
    echo "Migrations completed successfully."
else
    echo "Warning: Migration failed. This may be normal if migrations were already applied."
fi

echo "Collecting static files..."
if python manage.py collectstatic --noinput; then
    echo "Static files collected successfully."
else
    echo "Warning: Static file collection failed. Continuing anyway..."
fi

echo "Creating superuser from environment variables..."
if python manage.py create_superuser_from_env; then
    echo "Superuser creation completed."
else
    echo "Info: Superuser creation skipped (may already exist or env vars not set)."
fi

echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --timeout 120 --graceful-timeout 120

