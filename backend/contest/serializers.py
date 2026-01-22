import hashlib

from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import (
    Category,
    Contest,
    DetailedScore,
    Entry,
    EntryImage,
    Flag,
    JudgeScore,
    JudgingCriteria,
    Vote,
)


class EntryImageSerializer(serializers.ModelSerializer):
    """エントリー画像シリアライザー"""

    class Meta:
        model = EntryImage
        fields = (
            "id",
            "image",
            "thumbnail",
            "width",
            "height",
            "is_thumbnail_ready",
            "order",
            "created_at",
        )
        read_only_fields = (
            "id",
            "thumbnail",
            "width",
            "height",
            "is_thumbnail_ready",
            "created_at",
        )


class CategorySerializer(serializers.ModelSerializer):
    """賞シリアライザー（エントリーは賞に紐づかず、審査時に各賞ごとに投票）"""

    class Meta:
        model = Category
        fields = (
            "id",
            "contest",
            "name",
            "description",
            "order",
            "max_votes_per_judge",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class JudgingCriteriaSerializer(serializers.ModelSerializer):
    """審査基準シリアライザー"""

    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = JudgingCriteria
        fields = (
            "id",
            "contest",
            "category",
            "category_name",
            "name",
            "description",
            "max_score",
            "order",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class ContestCreateSerializer(serializers.ModelSerializer):
    """コンテスト作成シリアライザー"""

    class Meta:
        model = Contest
        fields = (
            "slug",
            "title",
            "description",
            "banner_image",
            "start_at",
            "end_at",
            "voting_end_at",
            "is_public",
            "max_entries_per_user",
            "max_images_per_entry",
            "judging_type",
            "max_votes_per_judge",
            "auto_approve_entries",
            "twitter_hashtag",
            "twitter_auto_fetch",
            "twitter_auto_approve",
            "require_twitter_account",
        )

    def validate(self, data):
        # 開始日時と終了日時のチェック（両方が存在する場合のみ）
        start_at = data.get("start_at")
        end_at = data.get("end_at")

        # 既存のインスタンスがある場合は、そこから値を取得
        if self.instance:
            if not start_at:
                start_at = self.instance.start_at
            if not end_at:
                end_at = self.instance.end_at

        # 両方の値がある場合のみバリデーション
        if start_at and end_at and start_at >= end_at:
            raise serializers.ValidationError("終了日時は開始日時より後である必要があります。")

        # 投票終了日時のチェック
        voting_end_at = data.get("voting_end_at")
        if voting_end_at:
            if not end_at and self.instance:
                end_at = self.instance.end_at
            if end_at and voting_end_at <= end_at:
                raise serializers.ValidationError("投票終了日時は応募終了日時より後である必要があります。")

        return data


class ContestListSerializer(serializers.ModelSerializer):
    """コンテスト一覧シリアライザー"""

    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    is_owner = serializers.SerializerMethodField()
    is_judge = serializers.SerializerMethodField()
    judge_count = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = (
            "id",
            "slug",
            "title",
            "description",
            "banner_image",
            "start_at",
            "end_at",
            "voting_end_at",
            "is_public",
            "judging_type",
            "max_votes_per_judge",
            "phase",
            "entry_count",
            "creator_username",
            "is_owner",
            "is_judge",
            "judge_count",
            "created_at",
        )

    def get_phase(self, obj):
        return obj.phase()

    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()

    def get_is_owner(self, obj):
        """現在のユーザーがこのコンテストの作成者かどうか"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.creator == request.user
        return False

    def get_is_judge(self, obj):
        """現在のユーザーがこのコンテストの審査員かどうか"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.judges.filter(id=request.user.id).exists()
        return False

    def get_judge_count(self, obj):
        """審査員の数"""
        return obj.judges.count()


class EntryListSerializer(serializers.ModelSerializer):
    """エントリー一覧シリアライザー"""

    author = UserSerializer(read_only=True)
    vote_count = serializers.IntegerField(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    contest_slug = serializers.CharField(source="contest.slug", read_only=True)
    contest_title = serializers.CharField(source="contest.title", read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id",
            "contest",
            "contest_slug",
            "contest_title",
            "author",
            "title",
            "description",
            "tags",
            "created_at",
            "vote_count",
            "view_count",
            "thumbnail",
            "approved",
        )
        read_only_fields = ("id", "created_at", "vote_count", "view_count", "approved")

    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.thumbnail:
            # R2/S3の場合は既に絶対URLなのでそのまま返す
            # ローカルストレージの場合はbuild_absolute_uriで絶対URLに変換
            image_url = first_image.thumbnail.url
            if image_url.startswith(("http://", "https://")):
                return image_url
            return self.context["request"].build_absolute_uri(image_url)
        elif first_image:
            # R2/S3の場合は既に絶対URLなのでそのまま返す
            # ローカルストレージの場合はbuild_absolute_uriで絶対URLに変換
            image_url = first_image.image.url
            if image_url.startswith(("http://", "https://")):
                return image_url
            return self.context["request"].build_absolute_uri(image_url)
        return None


class EntryDetailSerializer(serializers.ModelSerializer):
    """エントリー詳細シリアライザー"""

    author = UserSerializer(read_only=True)
    images = EntryImageSerializer(many=True, read_only=True)
    vote_count = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    contest_slug = serializers.CharField(source="contest.slug", read_only=True)
    contest_title = serializers.CharField(source="contest.title", read_only=True)

    class Meta:
        model = Entry
        fields = (
            "id",
            "contest",
            "contest_slug",
            "contest_title",
            "author",
            "title",
            "description",
            "tags",
            "created_at",
            "updated_at",
            "images",
            "vote_count",
            "average_score",
            "user_voted",
            "view_count",
            "approved",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "vote_count",
            "view_count",
            "approved",
        )

    def get_vote_count(self, obj):
        return obj.votes.count()

    def get_average_score(self, obj):
        return obj.average_score()

    def get_user_voted(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.votes.filter(user=request.user).exists()
        return False


class EntryCreateSerializer(serializers.ModelSerializer):
    """エントリー作成シリアライザー"""

    contest = serializers.SlugRelatedField(slug_field="slug", queryset=Contest.objects.all())
    images = serializers.ListField(child=serializers.ImageField(), write_only=True, required=True, max_length=5)

    class Meta:
        model = Entry
        fields = ("id", "contest", "title", "description", "tags", "images")
        read_only_fields = ("id",)

    def _calculate_image_hash(self, image_file):
        """画像ファイルのSHA256ハッシュを計算"""
        sha256 = hashlib.sha256()
        # ファイルポインタを先頭に戻す
        image_file.seek(0)
        # チャンクごとに読み込んでハッシュ計算
        for chunk in iter(lambda: image_file.read(4096), b""):
            sha256.update(chunk)
        # ファイルポインタを先頭に戻す
        image_file.seek(0)
        return sha256.hexdigest()

    def validate(self, data):
        from allauth.socialaccount.models import SocialAccount
        from django.conf import settings

        contest = data.get("contest")
        request = self.context["request"]

        # コンテストフェーズチェック
        current_phase = contest.phase()
        if current_phase != "submission":
            error_msg = (
                f"現在このコンテストは応募期間ではありません。"
                f"現在のフェーズ: {current_phase} "
                f"(開始: {contest.start_at}, 終了: {contest.end_at})"
            )
            # 開発環境では警告のみ、本番環境ではエラー
            if not settings.DEBUG:
                raise serializers.ValidationError(error_msg)
            # DEBUGモードでは警告を出すが続行
            import logging

            logger = logging.getLogger(__name__)
            logger.warning(f"[DEV] {error_msg}")

        # Twitter連携必須チェック
        if contest.require_twitter_account:
            has_twitter = SocialAccount.objects.filter(user=request.user, provider="twitter_oauth2").exists()
            if not has_twitter:
                raise serializers.ValidationError("このコンテストに投稿するには、Twitterアカウントとの連携が必要です。")

        # 応募数制限チェック（0の場合は無制限）
        if contest.max_entries_per_user > 0:
            user_entries = Entry.objects.filter(contest=contest, author=request.user).count()
            if user_entries >= contest.max_entries_per_user:
                msg = f"このコンテストへの応募は最大" f"{contest.max_entries_per_user}件までです。"
                raise serializers.ValidationError(msg)

        # 画像数チェック（0の場合は無制限）
        images = data.get("images", [])
        max_images = contest.max_images_per_entry
        if max_images > 0 and len(images) > max_images:
            raise serializers.ValidationError(f"画像は最大{max_images}枚までアップロードできます。")

        # 画像の重複チェック
        for image in images:
            image_hash = self._calculate_image_hash(image)
            # 同じハッシュ値の画像が既に存在するかチェック
            existing_image = EntryImage.objects.filter(image_hash=image_hash).first()
            if existing_image:
                # 既存の画像のエントリー情報を取得
                existing_entry = existing_image.entry
                msg = f"この画像は既に投稿されています。" f'（エントリー: "{existing_entry.title}"）'
                raise serializers.ValidationError(msg)

        return data

    def create(self, validated_data):
        from django.conf import settings

        images = validated_data.pop("images")
        contest = validated_data.get("contest")

        # コンテストの自動承認設定に従う。設定がない場合はDEBUGモード
        auto_approve = contest.auto_approve_entries if contest else settings.DEBUG

        entry = Entry.objects.create(**validated_data, author=self.context["request"].user, approved=auto_approve)

        # 画像を作成（ハッシュ値も保存）
        for idx, img in enumerate(images):
            image_hash = self._calculate_image_hash(img)
            EntryImage.objects.create(entry=entry, image=img, order=idx, image_hash=image_hash)

        # Celeryタスクで画像処理をキック（後で実装）
        # from .tasks import process_entry_images
        # process_entry_images.delay(entry.id)

        return entry

    def to_representation(self, instance):
        """作成後のレスポンスに詳細情報を含める"""
        return {
            "id": str(instance.id),
            "contest": instance.contest.slug,
            "title": instance.title,
            "description": instance.description,
            "tags": instance.tags,
            "approved": instance.approved,
            "created_at": instance.created_at.isoformat(),
        }


class VoteSerializer(serializers.ModelSerializer):
    """投票シリアライザー"""

    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = Vote
        fields = ("id", "entry", "category", "category_name", "user", "created_at")
        read_only_fields = ("id", "user", "created_at")

    def validate(self, data):
        """投票のバリデーション"""
        entry = data.get("entry")
        category = data.get("category")
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("ログインが必要です")

        contest = entry.contest

        # 審査員チェック
        if not contest.judges.filter(id=request.user.id).exists():
            raise serializers.ValidationError("この投票は審査員のみ実行できます")

        # 投票方式チェック
        if contest.judging_type != "vote":
            msg = "このコンテストは投票方式ではありません"
            raise serializers.ValidationError(msg)

        # 投票期間チェック（応募期間中も投票可能）
        phase = contest.phase()
        if phase not in ["submission", "voting"]:
            raise serializers.ValidationError(f"現在は投票期間ではありません（現在: {phase}）")

        # 最大投票数チェック
        max_votes = category.get_max_votes() if category else contest.max_votes_per_judge
        current_votes = Vote.objects.filter(user=request.user, category=category, entry__contest=contest).count()

        if current_votes >= max_votes:
            msg = f"この部門での最大投票数（{max_votes}票）に達しています"
            raise serializers.ValidationError(msg)

        return data


class FlagSerializer(serializers.ModelSerializer):
    """通報シリアライザー"""

    user = UserSerializer(read_only=True)

    class Meta:
        model = Flag
        fields = ("id", "entry", "user", "reason", "resolved", "created_at")
        read_only_fields = ("id", "user", "resolved", "created_at")


class DetailedScoreSerializer(serializers.ModelSerializer):
    """詳細スコアシリアライザー"""

    criteria_name = serializers.CharField(source="criteria.name", read_only=True)
    criteria_max_score = serializers.IntegerField(source="criteria.max_score", read_only=True)

    class Meta:
        model = DetailedScore
        fields = (
            "id",
            "judge_score",
            "criteria",
            "criteria_name",
            "criteria_max_score",
            "score",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, data):
        """スコアの妥当性チェック"""
        criteria = data.get("criteria")
        score = data.get("score")

        if criteria and score is not None:
            if score > criteria.max_score:
                raise serializers.ValidationError(f"スコアは最大{criteria.max_score}点を超えることはできません")
            if score < 0:
                raise serializers.ValidationError("スコアは0点未満にはできません")

        return data


class DetailedScoreCreateSerializer(serializers.Serializer):
    """詳細スコア作成用シリアライザー（judge_scoreなし）"""

    criteria = serializers.PrimaryKeyRelatedField(queryset=JudgingCriteria.objects.all())
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """スコアの妥当性チェック"""
        criteria = data.get("criteria")
        score = data.get("score")

        if criteria and score is not None:
            if score > criteria.max_score:
                raise serializers.ValidationError(f"スコアは最大{criteria.max_score}点を超えることはできません")
            if score < 0:
                raise serializers.ValidationError("スコアは0点未満にはできません")

        return data


class JudgeScoreDetailSerializer(serializers.ModelSerializer):
    """審査員スコア詳細シリアライザー（詳細スコア含む）"""

    judge = UserSerializer(read_only=True)
    detailed_scores = DetailedScoreSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = JudgeScore
        fields = (
            "id",
            "entry",
            "category",
            "category_name",
            "judge",
            "total_score",
            "comment",
            "detailed_scores",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "judge", "total_score", "created_at", "updated_at")


class JudgeScoreCreateSerializer(serializers.ModelSerializer):
    """審査員スコア作成シリアライザー"""

    detailed_scores = DetailedScoreCreateSerializer(many=True, required=False)

    class Meta:
        model = JudgeScore
        fields = ("id", "entry", "category", "comment", "detailed_scores")
        read_only_fields = ("id",)

    def validate(self, data):
        """スコアのバリデーション"""
        entry = data.get("entry")
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("ログインが必要です")

        contest = entry.contest

        # 審査員チェック
        if not contest.judges.filter(id=request.user.id).exists():
            raise serializers.ValidationError("このスコア付けは審査員のみ実行できます")

        # 点数方式チェック
        if contest.judging_type != "score":
            raise serializers.ValidationError("このコンテストは点数方式ではありません")

        # 審査期間チェック（応募期間中も審査可能）
        phase = contest.phase()
        if phase not in ["submission", "voting"]:
            raise serializers.ValidationError(f"現在は審査期間ではありません（現在: {phase}）")

        return data

    def create(self, validated_data):
        """詳細スコアと共に作成"""
        detailed_scores_data = validated_data.pop("detailed_scores", [])
        judge = self.context["request"].user

        # JudgeScoreを作成
        judge_score = JudgeScore.objects.create(judge=judge, **validated_data)

        # DetailedScoreを作成
        for ds_data in detailed_scores_data:
            DetailedScore.objects.create(judge_score=judge_score, **ds_data)

        # 総合点を計算
        judge_score.calculate_total_score()

        return judge_score

    def update(self, instance, validated_data):
        """詳細スコアを更新"""
        detailed_scores_data = validated_data.pop("detailed_scores", None)

        # JudgeScoreを更新
        instance.comment = validated_data.get("comment", instance.comment)
        instance.save()

        # 詳細スコアがある場合は更新
        if detailed_scores_data is not None:
            # 既存の詳細スコアを削除
            instance.detailed_scores.all().delete()

            # 新しい詳細スコアを作成
            for ds_data in detailed_scores_data:
                DetailedScore.objects.create(judge_score=instance, **ds_data)

            # 総合点を再計算
            instance.calculate_total_score()

        return instance


class ContestDetailSerializer(serializers.ModelSerializer):
    """コンテスト詳細シリアライザー"""

    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    is_owner = serializers.SerializerMethodField()
    is_judge = serializers.SerializerMethodField()
    judges = UserSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    judging_criteria = JudgingCriteriaSerializer(many=True, read_only=True)

    class Meta:
        model = Contest
        fields = (
            "id",
            "slug",
            "title",
            "description",
            "banner_image",
            "start_at",
            "end_at",
            "voting_end_at",
            "is_public",
            "max_entries_per_user",
            "max_images_per_entry",
            "judging_type",
            "max_votes_per_judge",
            "auto_approve_entries",
            "twitter_hashtag",
            "twitter_auto_fetch",
            "twitter_auto_approve",
            "require_twitter_account",
            "phase",
            "entry_count",
            "creator_username",
            "is_owner",
            "is_judge",
            "judges",
            "categories",
            "judging_criteria",
            "created_at",
            "updated_at",
        )

    def get_phase(self, obj):
        return obj.phase()

    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()

    def get_is_owner(self, obj):
        """現在のユーザーがこのコンテストの作成者かどうか"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.creator == request.user
        return False

    def get_is_judge(self, obj):
        """現在のユーザーがこのコンテストの審査員かどうか"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.judges.filter(id=request.user.id).exists()
        return False
