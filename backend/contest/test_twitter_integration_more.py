"""twitter_integration.TwitterFetcher の追加分岐（カバレッジ用）"""

from datetime import timedelta
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings
from django.utils import timezone

from .models import Contest
from .twitter_integration import TwitterFetcher, fetch_all_active_contests


class ExtractTweetIdTests(TestCase):
    def test_mobile_twitter_pattern(self):
        self.assertEqual(
            TwitterFetcher.extract_tweet_id_from_url("https://mobile.twitter.com/u/status/4242"),
            "4242",
        )

    def test_no_match_returns_none(self):
        self.assertIsNone(TwitterFetcher.extract_tweet_id_from_url("https://example.com"))


class FetchTweetByIdMoreTests(TestCase):
    @override_settings(TWITTER_BEARER_TOKEN="")
    def test_returns_none_without_client(self):
        f = TwitterFetcher()
        self.assertIsNone(f.fetch_tweet_by_id("1"))

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_returns_none_when_no_tweet_data(self, mock_client_class):
        client = Mock()
        client.get_tweet.return_value = Mock(data=None)
        mock_client_class.return_value = client
        f = TwitterFetcher()
        self.assertIsNone(f.fetch_tweet_by_id("9"))

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_success_with_photo_media(self, mock_client_class):
        tweet = Mock()
        tweet.id = "99"
        tweet.text = "hi"
        tweet.created_at = None
        tweet.author_id = "u1"
        tweet.attachments = {"media_keys": ["m1"]}
        media = Mock()
        media.media_key = "m1"
        media.type = "photo"
        media.url = "http://img"
        user = Mock()
        user.id = "u1"
        user.username = "alice"
        user.name = "A"
        resp = Mock(data=tweet, includes={"users": [user], "media": [media]})
        client = Mock(get_tweet=Mock(return_value=resp))
        mock_client_class.return_value = client
        out = TwitterFetcher().fetch_tweet_by_id("99")
        self.assertEqual(out["id"], "99")
        self.assertEqual(out["media_urls"], ["http://img"])

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_non_photo_media_branch(self, mock_client_class):
        tweet = Mock()
        tweet.id = "1"
        tweet.text = "x"
        tweet.created_at = None
        tweet.author_id = "u1"
        tweet.attachments = {"media_keys": ["m1"]}
        media = Mock()
        media.media_key = "m1"
        media.type = "video"
        user = Mock(id="u1", username="a", name="N")
        resp = Mock(data=tweet, includes={"users": [user], "media": [media]})
        mock_client_class.return_value = Mock(get_tweet=Mock(return_value=resp))
        out = TwitterFetcher().fetch_tweet_by_id("1")
        self.assertEqual(out["media_urls"], [])

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_author_missing_uses_placeholder_url(self, mock_client_class):
        tweet = Mock()
        tweet.id = "5"
        tweet.text = "t"
        tweet.created_at = None
        tweet.author_id = "ghost"
        tweet.attachments = {}
        resp = Mock(data=tweet, includes={"users": [], "media": []})
        mock_client_class.return_value = Mock(get_tweet=Mock(return_value=resp))
        out = TwitterFetcher().fetch_tweet_by_id("5")
        self.assertIn("/i/status/5", out["url"])

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_get_tweet_raises_returns_none(self, mock_client_class):
        mock_client_class.return_value = Mock(get_tweet=Mock(side_effect=RuntimeError("api")))
        self.assertIsNone(TwitterFetcher().fetch_tweet_by_id("1"))


class FetchTweetsByHashtagMoreTests(TestCase):
    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_invalid_hashtag_after_clean_returns_empty(self, mock_client_class):
        mock_client_class.return_value = Mock()
        f = TwitterFetcher()
        self.assertEqual(f.fetch_tweets_by_hashtag("###"), [])
        mock_client_class.return_value.search_recent_tweets.assert_not_called()

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_no_tweets_in_response(self, mock_client_class):
        client = Mock()
        client.search_recent_tweets.return_value = Mock(data=None)
        mock_client_class.return_value = client
        self.assertEqual(TwitterFetcher().fetch_tweets_by_hashtag("ok"), [])

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_non_photo_media_in_hashtag_search_logs_debug(self, mock_client_class):
        tweet = Mock()
        tweet.id = "1"
        tweet.text = "t"
        tweet.created_at = None
        tweet.author_id = "u1"
        tweet.attachments = {"media_keys": ["m1"]}
        user = Mock(id="u1", username="u", name="U")
        media = Mock()
        media.media_key = "m1"
        media.type = "video"
        media.url = "http://vid"
        resp = Mock(data=[tweet], includes={"users": [user], "media": [media]})
        mock_client_class.return_value = Mock(search_recent_tweets=Mock(return_value=resp))
        TwitterFetcher().fetch_tweets_by_hashtag("tag")
        # 分岐: photo 以外のメディア（logger.debug 行を通す）

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_media_key_missing_in_includes(self, mock_client_class):
        tweet = Mock()
        tweet.id = "1"
        tweet.text = "t"
        tweet.created_at = None
        tweet.author_id = "u1"
        tweet.attachments = {"media_keys": ["ghost"]}
        user = Mock(id="u1", username="u", name="U")
        resp = Mock(data=[tweet], includes={"users": [user], "media": []})
        client = Mock(search_recent_tweets=Mock(return_value=resp))
        mock_client_class.return_value = client
        out = TwitterFetcher().fetch_tweets_by_hashtag("tag")
        self.assertEqual(len(out), 1)
        self.assertEqual(out[0]["media_urls"], [])

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch("contest.twitter_integration.tweepy.Client")
    def test_since_time_passed_to_search(self, mock_client_class):
        client = Mock()
        client.search_recent_tweets.return_value = Mock(data=[])
        mock_client_class.return_value = client
        since = timezone.now()
        TwitterFetcher().fetch_tweets_by_hashtag("h", since_time=since)
        kwargs = client.search_recent_tweets.call_args.kwargs
        self.assertEqual(kwargs["start_time"], since.isoformat())


class FetchAndCreateEntriesMoreTests(TestCase):
    def setUp(self):
        self.now = timezone.now()
        self.contest = Contest.objects.create(
            slug="tw-fetch",
            title="T",
            start_at=self.now - timedelta(days=1),
            end_at=self.now + timedelta(days=1),
            twitter_hashtag="h",
            twitter_auto_fetch=True,
            is_public=True,
        )

    def test_returns_zero_when_auto_fetch_disabled(self):
        self.contest.twitter_auto_fetch = False
        self.contest.save()
        self.assertEqual(TwitterFetcher().fetch_and_create_entries(self.contest), 0)

    def test_returns_zero_outside_contest_period(self):
        self.contest.start_at = self.now + timedelta(days=10)
        self.contest.save()
        self.assertEqual(TwitterFetcher().fetch_and_create_entries(self.contest), 0)

    @override_settings(TWITTER_BEARER_TOKEN="tok")
    @patch.object(TwitterFetcher, "fetch_tweets_by_hashtag", return_value=[])
    def test_first_fetch_uses_since_time(self, mock_fetch):
        self.contest.twitter_last_fetch = None
        self.contest.save()
        TwitterFetcher().fetch_and_create_entries(self.contest)
        mock_fetch.assert_called_once()
        self.assertIsNotNone(mock_fetch.call_args.kwargs.get("since_time"))


class CreateEntryFromTweetEdgeTests(TestCase):
    def setUp(self):
        self.contest = Contest.objects.create(
            slug="ce-edge",
            title="CE",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=1),
            twitter_auto_approve=True,
        )

    def test_returns_none_without_author_id(self):
        fetcher = TwitterFetcher()
        data = {"id": "noid", "text": "x", "author_username": "u", "url": "http://t", "media_urls": []}
        self.assertIsNone(fetcher.create_entry_from_tweet(self.contest, data))


class FetchAllActiveContestsMoreTests(TestCase):
    def setUp(self):
        now = timezone.now()
        Contest.objects.create(
            slug="active1",
            title="A",
            start_at=now - timedelta(days=1),
            end_at=now + timedelta(days=1),
            twitter_hashtag="x",
            twitter_auto_fetch=True,
            is_public=True,
        )

    @patch.object(TwitterFetcher, "fetch_and_create_entries", side_effect=Exception("boom"))
    def test_per_contest_exception_returns_zero_for_slug(self, _mock):
        out = fetch_all_active_contests()
        self.assertEqual(out.get("active1"), 0)
