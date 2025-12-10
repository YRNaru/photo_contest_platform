"""テスト用の設定"""
from .settings import *  # noqa: F403, F401

# テスト用にSQLiteを使用
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# テストを高速化
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# デバッグモード
DEBUG = True

# Celeryをイーガーモードで実行（テスト用）
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
