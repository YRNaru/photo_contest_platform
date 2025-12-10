from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import Contest, Entry
from .views import ContestViewSet, EntryViewSet

User = get_user_model()


class ViewSetPaginationTest(APITestCase):
    """ViewSetのページネーション境界テスト"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
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
        from unittest.mock import patch

        self.client.force_authenticate(user=self.user)

        # paginate_queryset が None を返すようにモック
        with patch.object(ContestViewSet, "paginate_queryset", return_value=None):
            response = self.client.get("/api/contests/my_contests/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            # ページネーションなしの場合、直接リストが返される
            self.assertIsInstance(response.data, list)

    def test_contest_entries_force_no_pagination(self):
        """ページネーションを無効化してコンテストエントリーを取得"""
        from unittest.mock import patch

        Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )

        with patch.object(ContestViewSet, "paginate_queryset", return_value=None):
            response = self.client.get(f"/api/contests/{self.contest.slug}/entries/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pending_entries_force_no_pagination(self):
        """ページネーションを無効化して承認待ちエントリーを取得"""
        from unittest.mock import patch

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
