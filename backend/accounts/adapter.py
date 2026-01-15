"""カスタムSocialAccountAdapter

既存のメールアドレスがある場合、自動的にアカウントを接続する
"""

import logging

from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model, login
from django.http import HttpResponseRedirect

logger = logging.getLogger(__name__)

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
        try:
            logger.info(f"pre_social_login called: provider={sociallogin.account.provider}, is_existing={sociallogin.is_existing}")
            
            # ソーシャルアカウントが既に存在する場合はスキップ
            if sociallogin.is_existing:
                logger.info("Social account already exists, skipping")
                return

            # ユーザーが既にログイン済みの場合、そのユーザーにソーシャルアカウントを接続
            if request.user.is_authenticated:
                logger.info(f"User already authenticated: {request.user.email}")
                sociallogin.connect(request, request.user)
                raise ImmediateHttpResponse(HttpResponseRedirect("/accounts/profile/"))

            # メールアドレスを取得
            email = None
            if sociallogin.email_addresses:
                email = sociallogin.email_addresses[0].email.lower()
                logger.info(f"Email from email_addresses: {email}")
            elif sociallogin.account.extra_data.get("email"):
                email = sociallogin.account.extra_data.get("email").lower()
                logger.info(f"Email from extra_data: {email}")
            else:
                logger.warning("No email found in sociallogin")

            if not email:
                logger.warning("Email is None, returning without processing")
                return

            # 既存のユーザーを検索
            existing_users = User.objects.filter(email__iexact=email)
            logger.info(f"Found {existing_users.count()} existing users with email: {email}")

            if existing_users.exists():
                # 既存のユーザーにソーシャルアカウントを接続
                existing_user = existing_users.first()
                logger.info(f"Connecting social account to existing user: {existing_user.email}")
                
                try:
                    sociallogin.connect(request, existing_user)
                    logger.info("Social account connected successfully")
                except Exception as e:
                    logger.error(f"Error connecting social account: {e}", exc_info=True)
                    raise

                # ユーザーをログイン
                try:
                    login(
                        request,
                        existing_user,
                        backend="django.contrib.auth.backends.ModelBackend",
                    )
                    logger.info("User logged in successfully")
                except Exception as e:
                    logger.error(f"Error logging in user: {e}", exc_info=True)
                    raise

                # プロフィールページにリダイレクト
                logger.info("Redirecting to profile page")
                raise ImmediateHttpResponse(HttpResponseRedirect("/accounts/profile/"))
            else:
                logger.info("No existing user found, will create new user")
        except ImmediateHttpResponse:
            # リダイレクトは正常な動作なので再発生させる
            raise
        except Exception as e:
            # エラーを詳細にログ出力（本番環境でも見れるようにINFOレベルで出力）
            logger.error(f"[OAuth Error] pre_social_login failed: {e}", exc_info=True)
            logger.info(f"[OAuth Error] Provider: {sociallogin.account.provider if sociallogin.account else 'Unknown'}")
            logger.info(f"[OAuth Error] Exception type: {type(e).__name__}")
            logger.info(f"[OAuth Error] Exception message: {str(e)}")
            # エラーを再発生させて、allauthのデフォルト処理に任せる
            raise

    def save_user(self, request, sociallogin, form=None):
        """
        新しいユーザーを保存

        既存のメールアドレスがあれば、新規作成せずに既存ユーザーに接続
        """
        try:
            email = sociallogin.email_addresses[0].email if sociallogin.email_addresses else None
            logger.info(f"save_user called: email={email}")

            if email:
                existing_users = User.objects.filter(email__iexact=email)
                if existing_users.exists():
                    # 既存のユーザーにソーシャルアカウントを接続
                    existing_user = existing_users.first()
                    logger.info(f"Connecting to existing user: {existing_user.email}")
                    try:
                        sociallogin.connect(request, existing_user)
                        logger.info("Social account connected in save_user")
                    except Exception as e:
                        logger.error(f"Error connecting in save_user: {e}", exc_info=True)
                        raise
                    return existing_user

            # 既存のユーザーがいない場合は、通常通り新規ユーザーを作成
            logger.info("Creating new user")
            user = super().save_user(request, sociallogin, form)
            logger.info(f"New user created: {user.email if user else 'None'}")
            return user
        except Exception as e:
            # エラーを詳細にログ出力（本番環境でも見れるようにINFOレベルで出力）
            logger.error(f"[OAuth Error] save_user failed: {e}", exc_info=True)
            logger.info(f"[OAuth Error] Email: {email}")
            logger.info(f"[OAuth Error] Exception type: {type(e).__name__}")
            logger.info(f"[OAuth Error] Exception message: {str(e)}")
            raise
