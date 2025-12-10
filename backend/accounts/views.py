from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import (
    action,
    api_view,
)
from rest_framework.decorators import permission_classes as perm_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserDetailSerializer, UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ユーザーViewSet"""

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return UserDetailSerializer
        return UserSerializer

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """現在のユーザー情報を取得"""
        serializer = UserDetailSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["patch"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def update_me(self, request):
        """現在のユーザー情報を更新"""
        user = request.user

        # アバター画像のアップロード
        if "avatar" in request.FILES:
            user.avatar = request.FILES["avatar"]
            user.save()

        serializer = UserDetailSerializer(user, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def set_twitter_icon(self, request):
        """Twitterのプロフィール画像をアバターに設定"""
        import os

        import requests
        from allauth.socialaccount.models import SocialAccount
        from django.core.files.base import ContentFile

        user = request.user

        # Twitterアカウントを取得
        try:
            twitter_account = SocialAccount.objects.get(user=user, provider="twitter_oauth2")
        except SocialAccount.DoesNotExist:
            return Response({"error": "Twitterアカウントが連携されていません"}, status=status.HTTP_400_BAD_REQUEST)

        # プロフィール画像URLを取得
        profile_image_url = twitter_account.extra_data.get("profile_image_url")
        if not profile_image_url:
            return Response({"error": "Twitterプロフィール画像が見つかりません"}, status=status.HTTP_400_BAD_REQUEST)

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
                {"error": (f"Twitter画像のダウンロードに失敗しました: " f"{str(e)}")},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
@perm_classes([permissions.AllowAny])
def twitter_login(_request):
    """Twitter OAuth2ログインを開始"""
    # allauthのTwitter OAuth2ログインページにリダイレクト
    return redirect("/accounts/twitter_oauth2/login/")


@login_required
def profile(request):
    """
    認証後のリダイレクトハンドラ

    JWTトークンを生成してフロントエンドのプロフィールページにリダイレクト
    """
    user = request.user

    # JWTトークンを生成
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # フロントエンドのプロフィールページにリダイレクト（トークン付き）
    redirect_url = f"http://localhost:13000/profile?access_token={access_token}" f"&refresh_token={refresh_token}"
    return redirect(redirect_url)


@api_view(["GET"])
@perm_classes([permissions.AllowAny])
def get_session_token(request):
    """セッション認証からJWTトークンを取得"""
    if not request.user.is_authenticated:
        return Response({"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    # JWTトークンを生成
    refresh = RefreshToken.for_user(request.user)

    return Response(
        {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": UserDetailSerializer(request.user).data,
        }
    )
