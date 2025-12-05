from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContestViewSet, EntryViewSet

router = DefaultRouter()
router.register(r'contests', ContestViewSet, basename='contest')
router.register(r'entries', EntryViewSet, basename='entry')

urlpatterns = [
    path('', include(router.urls)),
]

