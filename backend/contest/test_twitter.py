"""Twitter連携機能の包括的テスト"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import Mock, patch
from .models import Contest  # Entry unused
from .twitter_integration import TwitterFetcher, fetch_all_active_contests

User = get_user_model()


class TwitterFetcherInitTest(TestCase):
    """TwitterFetcherの初期化テスト"""

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetcher_init_with_token(self, mock_client):
        """トークンがある場合の初期化"""
        fetcher = TwitterFetcher()
        self.assertIsNotNone(fetcher)
        mock_client.assert_called_once()

    @override_settings(TWITTER_BEARER_TOKEN=None)
    def test_fetcher_init_without_token(self):
        """トークンがない場合の初期化"""
        fetcher = TwitterFetcher()
        self.assertIsNone(fetcher.client)


class TwitterFetchTweetsTest(TestCase):
    """ツイート取得機能のテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com")
        self.contest = Contest.objects.create(
            slug="twitter-contest",
            title="Twitter Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="testhashtag",
            twitter_auto_fetch=True,
        )

    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_no_client(self, mock_client):
        """クライアントがない場合"""
        fetcher = TwitterFetcher()
        fetcher.client = None

        result = fetcher.fetch_tweets_by_hashtag("test")

        self.assertEqual(result, [])

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_success(self, mock_client_class):
        """ツイート取得成功"""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "123", "text": "Test tweet", "author_id": "456"}]
        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        fetcher.fetch_tweets_by_hashtag("test")

        # search_recent_tweetsが呼ばれたことを確認
        mock_client.search_recent_tweets.assert_called_once()

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_api_error(self, mock_client_class):
        """API エラーの場合"""
        mock_client = Mock()
        mock_client.search_recent_tweets.side_effect = Exception("API Error")
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        result = fetcher.fetch_tweets_by_hashtag("test")

        self.assertEqual(result, [])


class FetchAllActiveContestsTest(TestCase):
    """fetch_all_active_contests関数のテスト"""

    def setUp(self):
        self.contest = Contest.objects.create(
            slug="active-contest",
            title="Active Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="test",
            twitter_auto_fetch=True,
        )

    @patch("contest.twitter_integration.TwitterFetcher")
    def test_fetch_all_active_contests(self, mock_fetcher_class):
        """全アクティブコンテストからの取得"""
        mock_fetcher = Mock()
        mock_fetcher.fetch_and_create_entries.return_value = 5
        mock_fetcher_class.return_value = mock_fetcher

        fetch_all_active_contests()

        # TwitterFetcherが作成されたことを確認
        mock_fetcher_class.assert_called_once()

    def test_fetch_all_no_active_contests(self):
        """アクティブなコンテストがない場合"""
        # すべてのコンテストを無効化
        Contest.objects.all().update(twitter_auto_fetch=False)

        result = fetch_all_active_contests()

        # 空の結果が返る
        self.assertIsInstance(result, dict)
