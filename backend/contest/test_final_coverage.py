"""
最終カバレッジを99%にするためのテスト
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Contest, Entry, Category
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class ContestEntriesOrderingTest(APITestCase):
    """entriesアクションのorderingテスト"""

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

    def test_entries_with_invalid_ordering(self):
        """無効なorderingパラメータ"""
        Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )

        response = self.client.get(
            f"/api/contests/{self.contest.slug}/entries/", {"ordering": "invalid_field"}
        )

        # デフォルトのorderingが適用される
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_entries_with_vote_count_ordering(self):
        """vote_countでのordering"""
        Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )

        response = self.client.get(
            f"/api/contests/{self.contest.slug}/entries/", {"ordering": "-vote_count"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_entries_with_created_at_ordering(self):
        """created_atでのordering"""
        Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )

        response = self.client.get(
            f"/api/contests/{self.contest.slug}/entries/", {"ordering": "created_at"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ContestMyContestsTest(APITestCase):
    """my_contestsアクションのテスト"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_my_contests_many(self):
        """my_contests - 多数のコンテスト（ページネーション）"""
        # 20個のコンテストを作成
        for i in range(20):
            Contest.objects.create(
                slug=f"my-contest-{i}",
                title=f"My Contest {i}",
                creator=self.user,
                start_at=timezone.now(),
                end_at=timezone.now() + timedelta(days=30),
            )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/contests/my_contests/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_my_contests_few(self):
        """my_contests - 少数のコンテスト"""
        Contest.objects.create(
            slug="my-contest",
            title="My Contest",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/contests/my_contests/?no_page=true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ModelStrMethodsTest(TestCase):
    """モデルの__str__メソッドの網羅的テスト"""

    def setUp(self):
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

    def test_category_str_method(self):
        """Category.__str__のテスト"""
        category = Category.objects.create(contest=self.contest, name="風景賞")

        str_repr = str(category)
        self.assertIn("Test Contest", str_repr)
        self.assertIn("風景賞", str_repr)

    def test_entry_str_all_branches(self):
        """Entry.__str__の全ての分岐をテスト"""
        # authorあり
        entry1 = Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )
        self.assertIn("testuser", str(entry1))

        # twitter_usernameのみ
        entry2 = Entry.objects.create(
            contest=self.contest,
            twitter_username="twitteruser",
            title="Entry 2",
            approved=True,
        )
        self.assertIn("@twitteruser", str(entry2))
        self.assertIn("(Twitter)", str(entry2))

        # どちらもなし
        entry3 = Entry.objects.create(
            contest=self.contest, title="Entry 3", approved=True
        )
        self.assertIn("(投稿者不明)", str(entry3))


class AdminGetAuthorDisplayTest(TestCase):
    """EntryAdminのget_author_display分岐テスト"""

    def setUp(self):
        from django.contrib import admin
        from contest.admin import EntryAdmin

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

        site = admin.AdminSite()
        self.admin = EntryAdmin(Entry, site)

    def test_get_author_display_with_author(self):
        """get_author_display - authorあり"""
        entry = Entry.objects.create(
            contest=self.contest, author=self.user, title="Entry 1", approved=True
        )

        display = self.admin.get_author_display(entry)
        self.assertEqual(display, "testuser")

    def test_get_author_display_with_twitter(self):
        """get_author_display - twitter_usernameあり"""
        entry = Entry.objects.create(
            contest=self.contest,
            twitter_username="twitteruser",
            title="Entry 2",
            approved=True,
        )

        display = self.admin.get_author_display(entry)
        self.assertEqual(display, "@twitteruser (Twitter)")

    def test_get_author_display_without_both(self):
        """get_author_display - どちらもなし"""
        entry = Entry.objects.create(
            contest=self.contest, title="Entry 3", approved=True
        )

        display = self.admin.get_author_display(entry)
        self.assertEqual(display, "(投稿者不明)")
