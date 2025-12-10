"""カスタムSocialAccountAdapter

既存のメールアドレスがある場合、自動的にアカウントを接続する
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.contrib.auth import get_user_model, login
from django.http import HttpResponseRedirect


User = get_user_model()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    既存のメールアドレスがある場合、自動的にアカウントを接続する
    """

    def pre_social_login(self, request, sociallogin):
        """
        ソーシャルログイン前の処理

        - 既にログイン済みの場合：ソーシャルアカウントを現在のユーザーに接続
        - 未ログインで既存のメールアドレスの場合：自動的にアカウントを接続してログイン
        """
        # ソーシャルアカウントが既に存在する場合はスキップ
        if sociallogin.is_existing:
            return

        # ユーザーが既にログイン済みの場合、そのユーザーにソーシャルアカウントを接続
        if request.user.is_authenticated:
            sociallogin.connect(request, request.user)
            raise ImmediateHttpResponse(HttpResponseRedirect("/accounts/profile/"))

        # メールアドレスを取得
        email = None
        if sociallogin.email_addresses:
            email = sociallogin.email_addresses[0].email.lower()
        elif sociallogin.account.extra_data.get("email"):
            email = sociallogin.account.extra_data.get("email").lower()

        if not email:
            return

        # 既存のユーザーを検索
        existing_users = User.objects.filter(email__iexact=email)

        if existing_users.exists():
            # 既存のユーザーにソーシャルアカウントを接続
            existing_user = existing_users.first()
            sociallogin.connect(request, existing_user)

            # ユーザーをログイン
            login(
                request,
                existing_user,
                backend="django.contrib.auth.backends.ModelBackend",
            )

            # プロフィールページにリダイレクト
            raise ImmediateHttpResponse(HttpResponseRedirect("/accounts/profile/"))

    def save_user(self, request, sociallogin, form=None):
        """
        新しいユーザーを保存

        既存のメールアドレスがあれば、新規作成せずに既存ユーザーに接続
        """
        email = (
            sociallogin.email_addresses[0].email
            if sociallogin.email_addresses
            else None
        )

        if email:
            existing_users = User.objects.filter(email__iexact=email)
            if existing_users.exists():
                # 既存のユーザーにソーシャルアカウントを接続
                existing_user = existing_users.first()
                sociallogin.connect(request, existing_user)
                return existing_user

        # 既存のユーザーがいない場合は、通常通り新規ユーザーを作成
        return super().save_user(request, sociallogin, form)
