from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Category, Contest, Entry, Flag, JudgeScore, JudgingCriteria, Vote
from .permissions import IsJudge, IsModerator
from .serializers import (
    CategorySerializer,
    ContestCreateSerializer,
    ContestDetailSerializer,
    ContestListSerializer,
    EntryCreateSerializer,
    EntryDetailSerializer,
    EntryListSerializer,
    FlagSerializer,
    JudgeScoreCreateSerializer,
    JudgeScoreDetailSerializer,
    JudgingCriteriaSerializer,
    VoteSerializer,
)


class ContestViewSet(viewsets.ModelViewSet):
    """コンテストViewSet"""

    queryset = Contest.objects.filter(is_public=True)
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ["is_public"]
    ordering_fields = ["start_at", "end_at", "created_at"]
    search_fields = ["title", "description"]

    def get_serializer_class(self):
        if self.action == "create" or self.action == "update" or self.action == "partial_update":
            return ContestCreateSerializer
        elif self.action == "retrieve":
            return ContestDetailSerializer
        return ContestListSerializer

    def get_permissions(self):
        """
        作成: 認証済みユーザー
        更新・削除: 作成者または管理者
        読み取り: 全員可能
        """
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        elif self.action in ["update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """コンテスト作成時に作成者を自動設定"""
        serializer.save(creator=self.request.user)

    def perform_update(self, serializer):
        """更新時に作成者または管理者のみ許可"""
        contest = self.get_object()
        if contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストを編集する権限がありません。")
        serializer.save()

    def perform_destroy(self, instance):
        """削除時に作成者または管理者のみ許可"""
        if instance.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストを削除する権限がありません。")
        instance.delete()

    def get_queryset(self):
        """
        全員: 公開コンテスト
        作成者: 自分のコンテスト（公開・非公開問わず）
        管理者: すべてのコンテスト
        """
        queryset = Contest.objects.all()

        # 管理者はすべて見える
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset

        # 認証済みユーザーは公開コンテスト + 自分のコンテスト
        if self.request.user.is_authenticated:
            from django.db.models import Q

            return queryset.filter(Q(is_public=True) | Q(creator=self.request.user))

        # 未認証ユーザーは公開コンテストのみ
        return queryset.filter(is_public=True)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_contests(self, request):
        """自分が作成したコンテスト一覧"""
        contests = Contest.objects.filter(creator=request.user).order_by("-created_at")

        page = self.paginate_queryset(contests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(contests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def entries(self, request, slug=None):  # type: ignore
        """コンテストのエントリー一覧"""
        contest = self.get_object()
        entries = Entry.objects.filter(contest=contest, approved=True).annotate(vote_count=Count("votes"))

        # フィルター
        ordering = request.query_params.get("ordering", "-created_at")
        if ordering in ["vote_count", "-vote_count", "created_at", "-created_at"]:
            entries = entries.order_by(ordering)

        page = self.paginate_queryset(entries)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = EntryListSerializer(entries, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def judging_contests(self, request):
        """審査中のコンテスト一覧（審査員として割り当てられているコンテスト）"""
        contests = Contest.objects.filter(judges=request.user).order_by("-start_at")

        page = self.paginate_queryset(contests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(contests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def add_judge(self, request, slug=None):  # type: ignore
        """審査員を追加（コンテスト作成者のみ）"""
        contest = self.get_object()

        # 作成者または管理者のみ許可
        if contest.creator != request.user and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストの審査員を管理する権限がありません。")

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_idは必須です。"}, status=status.HTTP_400_BAD_REQUEST)

        from accounts.models import User

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "ユーザーが見つかりません。"}, status=status.HTTP_404_NOT_FOUND)

        # 審査員として追加
        if contest.judges.filter(id=user_id).exists():
            return Response(
                {"detail": "このユーザーは既に審査員として登録されています。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        contest.judges.add(user)
        return Response(
            {
                "detail": f"{user.username}を審査員として追加しました。",
                "judge": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def remove_judge(self, request, slug=None):  # type: ignore
        """審査員を削除（コンテスト作成者のみ）"""
        contest = self.get_object()

        # 作成者または管理者のみ許可
        if contest.creator != request.user and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストの審査員を管理する権限がありません。")

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_idは必須です。"}, status=status.HTTP_400_BAD_REQUEST)

        from accounts.models import User

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "ユーザーが見つかりません。"}, status=status.HTTP_404_NOT_FOUND)

        # 審査員から削除
        if not contest.judges.filter(id=user_id).exists():
            return Response(
                {"detail": "このユーザーは審査員として登録されていません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        contest.judges.remove(user)
        return Response({"detail": f"{user.username}を審査員から削除しました。"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def judges(self, request, slug=None):  # type: ignore
        """審査員一覧（コンテスト作成者と審査員のみ）"""
        contest = self.get_object()

        # 作成者、審査員、または管理者のみ許可
        is_creator = contest.creator == request.user
        is_judge = contest.judges.filter(id=request.user.id).exists()
        if not is_creator and not is_judge and not request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("この情報を閲覧する権限がありません。")

        from accounts.serializers import UserSerializer

        judges = contest.judges.all()
        serializer = UserSerializer(
            judges, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def statistics(self, request, slug=None):  # type: ignore
        """コンテストの統計情報（日別応募数など）"""
        contest = self.get_object()

        from django.db.models.functions import TruncDate

        # from django.utils import timezone
        # 日別応募数を集計
        daily_entries = (
            Entry.objects.filter(contest=contest)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        # 統計情報
        total_entries = Entry.objects.filter(contest=contest, approved=True).count()
        pending_entries = Entry.objects.filter(contest=contest, approved=False).count()
        total_votes = Vote.objects.filter(entry__contest=contest).count()
        unique_voters = Vote.objects.filter(entry__contest=contest).values("user").distinct().count()

        # 日別データをフォーマット
        daily_data = []
        for item in daily_entries:
            daily_data.append({"date": item["date"].isoformat(), "count": item["count"]})

        return Response(
            {
                "daily_entries": daily_data,
                "total_entries": total_entries,
                "pending_entries": pending_entries,
                "total_votes": total_votes,
                "unique_voters": unique_voters,
            }
        )


class EntryViewSet(viewsets.ModelViewSet):
    """エントリーViewSet"""

    queryset = Entry.objects.filter(approved=True).annotate(vote_count=Count("votes"))
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ["contest", "author", "approved"]
    ordering_fields = ["created_at", "vote_count", "view_count"]
    search_fields = ["title", "description", "tags"]

    def get_serializer_class(self):
        if self.action == "create":
            return EntryCreateSerializer
        elif self.action == "retrieve":
            return EntryDetailSerializer
        return EntryListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # モデレーターと管理者は未承認も見える
        if self.request.user.is_authenticated and (self.request.user.is_moderator or self.request.user.is_staff):
            return Entry.objects.all().annotate(vote_count=Count("votes"))
        return queryset

    def retrieve(self, _request, *_args, **_kwargs):
        """エントリー詳細取得時に閲覧数を増やす"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=["view_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):  # type: ignore
        """投票"""
        entry = self.get_object()

        # コンテストのフェーズチェック
        if entry.contest.phase() not in ["voting", "submission"]:
            return Response({"detail": "現在投票期間ではありません。"}, status=status.HTTP_400_BAD_REQUEST)

        # 既に投票済みかチェック
        if Vote.objects.filter(entry=entry, user=request.user).exists():
            return Response({"detail": "既に投票済みです。"}, status=status.HTTP_400_BAD_REQUEST)

        vote = Vote.objects.create(entry=entry, user=request.user)
        serializer = VoteSerializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["delete"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def unvote(self, request, pk=None):  # type: ignore
        """投票取消"""
        entry = self.get_object()

        try:
            vote = Vote.objects.get(entry=entry, user=request.user)
            vote.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Vote.DoesNotExist:
            return Response({"detail": "投票していません。"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):  # type: ignore
        """通報"""
        entry = self.get_object()
        reason = request.data.get("reason", "")

        if not reason:
            return Response({"detail": "通報理由を入力してください。"}, status=status.HTTP_400_BAD_REQUEST)

        flag = Flag.objects.create(entry=entry, user=request.user, reason=reason)
        serializer = FlagSerializer(flag)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsJudge])
    def judge_score(self, request, pk=None):  # type: ignore
        """審査員スコア（旧形式 - 互換性のため残存）"""
        entry = self.get_object()

        # コンテストのフェーズチェック（応募期間中も審査可能）
        if entry.contest.phase() not in ["submission", "voting"]:
            return Response({"detail": "現在は審査期間ではありません。"}, status=status.HTTP_400_BAD_REQUEST)

        score = request.data.get("score")
        comment = request.data.get("comment", "")

        if score is None or not (0 <= int(score) <= 100):
            return Response({"detail": "スコアは0-100の範囲で入力してください。"}, status=status.HTTP_400_BAD_REQUEST)

        judge_score, created = JudgeScore.objects.update_or_create(
            entry=entry,
            judge=request.user,
            defaults={"total_score": score, "comment": comment},
        )

        from .serializers import JudgeScoreDetailSerializer

        serializer = JudgeScoreDetailSerializer(judge_score)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def approve(self, request, pk=None):  # noqa: ARG002
        """承認"""
        entry = self.get_object()
        entry.approved = True
        entry.flagged = False
        entry.save()
        return Response({"detail": "エントリーを承認しました。"})

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def reject(self, request, pk=None):  # type: ignore
        """非承認"""
        entry = self.get_object()
        entry.approved = False
        entry.save()
        return Response({"detail": "エントリーを非承認にしました。"})

    @action(detail=False, methods=["get"], permission_classes=[IsModerator])
    def pending(self, request):
        """承認待ちエントリー一覧"""
        entries = Entry.objects.filter(approved=False).annotate(vote_count=Count("votes")).order_by("-created_at")

        page = self.paginate_queryset(entries)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = EntryListSerializer(entries, many=True, context={"request": request})
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """部門ViewSet"""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["contest"]
    ordering_fields = ["order", "created_at"]

    def get_permissions(self):
        """作成・更新・削除はコンテスト作成者のみ"""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """部門作成時に権限チェック"""
        contest = serializer.validated_data["contest"]
        if contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストの部門を作成する権限がありません")
        serializer.save()

    def perform_update(self, serializer):
        """部門更新時に権限チェック"""
        category = self.get_object()
        if category.contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("この部門を編集する権限がありません")
        serializer.save()

    def perform_destroy(self, instance):
        """部門削除時に権限チェック"""
        if instance.contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("この部門を削除する権限がありません")
        instance.delete()


class JudgingCriteriaViewSet(viewsets.ModelViewSet):
    """審査基準ViewSet"""

    queryset = JudgingCriteria.objects.all()
    serializer_class = JudgingCriteriaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["contest", "category"]
    ordering_fields = ["order", "created_at"]

    def get_permissions(self):
        """作成・更新・削除はコンテスト作成者のみ"""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """審査基準作成時に権限チェック"""
        contest = serializer.validated_data["contest"]
        if contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("このコンテストの審査基準を作成する権限がありません")
        serializer.save()

    def perform_update(self, serializer):
        """審査基準更新時に権限チェック"""
        criteria = self.get_object()
        if criteria.contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("この審査基準を編集する権限がありません")
        serializer.save()

    def perform_destroy(self, instance):
        """審査基準削除時に権限チェック"""
        if instance.contest.creator != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("この審査基準を削除する権限がありません")
        instance.delete()


class VoteViewSet(viewsets.ModelViewSet):
    """投票ViewSet"""

    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsJudge]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["entry", "category", "user"]

    def get_queryset(self):
        """自分の投票のみ表示（管理者は全て）"""
        if self.request.user.is_staff:
            return Vote.objects.all()
        return Vote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """投票作成時にユーザーを自動設定"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def my_votes(self, request):
        """自分の投票一覧"""
        votes = Vote.objects.filter(user=request.user).select_related("entry", "category")

        page = self.paginate_queryset(votes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(votes, many=True)
        return Response(serializer.data)


class JudgeScoreViewSet(viewsets.ModelViewSet):
    """審査員スコアViewSet"""

    queryset = JudgeScore.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsJudge]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["entry", "category", "judge"]
    ordering_fields = ["total_score", "created_at"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return JudgeScoreCreateSerializer
        return JudgeScoreDetailSerializer

    def get_queryset(self):
        """自分のスコアのみ表示（管理者とコンテスト作成者は全て）"""
        if self.request.user.is_staff:
            return JudgeScore.objects.all()

        # 自分が審査員のコンテストのスコア、または自分のスコア
        return JudgeScore.objects.filter(Q(judge=self.request.user) | Q(entry__contest__creator=self.request.user)).distinct()

    def perform_create(self, serializer):
        """スコア作成時にユーザーを自動設定"""
        # シリアライザーのcreateメソッドで処理されるため、ここでは何もしない
        serializer.save()

    @action(detail=False, methods=["get"])
    def my_scores(self, request):
        """自分のスコア一覧"""
        scores = JudgeScore.objects.filter(judge=request.user).select_related("entry", "category", "judge")

        page = self.paginate_queryset(scores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)
