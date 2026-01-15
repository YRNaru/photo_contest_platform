"""CustomSocialAccountAdapterのテスト"""

from unittest.mock import Mock, patch  # noqa: F401

from allauth.account.models import EmailAddress as AllauthEmailAddress  # noqa: F401
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.models import EmailAddress  # noqa: F401
from allauth.socialaccount.models import SocialAccount, SocialLogin  # noqa: F401
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase

from .adapter import CustomSocialAccountAdapter

User = get_user_model()


class CustomSocialAccountAdapterTest(TestCase):
    """CustomSocialAccountAdapterのテスト"""

    def setUp(self):
        self.factory = RequestFactory()
        self.adapter = CustomSocialAccountAdapter()

    def test_pre_social_login_existing_sociallogin(self):
        """既存のソーシャルログインの場合はスキップ"""
        request = self.factory.get("/")

        # 既存のソーシャルログインをモック
        sociallogin = Mock()
        sociallogin.is_existing = True

        # 何も起こらない（returnのみ）
        result = self.adapter.pre_social_login(request, sociallogin)

        self.assertIsNone(result)

    def test_pre_social_login_authenticated_user(self):
        """既にログイン済みのユーザーの場合"""
        user = User.objects.create_user(username="existinguser", email="existing@example.com")

        request = self.factory.get("/")
        request.user = user

        # 新しいソーシャルログインをモック
        sociallogin = Mock()
        sociallogin.is_existing = False
        sociallogin.connect = Mock()

        # ImmediateHttpResponseが発生することを確認
        with self.assertRaises(ImmediateHttpResponse):
            self.adapter.pre_social_login(request, sociallogin)

        # connectが呼ばれたことを確認
        sociallogin.connect.assert_called_once()

    def test_pre_social_login_no_email(self):
        """メールアドレスがない場合"""
        request = self.factory.get("/")
        request.user = Mock()
        request.user.is_authenticated = False

        # ソーシャルログインをモック（メールなし）
        sociallogin = Mock()
        sociallogin.is_existing = False
        sociallogin.email_addresses = []
        sociallogin.account = Mock()
        sociallogin.account.extra_data = {}

        # 何も起こらない
        result = self.adapter.pre_social_login(request, sociallogin)
        self.assertIsNone(result)

    def test_pre_social_login_no_existing_user(self):
        """既存のユーザーがいない場合"""
        request = self.factory.get("/")
        request.user = Mock()
        request.user.is_authenticated = False

        # ソーシャルログインをモック
        sociallogin = Mock()
        sociallogin.is_existing = False

        email_obj = Mock()
        email_obj.email = "newuser@example.com"
        sociallogin.email_addresses = [email_obj]
        sociallogin.account = Mock()

        # 既存ユーザーがいないので何も起こらない
        result = self.adapter.pre_social_login(request, sociallogin)
        self.assertIsNone(result)

    def test_save_user_with_existing_email(self):
        """既存のメールアドレスがある場合のsave_user"""
        existing_user = User.objects.create_user(username="existing", email="existing@example.com")

        request = self.factory.get("/")

        # ソーシャルログインをモック
        sociallogin = Mock()
        email_obj = Mock()
        email_obj.email = "existing@example.com"
        sociallogin.email_addresses = [email_obj]
        sociallogin.connect = Mock()

        # 既存ユーザーが返されることを確認
        self.adapter.save_user(request, sociallogin)

        self.assertEqual(existing_user.email, "existing@example.com")
        sociallogin.connect.assert_called_once()

    def test_save_user_new_user(self):
        """新規ユーザーの場合のsave_user"""
        request = self.factory.get("/")

        # ソーシャルログインをモック
        sociallogin = Mock()
        email_obj = Mock()
        email_obj.email = "newuser@example.com"
        sociallogin.email_addresses = [email_obj]

        # superクラスのsave_userをモック
        with patch.object(CustomSocialAccountAdapter.__bases__[0], "save_user") as mock_super:
            mock_super.return_value = Mock(id=123, email="newuser@example.com")

            self.adapter.save_user(request, sociallogin)

            # superのsave_userが呼ばれたことを確認
            mock_super.assert_called_once()

    def test_save_user_no_email(self):
        """メールアドレスがない場合のsave_user"""
        request = self.factory.get("/")

        # ソーシャルログインをモック（メールなし）
        sociallogin = Mock()
        sociallogin.email_addresses = []

        # superクラスのsave_userをモック
        with patch.object(CustomSocialAccountAdapter.__bases__[0], "save_user") as mock_super:
            mock_super.return_value = Mock(id=123)

            self.adapter.save_user(request, sociallogin)

            # superのsave_userが呼ばれたことを確認
            mock_super.assert_called_once()
