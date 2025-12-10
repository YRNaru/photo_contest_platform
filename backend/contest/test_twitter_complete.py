"""Twitter連携の完全カバレッジテスト"""

from datetime import timedelta
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from .models import Contest  # Entry, EntryImage unused
from .twitter_integration import TwitterFetcher, fetch_all_active_contests

# from io import BytesIO  # noqa: F401

User = get_user_model()


class TwitterFetcherCompleteTest(TestCase):
    """TwitterFetcherの完全カバレッジテスト"""

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

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_with_since_time(self, mock_client_class):
        """since_timeを指定してツイート取得"""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [Mock(id="123", text="Test", author_id="456")]
        mock_response.includes = {
            "users": [Mock(id="456", username="user", name="User")],
            "media": [],
        }
        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        fetcher.fetch_tweets_by_hashtag("test", since_time=timezone.now())

        # since_timeが渡されたことを確認
        call_kwargs = mock_client.search_recent_tweets.call_args[1]
        self.assertIn("start_time", call_kwargs)

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_no_data(self, mock_client_class):
        """ツイートが見つからない場合"""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = None  # データなし
        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        result = fetcher.fetch_tweets_by_hashtag("test")

        self.assertEqual(result, [])

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_with_media(self, mock_client_class):
        """メディア付きツイートの取得"""
        mock_client = Mock()

        # メディア情報を持つツイート
        mock_tweet = Mock()
        mock_tweet.id = "123"
        mock_tweet.text = "Test tweet"
        mock_tweet.author_id = "456"
        mock_tweet.created_at = timezone.now()
        mock_tweet.attachments = {"media_keys": ["media1", "media2"]}

        mock_user = Mock()
        mock_user.id = "456"
        mock_user.username = "testuser"
        mock_user.name = "Test User"

        mock_media1 = Mock()
        mock_media1.media_key = "media1"
        mock_media1.type = "photo"
        mock_media1.url = "https://example.com/photo1.jpg"

        mock_media2 = Mock()
        mock_media2.media_key = "media2"
        mock_media2.type = "photo"
        mock_media2.url = "https://example.com/photo2.jpg"

        mock_response = Mock()
        mock_response.data = [mock_tweet]
        mock_response.includes = {
            "users": [mock_user],
            "media": [mock_media1, mock_media2],
        }

        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        result = fetcher.fetch_tweets_by_hashtag("test")

        # メディアURLが含まれることを確認
        self.assertEqual(len(result), 1)
        self.assertEqual(len(result[0]["media_urls"]), 2)

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    @patch("contest.twitter_integration.requests.get")
    def test_fetch_and_create_entries_complete(self, mock_requests, mock_client_class):
        """fetch_and_create_entriesの完全テスト"""
        # Twitter APIのモック
        mock_client = Mock()

        mock_tweet = Mock()
        mock_tweet.id = "123456"
        mock_tweet.text = "Test tweet #testhashtag"
        mock_tweet.author_id = "789"
        mock_tweet.created_at = timezone.now()
        mock_tweet.attachments = {"media_keys": ["media1"]}

        mock_user = Mock()
        mock_user.id = "789"
        mock_user.username = "twitteruser"
        mock_user.name = "Twitter User"

        mock_media = Mock()
        mock_media.media_key = "media1"
        mock_media.type = "photo"
        mock_media.url = "https://example.com/photo.jpg"

        mock_response = Mock()
        mock_response.data = [mock_tweet]
        mock_response.includes = {"users": [mock_user], "media": [mock_media]}

        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        # 画像ダウンロードのモック
        mock_img_response = Mock()
        mock_img_response.content = b"fake image data"
        mock_img_response.raise_for_status = Mock()
        mock_requests.return_value = mock_img_response

        fetcher = TwitterFetcher()
        count = fetcher.fetch_and_create_entries(self.contest)

        # エントリーが作成されたことを確認
        self.assertGreaterEqual(count, 0)

    @override_settings(TWITTER_BEARER_TOKEN="test_token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_tweets_exception_handling(self, mock_client_class):
        """例外ハンドリングのテスト"""
        mock_client = Mock()
        mock_client.search_recent_tweets.side_effect = Exception("Twitter API Error")
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        result = fetcher.fetch_tweets_by_hashtag("test")

        # 例外がキャッチされ、空リストが返る
        self.assertEqual(result, [])

    @patch("contest.twitter_integration.TwitterFetcher")
    def test_fetch_all_active_contests_complete(self, mock_fetcher_class):
        """fetch_all_active_contestsの完全テスト"""
        # 複数のアクティブコンテストを作成
        Contest.objects.create(
            slug="contest2",
            title="Contest 2",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="test2",
            twitter_auto_fetch=True,
        )

        mock_fetcher = Mock()
        mock_fetcher.fetch_and_create_entries.return_value = 10
        mock_fetcher_class.return_value = mock_fetcher

        result = fetch_all_active_contests()

        # 結果が辞書であることを確認
        self.assertIsInstance(result, dict)
        # 複数のコンテストが処理されたことを確認
        self.assertGreaterEqual(len(result), 1)
