from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, twitter_login

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/twitter/login/', twitter_login, name='twitter_login'),
]

