#!/bin/bash

# マイグレーション実行（失敗しても続行）
echo "Running migrations..."
python manage.py migrate --noinput || echo "Warning: Migration failed. Continuing anyway..."

# 静的ファイル収集（失敗しても続行）
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Warning: Static file collection failed. Continuing anyway..."

# スーパーユーザー作成（失敗しても続行）
echo "Creating superuser from environment variables..."
python manage.py create_superuser_from_env || echo "Info: Superuser creation skipped (may already exist or env vars not set)."

# Gunicornを起動（これがメインプロセス）
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --timeout 120 --graceful-timeout 120

