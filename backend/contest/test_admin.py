from django.test import TestCase
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Contest, Entry, EntryImage, Vote, JudgeScore, Flag
from .admin import (
    ContestAdmin,
    EntryAdmin,
    EntryImageAdmin,
    VoteAdmin,
    JudgeScoreAdmin,
    FlagAdmin,
)

User = get_user_model()


class MockRequest:
    """Adminビューのテスト用モックリクエスト"""

    pass


class ContestAdminTest(TestCase):
    """コンテストAdminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = ContestAdmin(Contest, self.site)
        self.user = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="admin123"
        )
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        expected = (
            "title",
            "slug",
            "judging_type",
            "start_at",
            "end_at",
            "is_public",
            "twitter_auto_fetch",
            "created_at",
        )
        self.assertEqual(self.admin.list_display, expected)

    def test_list_filter(self):
        """フィルターの確認"""
        self.assertIn("is_public", self.admin.list_filter)
        self.assertIn("twitter_auto_fetch", self.admin.list_filter)

    def test_search_fields(self):
        """検索フィールドの確認"""
        self.assertIn("title", self.admin.search_fields)
        self.assertIn("slug", self.admin.search_fields)

    def test_fetch_twitter_action_exists(self):
        """Twitter取得アクションが存在"""
        self.assertIn("fetch_twitter_now", self.admin.actions)


class EntryAdminTest(TestCase):
    """エントリーAdminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = EntryAdmin(Entry, self.site)
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="test123"
        )
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest, author=self.user, title="Test Entry", approved=False
        )

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        self.assertIn("title", self.admin.list_display)
        self.assertIn("contest", self.admin.list_display)
        self.assertIn("get_author_display", self.admin.list_display)
        self.assertIn("approved", self.admin.list_display)

    def test_list_filter(self):
        """フィルターの確認"""
        self.assertIn("approved", self.admin.list_filter)
        self.assertIn("contest", self.admin.list_filter)

    def test_approve_entries_action(self):
        """エントリー承認アクション"""
        request = MockRequest()
        queryset = Entry.objects.filter(id=self.entry.id)

        self.admin.approve_entries(request, queryset)

        self.entry.refresh_from_db()
        self.assertTrue(self.entry.approved)

    def test_reject_entries_action(self):
        """エントリー非承認アクション"""
        self.entry.approved = True
        self.entry.save()

        request = MockRequest()
        queryset = Entry.objects.filter(id=self.entry.id)

        self.admin.reject_entries(request, queryset)

        self.entry.refresh_from_db()
        self.assertFalse(self.entry.approved)

    def test_vote_count_display(self):
        """投票数の表示メソッド"""
        from .models import Vote

        user2 = User.objects.create_user(username="voter", email="voter@example.com")

        # 投票を追加
        Vote.objects.create(entry=self.entry, user=user2)

        # list_displayを確認
        self.assertIn("vote_count", self.admin.list_display)

        # vote_countメソッドが存在すればテスト
        if hasattr(self.admin, "vote_count"):
            count = self.admin.vote_count(self.entry)
            self.assertEqual(count, 1)


class EntryImageAdminTest(TestCase):
    """エントリー画像Adminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = EntryImageAdmin(EntryImage, self.site)

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        self.assertIn("entry", self.admin.list_display)
        self.assertIn("order", self.admin.list_display)


class VoteAdminTest(TestCase):
    """投票Adminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = VoteAdmin(Vote, self.site)

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        self.assertIn("entry", self.admin.list_display)
        self.assertIn("user", self.admin.list_display)
        self.assertIn("created_at", self.admin.list_display)


class JudgeScoreAdminTest(TestCase):
    """審査員スコアAdminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = JudgeScoreAdmin(JudgeScore, self.site)

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        self.assertIn("entry", self.admin.list_display)
        self.assertIn("judge", self.admin.list_display)
        self.assertIn("total_score", self.admin.list_display)


class FlagAdminTest(TestCase):
    """通報Adminのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = FlagAdmin(Flag, self.site)

    def test_list_display(self):
        """リスト表示のフィールド確認"""
        self.assertIn("entry", self.admin.list_display)
        self.assertIn("user", self.admin.list_display)
        self.assertIn("resolved", self.admin.list_display)

    def test_list_filter(self):
        """フィルターの確認"""
        self.assertIn("resolved", self.admin.list_filter)
