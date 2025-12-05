from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes as perm_classes
from rest_framework.response import Response
from django.shortcuts import redirect
from django.conf import settings
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

