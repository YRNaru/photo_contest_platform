"""fetch_twitter管理コマンドのテスト"""

from django.test import TestCase
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, Mock
from io import StringIO
from contest.models import Contest

User = get_user_model()


class FetchTwitterCommandTest(TestCase):
    """fetch_twitterコマンドのテスト"""

    def setUp(self):
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="test",
            twitter_auto_fetch=True,
        )

    @patch("contest.twitter_integration.TwitterFetcher")
    def test_command_with_contest_slug(self, mock_fetcher_class):
        """特定のコンテストを指定してコマンド実行"""
        mock_fetcher = Mock()
        mock_fetcher.fetch_and_create_entries.return_value = 5
        mock_fetcher_class.return_value = mock_fetcher

        out = StringIO()
        call_command("fetch_twitter", "--contest=test-contest", stdout=out)

        # 成功メッセージが出力されることを確認
        self.assertIn("Successfully fetched", out.getvalue())
        self.assertIn("test-contest", out.getvalue())

    def test_command_with_nonexistent_contest(self):
        """存在しないコンテストを指定"""
        out = StringIO()
        call_command("fetch_twitter", "--contest=nonexistent", stdout=out)

        # エラーメッセージが出力されることを確認
        self.assertIn("not found", out.getvalue())

    @patch("contest.management.commands.fetch_twitter.fetch_all_active_contests")
    def test_command_without_contest_slug(self, mock_fetch_all):
        """コンテストを指定せずにコマンド実行"""
        mock_fetch_all.return_value = {"test-contest": 5, "another-contest": 3}

        out = StringIO()
        call_command("fetch_twitter", stdout=out)

        # 成功メッセージと詳細が出力されることを確認
        self.assertIn("Successfully fetched", out.getvalue())
        self.assertIn("8 entries", out.getvalue())
        self.assertIn("test-contest", out.getvalue())
