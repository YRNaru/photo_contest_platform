"""
Django settings for photo_contest_platform project.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from celery.schedules import crontab

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-dev-key-change-this")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # Third party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "django_filters",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.twitter_oauth2",
    # Local apps
    "contest",
    "accounts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASES = {
    "default": dj_database_url.config(
        default="mysql://contestuser:contestpass@localhost:3307/contest",
        conn_max_age=600,
    )
}

# MySQLで絵文字などの4バイトUTF-8文字を扱えるようにする
# PostgreSQLの場合は不要なのでエンジンをチェック
if "mysql" in DATABASES["default"]["ENGINE"]:
    DATABASES["default"]["OPTIONS"] = {
        "charset": "utf8mb4",
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:13000,http://127.0.0.1:13000").split(",")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Session & CSRF Cookie settings for development
if DEBUG:
    SESSION_COOKIE_SAMESITE = "Lax"  # Noneは開発環境（HTTP）では使えない
    SESSION_COOKIE_SECURE = False  # 開発環境ではFalse
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_DOMAIN = None

    CSRF_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SECURE = False
    CSRF_COOKIE_HTTPONLY = False
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:13000",
        "http://127.0.0.1:13000",
        "http://localhost:18000",
        "http://127.0.0.1:18000",
    ]

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",  # デフォルトは全員アクセス可能
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}

# Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.environ.get("JWT_ACCESS_TOKEN_LIFETIME", "60"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=int(os.environ.get("JWT_REFRESH_TOKEN_LIFETIME", "1440"))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# dj-rest-auth settings
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,
    "JWT_AUTH_COOKIE": "auth-token",
    "JWT_AUTH_REFRESH_COOKIE": "refresh-token",
}

# Email設定（開発環境）
if DEBUG:
    # 開発環境ではメールをコンソールに出力
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    # 本番環境ではSMTPを使用
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")

# django-allauth settings
SITE_ID = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "optional"

# ログイン/ログアウト後のリダイレクト先（フロントエンド）
LOGIN_REDIRECT_URL = "/accounts/profile/"  # ログイン後はprofileビューへ（そこからフロントエンドにリダイレクト）
LOGOUT_REDIRECT_URL = "http://localhost:13000/"  # ログアウト後はフロントエンドのホームへ

# ソーシャルアカウント設定
SOCIALACCOUNT_AUTO_SIGNUP = True  # ソーシャルログイン時に自動サインアップ
SOCIALACCOUNT_EMAIL_VERIFICATION = "optional"  # メール確認を任意に
SOCIALACCOUNT_QUERY_EMAIL = True  # メールアドレスを要求
SOCIALACCOUNT_ADAPTER = "accounts.adapter.CustomSocialAccountAdapter"  # カスタムアダプター
SOCIALACCOUNT_LOGIN_ON_GET = True  # GETリクエストで直接ログインプロセスを開始
SOCIALACCOUNT_EMAIL_REQUIRED = True  # メールアドレス必須

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# Social Auth Providers
# APPセクションは削除 - データベースのSocialAppを使用
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": [
            "profile",
            "email",
        ],
        "AUTH_PARAMS": {
            "access_type": "online",
        },
    },
    "twitter_oauth2": {
        # データベースのSocialAppから読み込む
    },
}

# Twitter API設定
TWITTER_API_KEY = os.environ.get("TWITTER_API_KEY", "")
TWITTER_API_SECRET = os.environ.get("TWITTER_API_SECRET", "")
TWITTER_ACCESS_TOKEN = os.environ.get("TWITTER_ACCESS_TOKEN", "")
TWITTER_ACCESS_TOKEN_SECRET = os.environ.get("TWITTER_ACCESS_TOKEN_SECRET", "")
TWITTER_BEARER_TOKEN = os.environ.get("TWITTER_BEARER_TOKEN", "")

# Celery Configuration
CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# Celery Beat Schedule（定期タスク）
CELERY_BEAT_SCHEDULE = {
    "fetch-twitter-entries": {
        "task": "contest.tasks.fetch_twitter_entries",
        "schedule": crontab(minute="*/15"),  # 15分ごとに実行
    },
}

# File upload settings
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE
FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE

# Custom user model
AUTH_USER_MODEL = "accounts.User"

# Sentry (optional)
if os.environ.get("SENTRY_DSN"):
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=True,
    )
