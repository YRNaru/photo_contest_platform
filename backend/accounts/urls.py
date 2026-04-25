from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    extension_auth_complete,
    extension_login,
    get_session_token,
    profile,
    twitter_login,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/twitter/login/", twitter_login, name="twitter_login"),
    path("auth/session-token/", get_session_token, name="get_session_token"),
    path("extension/login/<str:provider>/", extension_login, name="extension_login"),
    path("extension/auth-complete/", extension_auth_complete, name="extension_auth_complete"),
    path("profile/", profile, name="profile"),
]
