from rest_framework import serializers
from .models import Contest, Entry, EntryImage, Vote, JudgeScore, Flag
from accounts.serializers import UserSerializer
import hashlib


class EntryImageSerializer(serializers.ModelSerializer):
    """エントリー画像シリアライザー"""
    
    class Meta:
        model = EntryImage
        fields = ('id', 'image', 'thumbnail', 'width', 'height', 
                  'is_thumbnail_ready', 'order', 'created_at')
        read_only_fields = ('id', 'thumbnail', 'width', 'height', 
                           'is_thumbnail_ready', 'created_at')


class ContestCreateSerializer(serializers.ModelSerializer):
    """コンテスト作成シリアライザー"""
    
    class Meta:
        model = Contest
        fields = ('slug', 'title', 'description', 'banner_image',
                  'start_at', 'end_at', 'voting_end_at', 'is_public',
                  'max_entries_per_user', 'max_images_per_entry',
                  'twitter_hashtag', 'twitter_auto_fetch', 'twitter_auto_approve')
    
    def validate(self, data):
        # 開始日時と終了日時のチェック（両方が存在する場合のみ）
        start_at = data.get('start_at')
        end_at = data.get('end_at')
        
        # 既存のインスタンスがある場合は、そこから値を取得
        if self.instance:
            if not start_at:
                start_at = self.instance.start_at
            if not end_at:
                end_at = self.instance.end_at
        
        # 両方の値がある場合のみバリデーション
        if start_at and end_at and start_at >= end_at:
            raise serializers.ValidationError('終了日時は開始日時より後である必要があります。')
        
        # 投票終了日時のチェック
        voting_end_at = data.get('voting_end_at')
        if voting_end_at:
            if not end_at and self.instance:
                end_at = self.instance.end_at
            if end_at and voting_end_at <= end_at:
                raise serializers.ValidationError('投票終了日時は応募終了日時より後である必要があります。')
        
        return data


class ContestListSerializer(serializers.ModelSerializer):
    """コンテスト一覧シリアライザー"""
    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ('slug', 'title', 'description', 'banner_image',
                  'start_at', 'end_at', 'voting_end_at', 'is_public',
                  'phase', 'entry_count', 'creator_username', 'is_owner', 'created_at')
    
    def get_phase(self, obj):
        return obj.phase()
    
    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()
    
    def get_is_owner(self, obj):
        """現在のユーザーがこのコンテストの作成者かどうか"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.creator == request.user
        return False


class ContestDetailSerializer(serializers.ModelSerializer):
    """コンテスト詳細シリアライザー"""
    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ('slug', 'title', 'description', 'banner_image',
                  'start_at', 'end_at', 'voting_end_at', 'is_public',
                  'max_entries_per_user', 'max_images_per_entry',
                  'phase', 'entry_count', 'creator_username', 'is_owner',
                  'created_at', 'updated_at')
    
    def get_phase(self, obj):
        return obj.phase()
    
    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()
    
    def get_is_owner(self, obj):
        """現在のユーザーがこのコンテストの作成者かどうか"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.creator == request.user
        return False


class EntryListSerializer(serializers.ModelSerializer):
    """エントリー一覧シリアライザー"""
    author = UserSerializer(read_only=True)
    vote_count = serializers.IntegerField(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    contest_slug = serializers.CharField(source='contest.slug', read_only=True)
    contest_title = serializers.CharField(source='contest.title', read_only=True)
    
    class Meta:
        model = Entry
        fields = ('id', 'contest', 'contest_slug', 'contest_title', 'author', 'title', 'description', 
                  'tags', 'created_at', 'vote_count', 'view_count', 
                  'thumbnail', 'approved')
        read_only_fields = ('id', 'created_at', 'vote_count', 'view_count', 'approved')
    
    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.thumbnail:
            return self.context['request'].build_absolute_uri(first_image.thumbnail.url)
        elif first_image:
            return self.context['request'].build_absolute_uri(first_image.image.url)
        return None


class EntryDetailSerializer(serializers.ModelSerializer):
    """エントリー詳細シリアライザー"""
    author = UserSerializer(read_only=True)
    images = EntryImageSerializer(many=True, read_only=True)
    vote_count = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    contest_slug = serializers.CharField(source='contest.slug', read_only=True)
    contest_title = serializers.CharField(source='contest.title', read_only=True)
    
    class Meta:
        model = Entry
        fields = ('id', 'contest', 'contest_slug', 'contest_title', 'author', 'title', 'description', 
                  'tags', 'created_at', 'updated_at', 'images',
                  'vote_count', 'average_score', 'user_voted', 
                  'view_count', 'approved')
        read_only_fields = ('id', 'created_at', 'updated_at', 
                           'vote_count', 'view_count', 'approved')
    
    def get_vote_count(self, obj):
        return obj.votes.count()
    
    def get_average_score(self, obj):
        return obj.average_score()
    
    def get_user_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.votes.filter(user=request.user).exists()
        return False


class EntryCreateSerializer(serializers.ModelSerializer):
    """エントリー作成シリアライザー"""
    contest = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Contest.objects.all()
    )
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True,
        max_length=5
    )
    
    class Meta:
        model = Entry
        fields = ('id', 'contest', 'title', 'description', 'tags', 'images')
        read_only_fields = ('id',)
    
    def _calculate_image_hash(self, image_file):
        """画像ファイルのSHA256ハッシュを計算"""
        sha256 = hashlib.sha256()
        # ファイルポインタを先頭に戻す
        image_file.seek(0)
        # チャンクごとに読み込んでハッシュ計算
        for chunk in iter(lambda: image_file.read(4096), b''):
            sha256.update(chunk)
        # ファイルポインタを先頭に戻す
        image_file.seek(0)
        return sha256.hexdigest()
    
    def validate(self, data):
        from django.conf import settings
        contest = data.get('contest')
        request = self.context['request']
        
        # コンテストフェーズチェック
        current_phase = contest.phase()
        if current_phase != 'submission':
            error_msg = (
                f'現在このコンテストは応募期間ではありません。'
                f'現在のフェーズ: {current_phase} '
                f'(開始: {contest.start_at}, 終了: {contest.end_at})'
            )
            # 開発環境では警告のみ、本番環境ではエラー
            if not settings.DEBUG:
                raise serializers.ValidationError(error_msg)
            # DEBUGモードでは警告を出すが続行
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f'[DEV] {error_msg}')
        
        # 応募数制限チェック
        user_entries = Entry.objects.filter(
            contest=contest,
            author=request.user
        ).count()
        if user_entries >= contest.max_entries_per_user:
            raise serializers.ValidationError(
                f'このコンテストへの応募は最大{contest.max_entries_per_user}件までです。'
            )
        
        # 画像数チェック
        images = data.get('images', [])
        if len(images) > contest.max_images_per_entry:
            raise serializers.ValidationError(
                f'画像は最大{contest.max_images_per_entry}枚までアップロードできます。'
            )
        
        # 画像の重複チェック
        for image in images:
            image_hash = self._calculate_image_hash(image)
            # 同じハッシュ値の画像が既に存在するかチェック
            existing_image = EntryImage.objects.filter(image_hash=image_hash).first()
            if existing_image:
                # 既存の画像のエントリー情報を取得
                existing_entry = existing_image.entry
                raise serializers.ValidationError(
                    f'この画像は既に投稿されています。'
                    f'（エントリー: "{existing_entry.title}"）'
                )
        
        return data
    
    def create(self, validated_data):
        from django.conf import settings
        images = validated_data.pop('images')
        
        # 開発環境では自動承認、本番環境では手動承認
        auto_approve = settings.DEBUG
        
        entry = Entry.objects.create(
            **validated_data,
            author=self.context['request'].user,
            approved=auto_approve
        )
        
        # 画像を作成（ハッシュ値も保存）
        for idx, img in enumerate(images):
            image_hash = self._calculate_image_hash(img)
            EntryImage.objects.create(
                entry=entry, 
                image=img, 
                order=idx,
                image_hash=image_hash
            )
        
        # Celeryタスクで画像処理をキック（後で実装）
        # from .tasks import process_entry_images
        # process_entry_images.delay(entry.id)
        
        return entry
    
    def to_representation(self, instance):
        """作成後のレスポンスに詳細情報を含める"""
        return {
            'id': str(instance.id),
            'contest': instance.contest.slug,
            'title': instance.title,
            'description': instance.description,
            'tags': instance.tags,
            'approved': instance.approved,
            'created_at': instance.created_at.isoformat(),
        }


class VoteSerializer(serializers.ModelSerializer):
    """投票シリアライザー"""
    
    class Meta:
        model = Vote
        fields = ('id', 'entry', 'user', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class JudgeScoreSerializer(serializers.ModelSerializer):
    """審査員スコアシリアライザー"""
    judge = UserSerializer(read_only=True)
    
    class Meta:
        model = JudgeScore
        fields = ('id', 'entry', 'judge', 'score', 'comment', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'judge', 'created_at', 'updated_at')


class FlagSerializer(serializers.ModelSerializer):
    """通報シリアライザー"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Flag
        fields = ('id', 'entry', 'user', 'reason', 'resolved', 'created_at')
        read_only_fields = ('id', 'user', 'resolved', 'created_at')

