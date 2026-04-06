from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Contest, Entry, EntryView, JudgeScore
from .views import ContestViewSet, EntryViewSet, EntryViewViewSet, JudgeScoreViewSet

User = get_user_model()


class ViewSetPaginationTest(APITestCase):
    """ViewSetのページネーション境界テスト"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

    def test_my_contests_with_pagination(self):
        """my_contestsのページネーション有り"""
        self.client.force_authenticate(user=self.user)

        # 複数のコンテストを作成
        for i in range(5):
            Contest.objects.create(
                slug=f"contest-{i}",
                title=f"Contest {i}",
                creator=self.user,
                start_at=timezone.now(),
                end_at=timezone.now() + timedelta(days=30),
            )

        response = self.client.get("/api/contests/my_contests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_contest_entries_with_pagination(self):
        """コンテストエントリーのページネーション有り"""
        # 複数のエントリーを作成
        for i in range(5):
            Entry.objects.create(
                contest=self.contest,
                author=self.user,
                title=f"Entry {i}",
                approved=True,
            )

        response = self.client.get(f"/api/contests/{self.contest.slug}/entries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pending_entries_with_pagination(self):
        """承認待ちエントリーのページネーション有り"""
        moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.client.force_authenticate(user=moderator)

        # 複数の未承認エントリーを作成
        for i in range(5):
            Entry.objects.create(
                contest=self.contest,
                author=self.user,
                title=f"Pending Entry {i}",
                approved=False,
            )

        response = self.client.get("/api/entries/pending/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_my_contests_force_no_pagination(self):
        """ページネーションを無効化してmy_contestsを取得"""
        self.client.force_authenticate(user=self.user)

        # paginate_queryset が None を返すようにモック
        with patch.object(ContestViewSet, "paginate_queryset", return_value=None):
            response = self.client.get("/api/contests/my_contests/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            # ページネーションなしの場合、直接リストが返される
            self.assertIsInstance(response.data, list)

    def test_contest_entries_force_no_pagination(self):
        """ページネーションを無効化してコンテストエントリーを取得"""
        Entry.objects.create(contest=self.contest, author=self.user, title="Entry 1", approved=True)

        with patch.object(ContestViewSet, "paginate_queryset", return_value=None):
            response = self.client.get(f"/api/contests/{self.contest.slug}/entries/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pending_entries_force_no_pagination(self):
        """ページネーションを無効化して承認待ちエントリーを取得"""
        moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.client.force_authenticate(user=moderator)

        Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Pending Entry",
            approved=False,
        )

        with patch.object(EntryViewSet, "paginate_queryset", return_value=None):
            response = self.client.get("/api/entries/pending/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            # ページネーションなしの場合、直接リストが返される
            self.assertIsInstance(response.data, list)


class ContestViewSetTest(TestCase):
    """ContestViewSetの詳細テスト"""

    def test_get_serializer_class_create(self):
        """createアクションのシリアライザークラス"""
        from .serializers import ContestCreateSerializer

        viewset = ContestViewSet()
        viewset.action = "create"

        self.assertEqual(viewset.get_serializer_class(), ContestCreateSerializer)

    def test_get_serializer_class_update(self):
        """updateアクションのシリアライザークラス"""
        from .serializers import ContestCreateSerializer

        viewset = ContestViewSet()
        viewset.action = "update"

        self.assertEqual(viewset.get_serializer_class(), ContestCreateSerializer)

    def test_get_serializer_class_retrieve(self):
        """retrieveアクションのシリアライザークラス"""
        from .serializers import ContestDetailSerializer

        viewset = ContestViewSet()
        viewset.action = "retrieve"

        self.assertEqual(viewset.get_serializer_class(), ContestDetailSerializer)

    def test_get_serializer_class_list(self):
        """listアクションのシリアライザークラス"""
        from .serializers import ContestListSerializer

        viewset = ContestViewSet()
        viewset.action = "list"

        self.assertEqual(viewset.get_serializer_class(), ContestListSerializer)


class EntryViewSetTest(TestCase):
    """EntryViewSetの詳細テスト"""

    def test_get_serializer_class_create(self):
        """createアクションのシリアライザークラス"""
        from .serializers import EntryCreateSerializer

        viewset = EntryViewSet()
        viewset.action = "create"

        self.assertEqual(viewset.get_serializer_class(), EntryCreateSerializer)

    def test_get_serializer_class_retrieve(self):
        """retrieveアクションのシリアライザークラス"""
        from .serializers import EntryDetailSerializer

        viewset = EntryViewSet()
        viewset.action = "retrieve"

        self.assertEqual(viewset.get_serializer_class(), EntryDetailSerializer)

    def test_get_serializer_class_list(self):
        """listアクションのシリアライザークラス"""
        from .serializers import EntryListSerializer

        viewset = EntryViewSet()
        viewset.action = "list"

        self.assertEqual(viewset.get_serializer_class(), EntryListSerializer)


class EntryViewViewSetAPITests(APITestCase):
    """EntryViewViewSet（審査員の閲覧記録）API"""

    def setUp(self):
        self.judge = User.objects.create_user(
            username="judge1",
            email="judge1@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.author = User.objects.create_user(username="author1", email="a1@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="evs-contest",
            title="EVS",
            creator=self.author,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.author,
            title="Work",
            approved=True,
        )
        self.client.force_authenticate(user=self.judge)

    def test_my_views_empty_list(self):
        response = self.client.get("/api/entry-views/my_views/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch.object(EntryViewViewSet, "paginate_queryset", return_value=None)
    def test_my_views_without_pagination_returns_list(self, _mock):
        response = self.client.get("/api/entry-views/my_views/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_viewed_entry_ids_empty(self):
        response = self.client.get("/api/entry-views/viewed_entry_ids/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["viewed_entry_ids"], [])

    def test_create_entry_view_record(self):
        response = self.client.post("/api/entry-views/", {"entry": str(self.entry.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(EntryView.objects.filter(entry=self.entry, judge=self.judge).exists())

    def test_list_shows_only_own_views(self):
        other = User.objects.create_user(username="j2", email="j2@example.com", password="x", is_judge=True)
        EntryView.objects.create(entry=self.entry, judge=other)
        EntryView.objects.create(entry=self.entry, judge=self.judge)
        response = self.client.get("/api/entry-views/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [row["entry"] for row in response.data["results"]] if "results" in response.data else [row["entry"] for row in response.data]
        self.assertEqual(len(ids), 1)


class JudgeScoreMyScoresAPITests(APITestCase):
    """JudgeScoreViewSet.my_scores の非ページネーション経路"""

    def setUp(self):
        self.judge = User.objects.create_user(
            username="js_judge",
            email="js_judge@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.author = User.objects.create_user(username="js_author", email="js_a@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="js-contest",
            title="JS",
            creator=self.author,
            judging_type="score",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.author,
            title="Scored",
            approved=True,
        )
        JudgeScore.objects.create(entry=self.entry, judge=self.judge, category=None, total_score="8.5")
        self.client.force_authenticate(user=self.judge)

    @patch.object(JudgeScoreViewSet, "paginate_queryset", return_value=None)
    def test_my_scores_without_pagination(self, _mock):
        response = self.client.get("/api/judge-scores/my_scores/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)
