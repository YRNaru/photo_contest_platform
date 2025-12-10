"""
URL configuration for photo_contest_platform project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/google/", include("allauth.socialaccount.providers.google.urls")),
    path("api/", include("contest.urls")),
    path("api/", include("accounts.urls")),
    # カスタムプロフィールページ
    path("accounts/", include("accounts.urls")),
    # Social account URLs (for OAuth flows)
    path("accounts/", include("allauth.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
