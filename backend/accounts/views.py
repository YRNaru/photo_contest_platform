from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from .models import User
from .serializers import UserSerializer, UserDetailSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ユーザーViewSet"""
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """現在のユーザー情報を取得"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


@api_view(['GET'])
@perm_classes([permissions.AllowAny])
def twitter_login(request):
    """Twitter OAuth2ログインを開始"""
    # allauthのTwitter OAuth2ログインページにリダイレクト
    return redirect('/accounts/twitter_oauth2/login/')


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
    return redirect(f"http://localhost:13000/profile?access_token={access_token}&refresh_token={refresh_token}")


@api_view(['GET'])
@perm_classes([permissions.AllowAny])
def get_session_token(request):
    """セッション認証からJWTトークンを取得"""
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # JWTトークンを生成
    refresh = RefreshToken.for_user(request.user)
    
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': UserDetailSerializer(request.user).data
    })

