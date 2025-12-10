from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .serializers import UserDetailSerializer, UserSerializer

User = get_user_model()


class UserModelTest(TestCase):
    """ユーザーモデルのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

    def test_user_creation(self):
        """ユーザーが正しく作成される"""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertTrue(self.user.check_password("testpass123"))

    def test_user_str_representation(self):
        """ユーザーの文字列表現がメールアドレスである"""
        self.assertEqual(str(self.user), "test@example.com")

    def test_email_unique_constraint(self):
        """メールアドレスの一意制約"""
        with self.assertRaises(Exception):
            User.objects.create_user(
                username="testuser2",
                email="test@example.com",  # 重複
                password="testpass123",
            )

    def test_default_permissions(self):
        """デフォルトでは審査員・モデレーターではない"""
        self.assertFalse(self.user.is_judge)
        self.assertFalse(self.user.is_moderator)
        self.assertFalse(self.user.is_staff)

    def test_judge_flag(self):
        """審査員フラグの設定"""
        self.user.is_judge = True
        self.user.save()
        self.assertTrue(self.user.is_judge)

    def test_moderator_flag(self):
        """モデレーターフラグの設定"""
        self.user.is_moderator = True
        self.user.save()
        self.assertTrue(self.user.is_moderator)

    def test_get_avatar_url_with_avatar(self):
        """アバター画像がある場合のURL取得"""
        from django.core.files.uploadedfile import SimpleUploadedFile

        # ダミー画像を作成
        image = SimpleUploadedFile("test_avatar.jpg", b"fake image content", content_type="image/jpeg")
        self.user.avatar = image
        self.user.save()

        avatar_url = self.user.get_avatar_url()
        self.assertIsNotNone(avatar_url)
        self.assertIn("avatars", avatar_url)

    def test_get_avatar_url_with_url(self):
        """アバターURLがある場合"""
        self.user.avatar_url = "https://example.com/avatar.jpg"
        self.user.save()

        avatar_url = self.user.get_avatar_url()
        self.assertEqual(avatar_url, "https://example.com/avatar.jpg")


class UserSerializerTest(TestCase):
    """ユーザーシリアライザーのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

    def test_user_serializer_fields(self):
        """シリアライザーが正しいフィールドを含む"""
        serializer = UserSerializer(self.user)
        data = serializer.data

        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("email", data)
        self.assertIn("avatar_url", data)
        self.assertIn("is_judge", data)
        self.assertIn("is_moderator", data)

    def test_user_serializer_avatar_url_with_file(self):
        """アバター画像ファイルがある場合のURL"""
        from django.core.files.uploadedfile import SimpleUploadedFile

        image = SimpleUploadedFile("avatar.jpg", b"fake image content", content_type="image/jpeg")
        self.user.avatar = image
        self.user.save()

        serializer = UserSerializer(self.user)
        data = serializer.data

        # URLが含まれていることを確認
        self.assertIsNotNone(data["avatar_url"])
        self.assertIn("avatars", data["avatar_url"])

    def test_user_serializer_avatar_url_with_url(self):
        """アバターURLがある場合"""
        self.user.avatar_url = "https://example.com/avatar.jpg"
        self.user.save()

        serializer = UserSerializer(self.user)
        data = serializer.data

        self.assertEqual(data["avatar_url"], "https://example.com/avatar.jpg")

    def test_user_detail_serializer_fields(self):
        """詳細シリアライザーが追加フィールドを含む"""
        serializer = UserDetailSerializer(self.user)
        data = serializer.data

        self.assertIn("entry_count", data)
        self.assertIn("vote_count", data)
        self.assertIn("social_accounts", data)

    def test_user_detail_serializer_entry_count(self):
        """エントリー数のカウント"""
        from datetime import timedelta

        from django.utils import timezone

        from contest.models import Contest, Entry

        contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        # 承認済みエントリーを作成
        Entry.objects.create(contest=contest, author=self.user, title="Approved Entry", approved=True)

        # 未承認エントリーを作成（カウントされない）
        Entry.objects.create(contest=contest, author=self.user, title="Pending Entry", approved=False)

        serializer = UserDetailSerializer(self.user)
        data = serializer.data

        # 承認済みのみカウント
        self.assertEqual(data["entry_count"], 1)

    def test_user_detail_serializer_vote_count(self):
        """投票数のカウント"""
        from datetime import timedelta

        from django.utils import timezone

        from contest.models import Contest, Entry, Vote

        contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        entry = Entry.objects.create(contest=contest, author=self.user, title="Test Entry", approved=True)

        # 投票を作成
        Vote.objects.create(entry=entry, user=self.user)

        serializer = UserDetailSerializer(self.user)
        data = serializer.data

        self.assertEqual(data["vote_count"], 1)

    def test_user_detail_serializer_with_google_account(self):
        """Googleアカウント情報を含む"""
        SocialAccount.objects.create(
            user=self.user,
            provider="google",
            uid="google123",
            extra_data={
                "name": "Test User",
                "picture": "https://example.com/picture.jpg",
            },
        )

        serializer = UserDetailSerializer(self.user)
        data = serializer.data

        self.assertEqual(len(data["social_accounts"]), 1)
        self.assertEqual(data["social_accounts"][0]["provider"], "google")
        self.assertEqual(data["social_accounts"][0]["name"], "Test User")
        self.assertEqual(data["social_accounts"][0]["picture"], "https://example.com/picture.jpg")

    def test_read_only_fields(self):
        """読み取り専用フィールドが更新できない"""
        serializer = UserSerializer(self.user)
        # is_judge, is_moderatorは読み取り専用
        self.assertIn("is_judge", serializer.Meta.read_only_fields)
        self.assertIn("is_moderator", serializer.Meta.read_only_fields)


class UserAPITest(APITestCase):
    """ユーザーAPIのテスト"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

    def test_get_users_list(self):
        """ユーザー一覧を取得"""
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_user_detail(self):
        """ユーザー詳細を取得"""
        response = self.client.get(f"/api/users/{self.user.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    def test_get_current_user_unauthenticated(self):
        """未認証でme エンドポイントにアクセス"""
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user_authenticated(self):
        """認証済みでme エンドポイントにアクセス"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/users/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    def test_update_current_user(self):
        """現在のユーザー情報を更新"""
        self.client.force_authenticate(user=self.user)

        # ユーザー名を更新
        response = self.client.patch("/api/users/update_me/", {"username": "newusername"})
        # アバターのアップロードがないため、200が返る
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_current_user_with_avatar(self):
        """アバター画像付きでユーザー情報を更新"""
        from django.core.files.uploadedfile import SimpleUploadedFile

        self.client.force_authenticate(user=self.user)

        # ダミー画像を作成
        image = SimpleUploadedFile("test_avatar.jpg", b"fake image content", content_type="image/jpeg")

        response = self.client.patch("/api/users/update_me/", {"avatar": image}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.avatar)

    def test_set_twitter_icon_without_twitter_account(self):
        """Twitter連携なしでTwitterアイコン設定を試みる"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/users/set_twitter_icon/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_set_twitter_icon_without_profile_image(self):
        """プロフィール画像のないTwitterアカウント"""
        self.client.force_authenticate(user=self.user)

        # プロフィール画像URLなしのTwitterアカウントを作成
        SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={},  # profile_image_urlなし
        )

        response = self.client.post("/api/users/set_twitter_icon/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_set_twitter_icon_success(self):
        """Twitterアイコン設定の成功ケース"""
        from unittest.mock import Mock, patch

        self.client.force_authenticate(user=self.user)

        # Twitterアカウントを作成
        profile_url = "https://pbs.twimg.com/profile_images/123_normal.jpg"
        SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={"profile_image_url": profile_url},
        )

        # requestsモジュール全体をモック
        with patch("requests.get") as mock_get:
            mock_response = Mock()
            mock_response.content = b"fake image data"
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            response = self.client.post("/api/users/set_twitter_icon/")

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            # URLが_400x400に変更されていることを確認
            mock_get.assert_called_once()
            called_url = mock_get.call_args[0][0]
            self.assertIn("_400x400", called_url)

    def test_set_twitter_icon_download_error(self):
        """Twitter画像ダウンロード失敗"""
        from unittest.mock import patch

        import requests

        self.client.force_authenticate(user=self.user)

        # Twitterアカウントを作成
        profile_url = "https://pbs.twimg.com/profile_images/123_normal.jpg"
        SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={"profile_image_url": profile_url},
        )

        # requestsモジュール全体をモック
        with patch("requests.get") as mock_get:
            mock_get.side_effect = requests.RequestException("Network error")

            response = self.client.post("/api/users/set_twitter_icon/")

            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("error", response.data)
            self.assertIn("ダウンロードに失敗", response.data["error"])

    def test_get_session_token(self):
        """セッション認証からJWTトークン取得"""
        from django.contrib.sessions.middleware import SessionMiddleware
        from rest_framework.test import APIRequestFactory

        from accounts.views import get_session_token

        factory = APIRequestFactory()
        request = factory.get("/api/get-session-token/")

        # セッションミドルウェアを適用
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request)
        request.session.save()

        # ユーザーを認証
        request.user = self.user

        response = get_session_token(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data)
        self.assertIn("refresh_token", response.data)
        self.assertIn("user", response.data)

    def test_get_session_token_unauthenticated(self):
        """未認証でセッショントークン取得"""
        from django.contrib.auth.models import AnonymousUser
        from rest_framework.test import APIRequestFactory

        from accounts.views import get_session_token

        factory = APIRequestFactory()
        request = factory.get("/api/get-session-token/")
        request.user = AnonymousUser()

        response = get_session_token(request)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_twitter_login_redirect(self):
        """Twitter OAuth2ログインへのリダイレクト"""
        from django.test import RequestFactory

        from accounts.views import twitter_login

        factory = RequestFactory()
        request = factory.get("/api/twitter-login/")

        response = twitter_login(request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("twitter_oauth2/login", response.url)

    def test_profile_redirect_authenticated(self):
        """認証済みユーザーのプロフィールリダイレクト"""
        from django.contrib.sessions.middleware import SessionMiddleware
        from django.test import RequestFactory

        from accounts.views import profile

        factory = RequestFactory()
        request = factory.get("/profile/")

        # セッションとユーザーをリクエストに追加
        middleware = SessionMiddleware(lambda x: None)
        middleware.process_request(request)
        request.session.save()

        request.user = self.user

        response = profile(request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("access_token", response.url)
        self.assertIn("refresh_token", response.url)


class SocialAuthTest(TestCase):
    """ソーシャル認証のテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="socialuser", email="social@example.com", password="testpass123")

    def test_create_twitter_social_account(self):
        """Twitterソーシャルアカウントの作成"""
        social_account = SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={
                "username": "twitteruser",
                "profile_image_url": "https://example.com/avatar.jpg",
            },
        )

        self.assertEqual(social_account.provider, "twitter_oauth2")
        self.assertEqual(social_account.user, self.user)

    def test_create_google_social_account(self):
        """Googleソーシャルアカウントの作成"""
        social_account = SocialAccount.objects.create(
            user=self.user,
            provider="google",
            uid="google123",
            extra_data={
                "name": "Google User",
                "picture": "https://example.com/picture.jpg",
            },
        )

        self.assertEqual(social_account.provider, "google")
        self.assertEqual(social_account.user, self.user)

    def test_user_detail_serializer_with_social_accounts(self):
        """ソーシャルアカウント情報を含むシリアライザー"""
        # Twitterアカウントを追加
        SocialAccount.objects.create(
            user=self.user,
            provider="twitter_oauth2",
            uid="123456789",
            extra_data={
                "username": "twitteruser",
                "profile_image_url": "https://example.com/avatar.jpg",
            },
        )

        serializer = UserDetailSerializer(self.user)
        data = serializer.data

        self.assertIn("social_accounts", data)
        self.assertEqual(len(data["social_accounts"]), 1)
        self.assertEqual(data["social_accounts"][0]["provider"], "twitter_oauth2")
        self.assertEqual(data["social_accounts"][0]["username"], "twitteruser")


class UserPermissionsTest(APITestCase):
    """ユーザー権限のテスト"""

    def setUp(self):
        self.normal_user = User.objects.create_user(username="normaluser", email="normal@example.com", password="testpass123")

        self.judge_user = User.objects.create_user(
            username="judgeuser",
            email="judge@example.com",
            password="testpass123",
            is_judge=True,
        )

        self.moderator_user = User.objects.create_user(
            username="moderatoruser",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )

        self.admin_user = User.objects.create_superuser(
            username="adminuser", email="admin@example.com", password="testpass123"
        )

    def test_normal_user_permissions(self):
        """通常ユーザーの権限"""
        self.assertFalse(self.normal_user.is_judge)
        self.assertFalse(self.normal_user.is_moderator)
        self.assertFalse(self.normal_user.is_staff)

    def test_judge_user_permissions(self):
        """審査員ユーザーの権限"""
        self.assertTrue(self.judge_user.is_judge)
        self.assertFalse(self.judge_user.is_moderator)

    def test_moderator_user_permissions(self):
        """モデレーターユーザーの権限"""
        self.assertFalse(self.moderator_user.is_judge)
        self.assertTrue(self.moderator_user.is_moderator)

    def test_admin_user_permissions(self):
        """管理者ユーザーの権限"""
        self.assertTrue(self.admin_user.is_staff)
        self.assertTrue(self.admin_user.is_superuser)
