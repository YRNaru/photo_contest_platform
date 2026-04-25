import os
from urllib.parse import urlencode

from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import (
    action,
    api_view,
)
from rest_framework.decorators import permission_classes as perm_classes
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .redirects import (
    ALLOWED_EXTENSION_PROVIDERS,
    DEFAULT_PROFILE_PATH,
    EXTENSION_REDIRECT_SESSION_KEY,
    get_post_login_redirect_path,
    is_valid_extension_redirect_uri,
)
from .serializers import UserDetailSerializer, UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ユーザーViewSet"""

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):  # type: ignore[override]
        if self.action == "retrieve":
            return UserDetailSerializer
        return UserSerializer

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def me(self, request: Request) -> Response:
        """現在のユーザー情報を取得"""
        serializer = UserDetailSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["patch"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def update_me(self, request: Request) -> Response:
        """現在のユーザー情報を更新"""
        user = request.user

        # ユーザー名の更新
        if "username" in request.data:
            username = request.data["username"]
            # ユーザー名のバリデーション
            if username and username.strip():
                # 既存のユーザー名と異なる場合のみチェック
                if username != user.username:
                    # ユーザー名の重複チェック
                    if User.objects.filter(username=username).exists():
                        return Response(
                            {"error": "このユーザー名は既に使用されています"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                user.username = username.strip()
            else:
                return Response(
                    {"error": "ユーザー名は必須です"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # アバター画像のアップロード
        if request.FILES and "avatar" in request.FILES:
            user.avatar = request.FILES["avatar"]

        # 変更があれば保存
        has_username_update = "username" in request.data
        has_avatar_update = request.FILES and "avatar" in request.FILES
        if has_username_update or has_avatar_update:
            user.save()

        serializer = UserDetailSerializer(user, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def set_twitter_icon(self, request: Request) -> Response:
        """Twitterのプロフィール画像をアバターに設定"""
        import requests
        from allauth.socialaccount.models import SocialAccount
        from django.core.files.base import ContentFile

        user = request.user

        # Twitterアカウントを取得
        try:
            twitter_account = SocialAccount.objects.get(user=user, provider="twitter_oauth2")
        except SocialAccount.DoesNotExist:
            return Response(
                {"error": "Twitterアカウントが連携されていません"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # プロフィール画像URLを取得
        profile_image_url = twitter_account.extra_data.get("profile_image_url")
        if not profile_image_url:
            return Response(
                {"error": "Twitterプロフィール画像が見つかりません"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 高解像度版のURLに変更（_normal を _400x400 に）
        profile_image_url = profile_image_url.replace("_normal", "_400x400")

        try:
            # 画像をダウンロード
            response = requests.get(profile_image_url, timeout=10)
            response.raise_for_status()

            # ファイル名を生成
            file_ext = os.path.splitext(profile_image_url)[1] or ".jpg"
            file_name = f"twitter_avatar_{user.id}{file_ext}"

            # ユーザーのアバターに保存
            user.avatar.save(file_name, ContentFile(response.content), save=True)

            serializer = UserDetailSerializer(user, context={"request": request})
            return Response(serializer.data)

        except requests.RequestException as e:
            return Response(
                {"error": (f"Twitter画像のダウンロードに失敗しました: {str(e)}")},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
@perm_classes([permissions.AllowAny])
def twitter_login(_request: Request) -> HttpResponse:
    """Twitter OAuth2ログインを開始"""
    # allauthのTwitter OAuth2ログインページにリダイレクト
    return redirect("/accounts/twitter_oauth2/login/")


def build_token_redirect_url(target_url: str, user: User, *, request: HttpRequest | None = None) -> str:
    """Build a redirect URL containing JWT tokens for the authenticated user."""
    refresh = RefreshToken.for_user(user)
    params = {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
    }

    if request is not None:
        serializer = UserDetailSerializer(user, context={"request": request})
        params["user_id"] = str(serializer.data["id"])

    separator = "&" if "?" in target_url else "?"
    return f"{target_url}{separator}{urlencode(params)}"


def extension_login(request: HttpRequest, provider: str) -> HttpResponse:
    """Start an OAuth flow for the Chrome extension."""
    redirect_uri = request.GET.get("redirect_uri", "").strip()

    if provider not in ALLOWED_EXTENSION_PROVIDERS:
        return HttpResponseBadRequest("Unsupported OAuth provider.")

    if not redirect_uri or not is_valid_extension_redirect_uri(redirect_uri):
        return HttpResponseBadRequest("Invalid extension redirect URI.")

    request.session[EXTENSION_REDIRECT_SESSION_KEY] = redirect_uri
    return redirect(f"/accounts/{provider}/login/")


@login_required
def extension_auth_complete(request: HttpRequest) -> HttpResponse:
    """Complete the extension auth flow and return JWT tokens."""
    redirect_uri = request.session.pop(EXTENSION_REDIRECT_SESSION_KEY, "").strip()

    if not redirect_uri or not is_valid_extension_redirect_uri(redirect_uri):
        return HttpResponseBadRequest("Invalid extension redirect URI.")

    return redirect(build_token_redirect_url(redirect_uri, request.user, request=request))


@login_required
def profile(request: HttpRequest) -> HttpResponse:
    """
    認証後のリダイレクトハンドラ

    JWTトークンを生成してフロントエンドのプロフィールページにリダイレクト
    """
    user = request.user

    path = get_post_login_redirect_path(request)
    if path != DEFAULT_PROFILE_PATH:
        return redirect(path)

    # フロントエンドのプロフィールページにリダイレクト（トークン付き）
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:13000")
    redirect_url = build_token_redirect_url(f"{frontend_url}/profile", user, request=request)
    return redirect(redirect_url)


@api_view(["GET"])
@perm_classes([permissions.AllowAny])
def get_session_token(request: Request) -> Response:
    """セッション認証からJWTトークンを取得"""
    if not request.user.is_authenticated:
        return Response(
            {"error": "Not authenticated"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # JWTトークンを生成
    refresh = RefreshToken.for_user(request.user)

    user_serializer = UserDetailSerializer(request.user, context={"request": request})
    return Response(
        {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": user_serializer.data,
        }
    )
