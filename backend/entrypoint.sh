#!/bin/bash

# 静的ファイル収集（必須、先に実行）
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Warning: Static file collection failed."

# データベース接続を待つ（最大60秒）
echo "Waiting for database connection..."
python wait_for_db.py 2>/dev/null || echo "Warning: Database connection check failed. Continuing..."

# マイグレーション実行（Celery Beatの前に必須）
echo "Running migrations..."
python manage.py migrate --noinput || echo "Warning: Migration failed."

# スーパーユーザー作成
echo "Creating superuser from environment variables..."
python manage.py create_superuser_from_env || echo "Info: Superuser creation skipped."

# OAuth設定
echo "Setting up OAuth from environment variables..."
python manage.py setup_oauth_from_env || echo "Info: OAuth setup skipped."

# Celery WorkerとBeatをバックグラウンドで起動（マイグレーション後に起動）
if [ "${ENABLE_CELERY}" = "true" ]; then
    echo "Starting Celery Worker..."
    C_FORCE_ROOT=1 celery -A config worker -l info --concurrency=2 &
    
    echo "Starting Celery Beat..."
    C_FORCE_ROOT=1 celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler &
fi

# Gunicornを起動（メインプロセス）
echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --timeout 120 --graceful-timeout 120

