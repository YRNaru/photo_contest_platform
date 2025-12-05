from rest_framework import serializers
from .models import Contest, Entry, EntryImage, Vote, JudgeScore, Flag
from accounts.serializers import UserSerializer


class EntryImageSerializer(serializers.ModelSerializer):
    """エントリー画像シリアライザー"""
    
    class Meta:
        model = EntryImage
        fields = ('id', 'image', 'thumbnail', 'width', 'height', 
                  'is_thumbnail_ready', 'order', 'created_at')
        read_only_fields = ('id', 'thumbnail', 'width', 'height', 
                           'is_thumbnail_ready', 'created_at')


class ContestListSerializer(serializers.ModelSerializer):
    """コンテスト一覧シリアライザー"""
    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ('slug', 'title', 'description', 'banner_image',
                  'start_at', 'end_at', 'voting_end_at', 'is_public',
                  'phase', 'entry_count', 'created_at')
    
    def get_phase(self, obj):
        return obj.phase()
    
    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()


class ContestDetailSerializer(serializers.ModelSerializer):
    """コンテスト詳細シリアライザー"""
    phase = serializers.SerializerMethodField()
    entry_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ('slug', 'title', 'description', 'banner_image',
                  'start_at', 'end_at', 'voting_end_at', 'is_public',
                  'max_entries_per_user', 'max_images_per_entry',
                  'phase', 'entry_count', 'created_at', 'updated_at')
    
    def get_phase(self, obj):
        return obj.phase()
    
    def get_entry_count(self, obj):
        return obj.entries.filter(approved=True).count()


class EntryListSerializer(serializers.ModelSerializer):
    """エントリー一覧シリアライザー"""
    author = UserSerializer(read_only=True)
    vote_count = serializers.IntegerField(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = Entry
        fields = ('id', 'contest', 'author', 'title', 'description', 
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
    
    class Meta:
        model = Entry
        fields = ('id', 'contest', 'author', 'title', 'description', 
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
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True,
        max_length=5
    )
    
    class Meta:
        model = Entry
        fields = ('contest', 'title', 'description', 'tags', 'images')
    
    def validate(self, data):
        contest = data.get('contest')
        request = self.context['request']
        
        # コンテストフェーズチェック
        if contest.phase() != 'submission':
            raise serializers.ValidationError('現在このコンテストは応募期間ではありません。')
        
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
        
        return data
    
    def create(self, validated_data):
        images = validated_data.pop('images')
        entry = Entry.objects.create(
            **validated_data,
            author=self.context['request'].user
        )
        
        # 画像を作成
        for idx, img in enumerate(images):
            EntryImage.objects.create(entry=entry, image=img, order=idx)
        
        # Celeryタスクで画像処理をキック（後で実装）
        # from .tasks import process_entry_images
        # process_entry_images.delay(entry.id)
        
        return entry


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

