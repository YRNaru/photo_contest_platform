from django.test import TestCase, RequestFactory
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import Mock, patch
from .models import Contest, Entry, Flag
from .admin import ContestAdmin, FlagAdmin

User = get_user_model()


class ContestAdminActionsTest(TestCase):
    """ContestAdmin アクションのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = ContestAdmin(Contest, self.site)
        self.factory = RequestFactory()
        self.user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )

    def test_fetch_twitter_action_with_auto_fetch(self):
        """Twitter自動取得が有効なコンテストでアクション実行"""
        contest = Contest.objects.create(
            slug='twitter-contest',
            title='Twitter Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_auto_fetch=True,
            twitter_hashtag='test'
        )

        request = self.factory.get('/')
        request.user = self.user
        request._messages = Mock()

        queryset = Contest.objects.filter(id=contest.id)

        # TwitterFetcherをモック
        with patch('contest.twitter_integration.TwitterFetcher') as mock_fetcher_class:
            mock_fetcher = Mock()
            mock_fetcher.fetch_and_create_entries.return_value = 5
            mock_fetcher_class.return_value = mock_fetcher

            self.admin.fetch_twitter_now(request, queryset)

            # fetch_and_create_entriesが呼ばれたことを確認
            mock_fetcher.fetch_and_create_entries.assert_called_once_with(contest)

    def test_fetch_twitter_action_without_auto_fetch(self):
        """Twitter自動取得が無効なコンテストでアクション実行"""
        contest = Contest.objects.create(
            slug='normal-contest',
            title='Normal Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_auto_fetch=False
        )

        request = self.factory.get('/')
        request.user = self.user
        request._messages = Mock()

        queryset = Contest.objects.filter(id=contest.id)

        with patch('contest.twitter_integration.TwitterFetcher') as mock_fetcher_class:
            mock_fetcher = Mock()
            mock_fetcher.fetch_and_create_entries.return_value = 0
            mock_fetcher_class.return_value = mock_fetcher

            self.admin.fetch_twitter_now(request, queryset)

            # twitter_auto_fetchがFalseなので呼ばれない
            mock_fetcher.fetch_and_create_entries.assert_not_called()

    def test_fetch_twitter_action_without_hashtag(self):
        """ハッシュタグがないコンテストでアクション実行"""
        contest = Contest.objects.create(
            slug='no-hashtag-contest',
            title='No Hashtag Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_auto_fetch=True,
            twitter_hashtag=''
        )

        request = self.factory.get('/')
        request.user = self.user
        request._messages = Mock()

        queryset = Contest.objects.filter(id=contest.id)

        with patch('contest.twitter_integration.TwitterFetcher') as mock_fetcher_class:
            mock_fetcher = Mock()
            mock_fetcher_class.return_value = mock_fetcher

            self.admin.fetch_twitter_now(request, queryset)

            # ハッシュタグがないので呼ばれない
            mock_fetcher.fetch_and_create_entries.assert_not_called()


class FlagAdminActionsTest(TestCase):
    """FlagAdmin アクションのテスト"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = FlagAdmin(Flag, self.site)
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title='Test Entry',
            approved=True
        )

    def test_mark_resolved_action(self):
        """通報を解決済みにするアクション"""
        flag = Flag.objects.create(
            entry=self.entry,
            user=self.user,
            reason='Test reason',
            resolved=False
        )

        request = self.factory.get('/')
        request._messages = Mock()

        queryset = Flag.objects.filter(id=flag.id)

        self.admin.mark_resolved(request, queryset)

        flag.refresh_from_db()
        self.assertTrue(flag.resolved)
