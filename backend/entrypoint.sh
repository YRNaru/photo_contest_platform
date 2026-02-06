#!/bin/bash

# 静的ファイル収集（必須、先に実行）
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Warning: Static file collection failed."

# Celery WorkerとBeatをバックグラウンドで起動（無料プラン用）
if [ "${ENABLE_CELERY}" = "true" ]; then
    echo "Starting Celery Worker..."
    celery -A config worker -l info --concurrency=2 &
    
    echo "Starting Celery Beat..."
    celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler &
fi

# Gunicornを先に起動（ポートを開く）
echo "Starting gunicorn..."
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --timeout 120 --graceful-timeout 120 &
GUNICORN_PID=$!

# バックグラウンドで初期化処理を実行
{
    # データベース接続を待つ（最大60秒）
    echo "Waiting for database connection..."
    python wait_for_db.py 2>/dev/null || echo "Warning: Database connection check failed. Continuing..."

    # マイグレーション実行
    echo "Running migrations..."
    python manage.py migrate --noinput || echo "Warning: Migration failed."

    # スーパーユーザー作成
    echo "Creating superuser from environment variables..."
    python manage.py create_superuser_from_env || echo "Info: Superuser creation skipped."

    # OAuth設定
    echo "Setting up OAuth from environment variables..."
    python manage.py setup_oauth_from_env || echo "Info: OAuth setup skipped."
} &

# Gunicornプロセスを待つ（メインプロセス）
wait $GUNICORN_PID

