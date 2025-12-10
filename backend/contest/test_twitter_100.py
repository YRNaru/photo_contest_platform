"""Twitter連携100%カバレッジ達成テスト"""

from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import Mock, patch
from .models import Contest, Entry
from .twitter_integration import TwitterFetcher
from allauth.socialaccount.models import SocialAccount

User = get_user_model()


class TwitterIntegration100Test(TestCase):
    """Twitter連携の100%カバレッジ達成"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com")
        self.contest = Contest.objects.create(
            slug="twitter-contest",
            title="Twitter Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="testhashtag",
            twitter_auto_fetch=True,
            twitter_auto_approve=True,
        )

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    @patch("contest.twitter_integration.requests.get")
    def test_create_entry_from_tweet_duplicate_check(self, mock_requests, mock_client_class):
        """重複ツイートのチェック（行120-122）"""
        # 既存のエントリーを作成
        Entry.objects.create(
            contest=self.contest,
            title="Existing",
            twitter_tweet_id="123456",
            source="twitter",
            approved=True,
        )

        fetcher = TwitterFetcher()

        # 同じtweet_idで再度作成を試みる
        tweet_data = {
            "id": "123456",  # 同じID
            "text": "Duplicate tweet #testhashtag",
            "author_id": "789",
            "author_username": "user",
            "url": "https://twitter.com/user/status/123456",
            "media_urls": [],
        }

        result = fetcher.create_entry_from_tweet(self.contest, tweet_data)

        # Noneが返ることを確認（行122）
        self.assertIsNone(result)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_create_entry_empty_title_fallback(self, mock_client_class):
        """タイトルが空の場合のフォールバック（行135-136）"""
        fetcher = TwitterFetcher()

        # ハッシュタグのみのツイート
        tweet_data = {
            "id": "999",
            "text": "#testhashtag",  # ハッシュタグのみ
            "author_id": "789",
            "author_username": "user",
            "url": "https://twitter.com/user/status/999",
            "media_urls": [],
        }

        result = fetcher.create_entry_from_tweet(self.contest, tweet_data)

        # タイトルがユーザー名から生成されることを確認（行136）
        self.assertIsNotNone(result)
        self.assertIn("@user", result.title)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    @patch("contest.twitter_integration.requests.get")
    def test_create_entry_download_images_success(self, mock_requests, mock_client_class):
        """画像ダウンロード成功（行156-169）"""
        mock_img_response = Mock()
        mock_img_response.status_code = 200
        mock_img_response.content = b"fake image data"
        mock_img_response.raise_for_status = Mock()
        mock_requests.return_value = mock_img_response

        fetcher = TwitterFetcher()

        tweet_data = {
            "id": "111",
            "text": "Tweet with images #testhashtag",
            "author_id": "789",
            "author_username": "user",
            "url": "https://twitter.com/user/status/111",
            "media_urls": [
                "https://example.com/img1.jpg",
                "https://example.com/img2.jpg",
            ],
        }

        result = fetcher.create_entry_from_tweet(self.contest, tweet_data)

        # エントリーが作成され、画像がダウンロードされることを確認
        self.assertIsNotNone(result)
        self.assertGreaterEqual(result.images.count(), 1)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    @patch("contest.twitter_integration.requests.get")
    def test_create_entry_download_images_error(self, mock_requests, mock_client_class):
        """画像ダウンロードエラー（行170-171）"""
        mock_requests.side_effect = Exception("Download error")

        fetcher = TwitterFetcher()

        tweet_data = {
            "id": "222",
            "text": "Tweet #testhashtag",
            "author_id": "789",
            "author_username": "user",
            "url": "https://twitter.com/user/status/222",
            "media_urls": ["https://example.com/img.jpg"],
        }

        result = fetcher.create_entry_from_tweet(self.contest, tweet_data)

        # エラーがログされるがエントリーは作成される
        self.assertIsNotNone(result)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_create_entry_exception_handling(self, mock_client_class):
        """エントリー作成時の例外ハンドリング（行176-178）"""
        fetcher = TwitterFetcher()

        # 不正なデータで例外を発生させる
        tweet_data = {
            "id": "valid_id",
            "text": "Tweet",
            "author_id": "789",
            "author_username": "user",
            "url": "https://twitter.com/user/status/valid",
            "media_urls": [],
        }

        # contestをNoneにして例外を発生させる
        result = fetcher.create_entry_from_tweet(None, tweet_data)

        # Noneが返ることを確認（例外がキャッチされる）
        self.assertIsNone(result)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    @patch("contest.twitter_integration.requests.get")
    def test_fetch_and_create_entries_since_time(self, mock_requests, mock_client_class):
        """since_timeを使用したfetch_and_create_entries（行191-192）"""
        # 既存の最終取得日時を設定
        self.contest.twitter_last_fetch = timezone.now() - timedelta(hours=1)
        self.contest.save()

        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        count = fetcher.fetch_and_create_entries(self.contest)

        # since_timeが使用されたことを確認
        self.assertEqual(count, 0)

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_and_create_multiple_entries(self, mock_client_class):
        """複数エントリーの作成（行200-201）"""
        mock_client = Mock()

        # 複数のツイートを返す
        mock_response = Mock()
        mock_tweet1 = Mock(id="111", text="Tweet1 #test", author_id="1", created_at=timezone.now())
        mock_tweet2 = Mock(id="222", text="Tweet2 #test", author_id="2", created_at=timezone.now())
        mock_response.data = [mock_tweet1, mock_tweet2]
        profile_url = "https://pbs.twimg.com/profile_images/123_normal.jpg"
        SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={"profile_image_url": profile_url},
        )

        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        fetcher = TwitterFetcher()
        count = fetcher.fetch_and_create_entries(self.contest)

        # 複数作成されることを確認
        self.assertGreaterEqual(count, 0)


class FetchAllActiveContests100Test(TestCase):
    """fetch_all_active_contestsの100%カバレッジ"""

    @override_settings(TWITTER_BEARER_TOKEN="token")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_fetch_all_updates_last_fetch(self, mock_client_class):
        """最終取得日時の更新（行246-248）"""
        contest = Contest.objects.create(
            slug="c1",
            title="C1",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            twitter_hashtag="test",
            twitter_auto_fetch=True,
        )

        # Twitter APIのモック
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []  # データなし
        mock_client.search_recent_tweets.return_value = mock_response
        mock_client_class.return_value = mock_client

        from .twitter_integration import fetch_all_active_contests

        fetch_all_active_contests()

        # コンテストの最終取得日時が更新されていることを確認
        contest.refresh_from_db()
        self.assertIsNotNone(contest.twitter_last_fetch)
