"""Helpers for validating and preparing tweet-based entries."""

from __future__ import annotations

import logging
import re

from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from django.db.models import Q
from rest_framework import serializers

from .models import Entry

logger = logging.getLogger(__name__)


def clean_tweet_text(text: str | None) -> str:
    """Normalize tweet text for titles and previews."""
    cleaned = re.sub(r"https?://\S+", "", text or "")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def build_default_tweet_title(tweet_data: dict) -> str:
    """Build a user-friendly default title from the tweet text."""
    cleaned = clean_tweet_text(tweet_data.get("text"))
    if cleaned:
        return cleaned[:200]

    username = tweet_data.get("author_username")
    if username:
        return f"@{username} の作品"
    return "X投稿作品"


def build_default_tweet_description(tweet_data: dict) -> str:
    """Build the default description for tweet entries."""
    return (tweet_data.get("text") or "").strip()


def validate_contest_submission_phase(contest, *, strict: bool) -> None:
    """Validate that the contest is currently accepting entries."""
    current_phase = contest.phase()
    if current_phase == "submission":
        return

    error_msg = (
        "現在このコンテストは応募期間ではありません。"
        f"現在のフェーズ: {current_phase} "
        f"(開始: {contest.start_at}, 終了: {contest.end_at})"
    )

    if strict or not settings.DEBUG:
        raise serializers.ValidationError(error_msg)

    logger.warning("[DEV] %s", error_msg)


def validate_photo_tweet(tweet_data: dict | None) -> dict:
    """Ensure the tweet can be used as a photo entry."""
    if not tweet_data:
        raise serializers.ValidationError("ツイートの取得に失敗しました。")

    if tweet_data.get("contains_non_photo_media"):
        raise serializers.ValidationError("写真付きツイートのみ登録できます。動画・GIF は対象外です。")

    media_urls = tweet_data.get("media_urls") or []
    if not media_urls:
        raise serializers.ValidationError("写真付きツイートのみ登録できます。")

    if not tweet_data.get("author_id"):
        raise serializers.ValidationError("ツイート投稿者を特定できませんでした。")

    return tweet_data


def user_owns_tweet(user, tweet_data: dict) -> bool:
    """Check whether the authenticated user owns the tweet."""
    if not getattr(user, "is_authenticated", False):
        return False

    author_id = str(tweet_data.get("author_id") or "").strip()
    if not author_id:
        return False

    return SocialAccount.objects.filter(
        user=user,
        provider="twitter_oauth2",
        uid=author_id,
    ).exists()


def resolve_tweet_entry_author(contest, user, tweet_data: dict):
    """Resolve the local author for the tweet entry."""
    if user_owns_tweet(user, tweet_data):
        return user

    if contest.creator == user or user.is_staff:
        return None

    raise serializers.ValidationError(
        "自分の連携済みX投稿、またはコンテスト作成者・スタッフとしてのみ登録できます。"
    )


def validate_tweet_entry_limits(contest, tweet_data: dict, *, author) -> None:
    """Validate duplicate, image-count, and per-user limits."""
    tweet_id = str(tweet_data["id"])
    twitter_user_id = str(tweet_data["author_id"])
    media_urls = tweet_data.get("media_urls") or []

    if Entry.objects.filter(twitter_tweet_id=tweet_id).exists():
        raise serializers.ValidationError("このツイートは既に登録されています。")

    max_images = contest.max_images_per_entry
    if max_images > 0 and len(media_urls) > max_images:
        raise serializers.ValidationError(f"画像は最大{max_images}枚まで登録できます。")

    if contest.max_entries_per_user <= 0:
        return

    filters = Q(twitter_user_id=twitter_user_id)
    if author is not None:
        filters |= Q(author=author)

    existing_entries = Entry.objects.filter(contest=contest).filter(filters).distinct().count()
    if existing_entries >= contest.max_entries_per_user:
        raise serializers.ValidationError(
            f"このコンテストへの応募は最大{contest.max_entries_per_user}件までです。"
        )


def validate_tweet_registration(contest, user, tweet_data: dict):
    """Run the full validation flow for tweet registration."""
    validate_contest_submission_phase(contest, strict=True)
    validate_photo_tweet(tweet_data)
    author = resolve_tweet_entry_author(contest, user, tweet_data)
    validate_tweet_entry_limits(contest, tweet_data, author=author)
    return author
