"""
Twitter API統合
"""

import logging

import requests
import tweepy
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone

from .models import Contest, Entry, EntryImage

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

    @staticmethod
    def extract_tweet_id_from_url(url):
        """
        ツイートURLからツイートIDを抽出
        
        Args:
            url: ツイートURL (例: https://twitter.com/username/status/1234567890)
        
        Returns:
            str: ツイートID、抽出失敗時はNone
        """
        import re
        # Twitter/X URLのパターン
        patterns = [
            r'twitter\.com/\w+/status/(\d+)',
            r'x\.com/\w+/status/(\d+)',
            r'mobile\.twitter\.com/\w+/status/(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    def fetch_tweet_by_id(self, tweet_id):
        """
        ツイートIDから単一ツイートを取得
        
        Args:
            tweet_id: ツイートID
        
        Returns:
            dict: ツイートデータ、エラー時はNone
        """
        if not self.client:
            logger.error("Twitter API client not initialized")
            return None
        
        try:
            response = self.client.get_tweet(
                tweet_id,
                expansions=["author_id", "attachments.media_keys"],
                tweet_fields=["created_at", "author_id", "text", "attachments"],
                user_fields=["username", "name"],
                media_fields=["url", "preview_image_url", "type"],
            )
            
            if not response.data:
                logger.error(f"Tweet {tweet_id} not found")
                return None
            
            tweet = response.data
            
            # ユーザー情報
            includes = response.includes or {}
            users = {u.id: u for u in includes.get("users", [])}
            user = users.get(tweet.author_id)
            
            # メディア情報
            media_urls = []
            if hasattr(tweet, "attachments") and "media_keys" in tweet.attachments:
                media_dict = {m.media_key: m for m in includes.get("media", [])}
                for media_key in tweet.attachments["media_keys"]:
                    media = media_dict.get(media_key)
                    if media and media.type == "photo" and hasattr(media, "url"):
                        media_urls.append(media.url)
                    elif media:
                        logger.debug(
                            f"Skipping media {media_key}: type={getattr(media, 'type', None)}, "
                            f"has_url={hasattr(media, 'url')}"
                        )
            
            tweet_data = {
                "id": tweet.id,
                "text": tweet.text,
                "created_at": tweet.created_at,
                "author_id": tweet.author_id,
                "author_username": user.username if user else None,
                "author_name": user.name if user else None,
                "media_urls": media_urls,
                "url": f"https://twitter.com/{user.username if user else 'i'}/status/{tweet.id}",
            }
            
            logger.info(
                f"Successfully fetched tweet {tweet_id}: "
                f"author_id={tweet.author_id}, author_username={user.username if user else None}, "
                f"media_count={len(media_urls)}"
            )
            return tweet_data
            
        except Exception as e:
            logger.error(f"Error fetching tweet {tweet_id}: {str(e)}")
            return None

    def fetch_tweets_by_hashtag(self, hashtag, since_time=None, max_results=10):
        """
        ハッシュタグでツイートを検索

        Args:
            hashtag: ハッシュタグ（#なし）
            since_time: この時刻以降のツイートを取得
            max_results: 最大取得数（10-100）※デフォルト10

        Returns:
            list: ツイートのリスト
        """
        if not self.client:
            logger.error("Twitter API client not initialized")
            return []

        try:
            # クエリ構築
            # hashtag引数から#と空白を除去して、クエリで明示的に追加
            import re
            clean_hashtag = hashtag.lstrip('#').strip()
            # 英数字、アンダースコア、日本語文字のみ許可（安全性のため）
            clean_hashtag = re.sub(r'[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', '', clean_hashtag)
            
            if not clean_hashtag:
                logger.error(f"Invalid hashtag after cleaning: {hashtag}")
                return []
            
            # Twitter API v2のハッシュタグ検索
            # 注: #演算子が機能しない場合の対策として、テキストマッチも含める
            query = f"#{clean_hashtag} has:images -is:retweet"
            logger.info(f"Searching for tweets with query: '{query}' for hashtag: '{hashtag}'")

            # since_timeがある場合は追加
            kwargs = {
                "query": query,
                "max_results": min(max(max_results, 10), 100),  # 最小10、最大100
                "tweet_fields": ["created_at", "author_id", "text", "attachments"],
                "expansions": ["author_id", "attachments.media_keys"],
                "media_fields": ["url", "preview_image_url", "type"],
                "user_fields": ["username", "name"],
            }

            if since_time:
                kwargs["start_time"] = since_time.isoformat()

            # ツイート検索
            response = self.client.search_recent_tweets(**kwargs)

            if not response.data:
                logger.info(f"No tweets found for hashtag #{hashtag}")
                return []

            # ユーザー情報とメディア情報を取得
            includes = response.includes or {}
            users = {user.id: user for user in includes.get("users", [])}
            media = {m.media_key: m for m in includes.get("media", [])}

            tweets = []
            for tweet in response.data:
                # ユーザー情報取得
                user = users.get(tweet.author_id)

                # メディア情報取得
                media_urls = []
                if hasattr(tweet, "attachments") and "media_keys" in tweet.attachments:
                    for media_key in tweet.attachments["media_keys"]:
                        media_obj = media.get(media_key)
                        if media_obj and media_obj.type == "photo" and hasattr(media_obj, "url"):
                            media_urls.append(media_obj.url)
                        elif media_obj:
                            logger.debug(
                                f"Skipping media {media_key} in tweet {tweet.id}: "
                                f"type={getattr(media_obj, 'type', None)}, has_url={hasattr(media_obj, 'url')}"
                            )
                        else:
                            logger.warning(f"Media key {media_key} not found in includes for tweet {tweet.id}")
                
                logger.debug(
                    f"Tweet {tweet.id}: author_id={tweet.author_id}, "
                    f"author_username={user.username if user else None}, "
                    f"media_keys={tweet.attachments.get('media_keys', []) if hasattr(tweet, 'attachments') else []}, "
                    f"media_urls={len(media_urls)}"
                )

                tweets.append(
                    {
                        "id": tweet.id,
                        "text": tweet.text,
                        "created_at": tweet.created_at,
                        "author_id": tweet.author_id,
                        "author_username": user.username if user else None,
                        "author_name": user.name if user else None,
                        "media_urls": media_urls,
                        "url": f"https://twitter.com/{user.username if user else 'i'}/status/{tweet.id}",
                    }
                )

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
            if Entry.objects.filter(twitter_tweet_id=str(tweet_data["id"])).exists():
                logger.info(f"Entry already exists for tweet {tweet_data['id']}")
                return None

            # Twitterユーザーに対応するローカルユーザーを取得または作成
            # ユーザーがログインしていない場合は、authorをNullにする
            # または、Twitter情報だけで仮ユーザーを作成
            author = None

            # author_idの存在確認
            if not tweet_data.get("author_id"):
                logger.error(f"Tweet {tweet_data['id']} has no author_id: {tweet_data}")
                return None
            
            # 同じコンテスト内の同じTwitterユーザーのエントリー数をカウント
            existing_entries_count = Entry.objects.filter(
                contest=contest,
                twitter_user_id=str(tweet_data["author_id"])
            ).count()
            
            # タイトルを「ユーザー名_応募N」形式で生成
            entry_number = existing_entries_count + 1
            username = tweet_data.get("author_name") or tweet_data.get("author_username") or "不明"
            title = f"{username}_応募{entry_number}"
            
            # 説明はツイート本文をそのまま使用
            text = tweet_data["text"]

            # エントリー作成
            entry = Entry.objects.create(
                contest=contest,
                author=author,
                title=title,
                description=text,
                tags=contest.twitter_hashtag,
                source="twitter",
                twitter_tweet_id=str(tweet_data["id"]),
                twitter_user_id=str(tweet_data["author_id"]),
                twitter_username=tweet_data["author_username"],
                twitter_url=tweet_data["url"],
                approved=contest.twitter_auto_approve,
            )
            
            logger.info(
                f"Created entry {entry.id}: tweet_id={tweet_data['id']}, "
                f"author_id={tweet_data['author_id']}, author_username={tweet_data['author_username']}, "
                f"media_count={len(tweet_data['media_urls'])}"
            )

            # 画像をダウンロードして保存
            downloaded_count = 0
            for idx, media_url in enumerate(tweet_data["media_urls"][: contest.max_images_per_entry]):
                try:
                    logger.debug(f"Downloading image {idx + 1} from {media_url}")
                    response = requests.get(media_url, timeout=10)
                    if response.status_code == 200:
                        # ファイル名生成
                        filename = f"twitter_{tweet_data['id']}_{idx}.jpg"

                        # EntryImage作成
                        entry_image = EntryImage(entry=entry, order=idx)
                        entry_image.image.save(filename, ContentFile(response.content), save=True)
                        downloaded_count += 1

                        logger.info(f"Downloaded image {idx + 1}/{len(tweet_data['media_urls'])} for tweet {tweet_data['id']}")
                    else:
                        logger.error(f"Failed to download image: HTTP {response.status_code}")
                except Exception as e:
                    logger.error(f"Error downloading image from {media_url}: {str(e)}")

            logger.info(
                f"Entry {entry.id} creation complete: "
                f"downloaded {downloaded_count}/{len(tweet_data['media_urls'])} images"
            )
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

        # 現在時刻がコンテスト期間内かチェック
        now = timezone.now()
        if now < contest.start_at or now > contest.end_at:
            logger.info(f"Contest {contest.slug} is not in submission period")
            return 0

        # 初回取得: 自動取得を有効にした時点から（Twitter API制約: 現在時刻の10秒以上前）
        # 2回目以降: 前回取得時刻から（重複なし）
        if contest.twitter_last_fetch is None:
            # Twitter APIの制約を満たすため、現在時刻の30秒前から取得
            from datetime import timedelta
            since_time = now - timedelta(seconds=30)
            logger.info(f"First fetch for contest {contest.slug}: fetching from 30 seconds ago ({since_time})")
        else:
            since_time = contest.twitter_last_fetch
            logger.info(f"Incremental fetch for contest {contest.slug}: fetching since last fetch ({since_time})")

        # ツイート取得
        tweets = self.fetch_tweets_by_hashtag(contest.twitter_hashtag, since_time=since_time)

        # エントリー作成
        created_count = 0
        for tweet_data in tweets:
            entry = self.create_entry_from_tweet(contest, tweet_data)
            if entry:
                created_count += 1

        # 最終取得時刻を更新
        contest.twitter_last_fetch = timezone.now()
        contest.save(update_fields=["twitter_last_fetch"])

        logger.info(f"Created {created_count} entries for contest {contest.slug}")
        return created_count


def fetch_all_active_contests():
    """
    すべてのアクティブなコンテストでTwitter取得を実行
    since_timeで前回取得時刻以降のみ取得し、重複を完全に排除

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
        end_at__gte=timezone.now(),
    )

    # 各コンテストごとに処理（since_timeで重複排除）
    for contest in contests:
        try:
            count = fetcher.fetch_and_create_entries(contest)
            results[contest.slug] = count
        except Exception as e:
            logger.error(f"Error fetching tweets for contest {contest.slug}: {str(e)}")
            results[contest.slug] = 0

    return results
