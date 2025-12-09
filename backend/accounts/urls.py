from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, twitter_login, profile, get_session_token

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/twitter/login/', twitter_login, name='twitter_login'),
    path('auth/session-token/', get_session_token, name='get_session_token'),
    path('profile/', profile, name='profile'),
]
