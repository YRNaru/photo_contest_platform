from urllib.parse import urlparse

from allauth.socialaccount.models import SocialAccount
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """ユーザーシリアライザー"""

    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "avatar_url",
            "is_judge",
            "is_moderator",
            "created_at",
        )
        read_only_fields = ("id", "created_at", "is_judge", "is_moderator")

    def get_avatar_url(self, obj):
        """アバター画像のURLを取得"""
        if obj.avatar:
            # 相対パスを返す（Next.jsのrewriteがバックエンドにプロキシ）
            avatar_url = obj.avatar.url
            # S3などの絶対URLの場合は相対パスに変換
            if avatar_url.startswith(("http://", "https://")):
                # 絶対URLから相対パスを抽出
                parsed = urlparse(avatar_url)
                return parsed.path
            return avatar_url
        return obj.avatar_url


class UserDetailSerializer(serializers.ModelSerializer):
    """ユーザー詳細シリアライザー"""

    entry_count = serializers.SerializerMethodField()
    vote_count = serializers.SerializerMethodField()
    social_accounts = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "avatar_url",
            "is_judge",
            "is_moderator",
            "is_staff",
            "is_superuser",
            "first_name",
            "last_name",
            "created_at",
            "entry_count",
            "vote_count",
            "social_accounts",
        )
        read_only_fields = (
            "id",
            "created_at",
            "is_judge",
            "is_moderator",
            "is_staff",
            "is_superuser",
        )

    def get_avatar_url(self, obj):
        """アバター画像のURLを取得"""
        if obj.avatar:
            # 相対パスを返す（Next.jsのrewriteがバックエンドにプロキシ）
            avatar_url = obj.avatar.url
            # S3などの絶対URLの場合は相対パスに変換
            if avatar_url.startswith(("http://", "https://")):
                # 絶対URLから相対パスを抽出
                parsed = urlparse(avatar_url)
                return parsed.path
            return avatar_url
        return obj.avatar_url

    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()

    def get_vote_count(self, obj):
        return obj.votes.count()

    def get_social_accounts(self, obj):
        """ソーシャルアカウント情報を取得"""
        social_accounts = SocialAccount.objects.filter(user=obj)
        result = []

        for sa in social_accounts:
            account_data = {
                "provider": sa.provider,
                "uid": sa.uid,
            }

            # Twitter情報
            if sa.provider == "twitter_oauth2":
                account_data["username"] = (
                    sa.extra_data.get("username")
                    or sa.extra_data.get("screen_name")
                )
                account_data["profile_image_url"] = (
                    sa.extra_data.get("profile_image_url")
                )

            # Google情報
            elif sa.provider == "google":
                account_data["name"] = sa.extra_data.get("name")
                account_data["picture"] = sa.extra_data.get("picture")

            result.append(account_data)

        return result
