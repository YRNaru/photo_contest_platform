from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from .models import Contest, Entry, Vote, JudgeScore, Flag
from .serializers import (
    ContestListSerializer, ContestDetailSerializer,
    EntryListSerializer, EntryDetailSerializer, EntryCreateSerializer,
    VoteSerializer, JudgeScoreSerializer, FlagSerializer
)
from .permissions import IsJudge, IsModerator


class ContestViewSet(viewsets.ReadOnlyModelViewSet):
    """コンテストViewSet"""
    queryset = Contest.objects.filter(is_public=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['is_public']
    ordering_fields = ['start_at', 'end_at', 'created_at']
    search_fields = ['title', 'description']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContestDetailSerializer
        return ContestListSerializer
    
    @action(detail=True, methods=['get'])
    def entries(self, request, slug=None):
        """コンテストのエントリー一覧"""
        contest = self.get_object()
        entries = Entry.objects.filter(contest=contest, approved=True).annotate(
            vote_count=Count('votes')
        )
        
        # フィルター
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['vote_count', '-vote_count', 'created_at', '-created_at']:
            entries = entries.order_by(ordering)
        
        page = self.paginate_queryset(entries)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EntryListSerializer(entries, many=True, context={'request': request})
        return Response(serializer.data)


class EntryViewSet(viewsets.ModelViewSet):
    """エントリーViewSet"""
    queryset = Entry.objects.filter(approved=True).annotate(
        vote_count=Count('votes')
    )
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['contest', 'author', 'approved']
    ordering_fields = ['created_at', 'vote_count', 'view_count']
    search_fields = ['title', 'description', 'tags']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EntryCreateSerializer
        elif self.action == 'retrieve':
            return EntryDetailSerializer
        return EntryListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # モデレーターと管理者は未承認も見える
        if self.request.user.is_authenticated and (
            self.request.user.is_moderator or self.request.user.is_staff
        ):
            return Entry.objects.all().annotate(vote_count=Count('votes'))
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """エントリー詳細取得時に閲覧数を増やす"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """投票"""
        entry = self.get_object()
        
        # コンテストのフェーズチェック
        if entry.contest.phase() not in ['voting', 'submission']:
            return Response(
                {'detail': '現在投票期間ではありません。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 既に投票済みかチェック
        if Vote.objects.filter(entry=entry, user=request.user).exists():
            return Response(
                {'detail': '既に投票済みです。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vote = Vote.objects.create(entry=entry, user=request.user)
        serializer = VoteSerializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unvote(self, request, pk=None):
        """投票取消"""
        entry = self.get_object()
        
        try:
            vote = Vote.objects.get(entry=entry, user=request.user)
            vote.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Vote.DoesNotExist:
            return Response(
                {'detail': '投票していません。'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        """通報"""
        entry = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'detail': '通報理由を入力してください。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        flag = Flag.objects.create(entry=entry, user=request.user, reason=reason)
        serializer = FlagSerializer(flag)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsJudge])
    def judge_score(self, request, pk=None):
        """審査員スコア"""
        entry = self.get_object()
        score = request.data.get('score')
        comment = request.data.get('comment', '')
        
        if score is None or not (0 <= int(score) <= 100):
            return Response(
                {'detail': 'スコアは0-100の範囲で入力してください。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        judge_score, created = JudgeScore.objects.update_or_create(
            entry=entry,
            judge=request.user,
            defaults={'score': score, 'comment': comment}
        )
        
        serializer = JudgeScoreSerializer(judge_score)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def approve(self, request, pk=None):
        """承認"""
        entry = self.get_object()
        entry.approved = True
        entry.flagged = False
        entry.save()
        return Response({'detail': 'エントリーを承認しました。'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def reject(self, request, pk=None):
        """非承認"""
        entry = self.get_object()
        entry.approved = False
        entry.save()
        return Response({'detail': 'エントリーを非承認にしました。'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsModerator])
    def pending(self, request):
        """承認待ちエントリー一覧"""
        entries = Entry.objects.filter(approved=False).annotate(
            vote_count=Count('votes')
        ).order_by('-created_at')
        
        page = self.paginate_queryset(entries)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EntryListSerializer(entries, many=True, context={'request': request})
        return Response(serializer.data)

