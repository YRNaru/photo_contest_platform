from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ContestViewSet,
    EntryViewSet,
    JudgeScoreViewSet,
    JudgingCriteriaViewSet,
    VoteViewSet,
)

router = DefaultRouter()
router.register(r"contests", ContestViewSet, basename="contest")
router.register(r"entries", EntryViewSet, basename="entry")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"judging-criteria", JudgingCriteriaViewSet, basename="judgingcriteria")
router.register(r"votes", VoteViewSet, basename="vote")
router.register(r"judge-scores", JudgeScoreViewSet, basename="judgescore")

urlpatterns = [
    path("", include(router.urls)),
]
