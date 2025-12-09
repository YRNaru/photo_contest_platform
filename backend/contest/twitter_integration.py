"""
Twitter API統合
"""
import tweepy
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone
from .models import Contest, Entry, EntryImage
# from accounts.models import User  # noqa: F401
import logging
# from datetime import timedelta

logger = logging.getLogger(__name__)


class TwitterFetcher:
    """Twitterからハッシュタグ付き投稿を取得"""

    def __init__(self):
        """Twitter API v2クライアントを初期化"""
        self.client = None
        if settings.TWITTER_BEARER_TOKEN:
            self.client = tweepy.Client(
                bearer_token=settings.TWITTER_BEARER_TOKEN,
                consumer_key=settings.TWITTER_API_KEY,
                consumer_secret=settings.TWITTER_API_SECRET,
                access_token=settings.TWITTER_ACCESS_TOKEN,
                access_token_secret=settings.TWITTER_ACCESS_TOKEN_SECRET,
            )

    def fetch_tweets_by_hashtag(self, hashtag, since_time=None, max_results=100):
        """
        ハッシュタグでツイートを検索

        Args:
            hashtag: ハッシュタグ（#なし）
            since_time: この時刻以降のツイートを取得
            max_results: 最大取得数（10-100）

        Returns:
            list: ツイートのリスト
        """
        if not self.client:
            logger.error("Twitter API client not initialized")
            return []

        try:
            # クエリ構築
            query = f"#{hashtag} has:images -is:retweet"

            # since_timeがある場合は追加
            kwargs = {
                'query': query,
                'max_results': min(max_results, 100),
                'tweet_fields': ['created_at', 'author_id', 'text', 'attachments'],
                'expansions': ['author_id', 'attachments.media_keys'],
                'media_fields': ['url', 'preview_image_url', 'type'],
                'user_fields': ['username', 'name'],
            }

            if since_time:
                kwargs['start_time'] = since_time.isoformat()

            # ツイート検索
            response = self.client.search_recent_tweets(**kwargs)

            if not response.data:
                logger.info(f"No tweets found for hashtag #{hashtag}")
                return []

            # ユーザー情報とメディア情報を取得
            users = {user.id: user for user in (response.includes.get('users', []))}
            media = {m.media_key: m for m in (response.includes.get('media', []))}

            tweets = []
            for tweet in response.data:
                # ユーザー情報取得
                user = users.get(tweet.author_id)

                # メディア情報取得
                media_urls = []
                if hasattr(tweet, 'attachments') and 'media_keys' in tweet.attachments:
                    for media_key in tweet.attachments['media_keys']:
                        media_obj = media.get(media_key)
                        if media_obj and media_obj.type == 'photo':
                            media_urls.append(media_obj.url)

                tweets.append({
                    'id': tweet.id,
                    'text': tweet.text,
                    'created_at': tweet.created_at,
                    'author_id': tweet.author_id,
                    'author_username': user.username if user else None,
                    'author_name': user.name if user else None,
                    'media_urls': media_urls,
                    'url': f"https://twitter.com/{user.username if user else 'i'}/status/{tweet.id}"
                })

            logger.info(f"Found {len(tweets)} tweets for hashtag #{hashtag}")
            return tweets

        except Exception as e:
            logger.error(f"Error fetching tweets: {str(e)}")
            return []

    def create_entry_from_tweet(self, contest, tweet_data):
        """
        ツイートからエントリーを作成

        Args:
            contest: Contestインスタンス
            tweet_data: ツイートデータ

        Returns:
            Entry: 作成されたエントリー、またはNone
        """
        try:
            # 既に同じツイートIDのエントリーが存在するかチェック
            if Entry.objects.filter(twitter_tweet_id=str(tweet_data['id'])).exists():
                logger.info(f"Entry already exists for tweet {tweet_data['id']}")
                return None

            # Twitterユーザーに対応するローカルユーザーを取得または作成
            # ユーザーがログインしていない場合は、authorをNullにする
            # または、Twitter情報だけで仮ユーザーを作成
            author = None

            # ツイート本文からタイトルと説明を抽出
            text = tweet_data['text']
            # ハッシュタグを除去
            title = text.replace(f"#{contest.twitter_hashtag}", "").strip()
            if len(title) > 200:
                title = title[:200]
            if not title:
                title = f"Twitter投稿 by @{tweet_data['author_username']}"

            # エントリー作成
            entry = Entry.objects.create(
                contest=contest,
                author=author,
                title=title,
                description=text,
                tags=contest.twitter_hashtag,
                source='twitter',
                twitter_tweet_id=str(tweet_data['id']),
                twitter_user_id=str(tweet_data['author_id']),
                twitter_username=tweet_data['author_username'],
                twitter_url=tweet_data['url'],
                approved=contest.twitter_auto_approve,
            )

            # 画像をダウンロードして保存
            for idx, media_url in enumerate(tweet_data['media_urls'][:contest.max_images_per_entry]):
                try:
                    response = requests.get(media_url, timeout=10)
                    if response.status_code == 200:
                        # ファイル名生成
                        filename = f"twitter_{tweet_data['id']}_{idx}.jpg"

                        # EntryImage作成
                        entry_image = EntryImage(entry=entry, order=idx)
                        entry_image.image.save(
                            filename,
                            ContentFile(response.content),
                            save=True
                        )

                        logger.info(f"Downloaded image {idx + 1} for tweet {tweet_data['id']}")
                except Exception as e:
                    logger.error(f"Error downloading image from {media_url}: {str(e)}")

            logger.info(f"Created entry {entry.id} from tweet {tweet_data['id']}")
            return entry

        except Exception as e:
            logger.error(f"Error creating entry from tweet: {str(e)}")
            return None

    def fetch_and_create_entries(self, contest):
        """
        コンテストのハッシュタグでツイートを取得してエントリーを作成

        Args:
            contest: Contestインスタンス

        Returns:
            int: 作成されたエントリー数
        """
        if not contest.twitter_hashtag or not contest.twitter_auto_fetch:
            logger.info(f"Contest {contest.slug} does not have Twitter auto-fetch enabled")
            return 0

        # 最終取得時刻から取得、なければコンテスト開始時刻から
        since_time = contest.twitter_last_fetch or contest.start_at

        # 現在時刻がコンテスト期間内かチェック
        now = timezone.now()
        if now < contest.start_at or now > contest.end_at:
            logger.info(f"Contest {contest.slug} is not in submission period")
            return 0

        # ツイート取得
        tweets = self.fetch_tweets_by_hashtag(
            contest.twitter_hashtag,
            since_time=since_time
        )

        # エントリー作成
        created_count = 0
        for tweet_data in tweets:
            entry = self.create_entry_from_tweet(contest, tweet_data)
            if entry:
                created_count += 1

        # 最終取得時刻を更新
        contest.twitter_last_fetch = timezone.now()
        contest.save(update_fields=['twitter_last_fetch'])

        logger.info(f"Created {created_count} entries for contest {contest.slug}")
        return created_count


def fetch_all_active_contests():
    """
    すべてのアクティブなコンテストでTwitter取得を実行

    Returns:
        dict: コンテストごとの作成エントリー数
    """
    fetcher = TwitterFetcher()
    results = {}

    # Twitter自動取得が有効なコンテストを取得
    contests = Contest.objects.filter(
        twitter_auto_fetch=True,
        is_public=True,
        start_at__lte=timezone.now(),
        end_at__gte=timezone.now()
    )

    for contest in contests:
        try:
            count = fetcher.fetch_and_create_entries(contest)
            results[contest.slug] = count
        except Exception as e:
            logger.error(f"Error fetching tweets for contest {contest.slug}: {str(e)}")
            results[contest.slug] = 0

    return results
