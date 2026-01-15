"""
URL configuration for photo_contest_platform project.
"""

import os
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.db import connection
from django.http import HttpRequest, JsonResponse
from django.urls import include, path


def api_root(_request: HttpRequest) -> JsonResponse:
    """API root endpoint"""
    return JsonResponse({
        "message": "Photo Contest Platform API",
        "status": "running",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "auth": "/api/auth/",
            "health": "/health/",
        }
    })


def health_check(_request: HttpRequest) -> JsonResponse:
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        connection.ensure_connection()
        return JsonResponse({
            "status": "healthy",
            "database": "connected"
        })
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }, status=503)


urlpatterns = [
    path("", api_root, name="api-root"),
    path("health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path(
        "api/auth/registration/",
        include("dj_rest_auth.registration.urls"),
    ),
    path(
        "api/auth/google/",
        include("allauth.socialaccount.providers.google.urls"),
    ),
    path("api/", include("contest.urls")),
    path("api/", include("accounts.urls")),
    # カスタムプロフィールページ
    path("accounts/", include("accounts.urls")),
    # Social account URLs (for OAuth flows)
    path("accounts/", include("allauth.urls")),
]

# Serve media files
# 本番環境でもメディアファイルを提供（S3を使用していない場合）
use_s3 = os.environ.get("USE_S3", "False") == "True"
if not use_s3:
    # ローカルストレージの場合、本番環境でもメディアファイルを提供
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL, document_root=settings.STATIC_ROOT
    )
