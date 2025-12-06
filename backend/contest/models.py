from django.conf import settings
from django.db import models
from django.utils import timezone
import uuid


class Contest(models.Model):
    """コンテストモデル"""
    slug = models.SlugField(unique=True, verbose_name='スラッグ')
    title = models.CharField(max_length=200, verbose_name='タイトル')
    description = models.TextField(blank=True, verbose_name='説明')
    banner_image = models.ImageField(upload_to='contests/banners/', blank=True, null=True, verbose_name='バナー画像')
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_contests', verbose_name='作成者', null=True, blank=True)
    start_at = models.DateTimeField(verbose_name='開始日時')
    end_at = models.DateTimeField(verbose_name='終了日時')
    voting_end_at = models.DateTimeField(null=True, blank=True, verbose_name='投票終了日時')
    is_public = models.BooleanField(default=True, verbose_name='公開')
    max_entries_per_user = models.IntegerField(default=1, verbose_name='ユーザーあたり最大応募数')
    max_images_per_entry = models.IntegerField(default=5, verbose_name='エントリーあたり最大画像数')
    
    # Twitter自動取得設定
    twitter_hashtag = models.CharField(max_length=100, blank=True, verbose_name='Twitterハッシュタグ', help_text='例: フォトコンテスト (# は不要)')
    twitter_auto_fetch = models.BooleanField(default=False, verbose_name='Twitter自動取得')
    twitter_auto_approve = models.BooleanField(default=False, verbose_name='Twitter投稿の自動承認')
    twitter_last_fetch = models.DateTimeField(null=True, blank=True, verbose_name='最終取得日時')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'コンテスト'
        verbose_name_plural = 'コンテスト'
        ordering = ['-start_at']

    def __str__(self):
        return self.title

    def phase(self):
        """現在のフェーズを返す"""
        now = timezone.now()
        if now < self.start_at:
            return "upcoming"
        if self.start_at <= now <= self.end_at:
            return "submission"
        if self.voting_end_at and self.end_at < now <= self.voting_end_at:
            return "voting"
        return "closed"


class Entry(models.Model):
    """エントリーモデル"""
    
    SOURCE_CHOICES = [
        ('manual', '手動投稿'),
        ('twitter', 'Twitter自動取得'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name="entries", verbose_name='コンテスト')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="entries", verbose_name='投稿者', null=True, blank=True)
    title = models.CharField(max_length=200, verbose_name='タイトル')
    description = models.TextField(blank=True, verbose_name='説明')
    tags = models.CharField(max_length=500, blank=True, verbose_name='タグ', help_text='カンマ区切り')
    
    # Twitter連携フィールド
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual', verbose_name='投稿元')
    twitter_tweet_id = models.CharField(max_length=100, blank=True, null=True, unique=True, verbose_name='ツイートID')
    twitter_user_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='TwitterユーザーID')
    twitter_username = models.CharField(max_length=100, blank=True, null=True, verbose_name='Twitterユーザー名')
    twitter_url = models.URLField(blank=True, null=True, verbose_name='ツイートURL')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved = models.BooleanField(default=False, verbose_name='承認済み')
    flagged = models.BooleanField(default=False, verbose_name='フラグ')
    flag_reason = models.TextField(blank=True, verbose_name='フラグ理由')
    view_count = models.IntegerField(default=0, verbose_name='閲覧数')

    class Meta:
        verbose_name = 'エントリー'
        verbose_name_plural = 'エントリー'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.author.username}"

    def vote_count(self):
        """投票数を返す"""
        return self.votes.count()

    def average_score(self):
        """平均スコアを返す"""
        scores = self.scores.all()
        if not scores:
            return None
        return sum(s.score for s in scores) / len(scores)


class EntryImage(models.Model):
    """エントリー画像モデル"""
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="images", verbose_name='エントリー')
    image = models.ImageField(upload_to="entries/%Y/%m/%d/", verbose_name='画像')
    thumbnail = models.ImageField(upload_to="entries/thumbs/%Y/%m/%d/", blank=True, null=True, verbose_name='サムネイル')
    width = models.IntegerField(null=True, blank=True, verbose_name='幅')
    height = models.IntegerField(null=True, blank=True, verbose_name='高さ')
    is_thumbnail_ready = models.BooleanField(default=False, verbose_name='サムネイル生成済み')
    order = models.IntegerField(default=0, verbose_name='表示順')
    image_hash = models.CharField(max_length=64, blank=True, null=True, verbose_name='画像ハッシュ', db_index=True, help_text='SHA256ハッシュ値（重複チェック用）')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'エントリー画像'
        verbose_name_plural = 'エントリー画像'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.entry.title} - 画像 {self.order}"


class Vote(models.Model):
    """投票モデル"""
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="votes", verbose_name='エントリー')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="votes", verbose_name='ユーザー')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '投票'
        verbose_name_plural = '投票'
        unique_together = ("entry", "user")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} -> {self.entry.title}"


class JudgeScore(models.Model):
    """審査員スコアモデル"""
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="scores", verbose_name='エントリー')
    judge = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="judge_scores", verbose_name='審査員')
    score = models.IntegerField(verbose_name='スコア', help_text='0-100')
    comment = models.TextField(blank=True, verbose_name='コメント')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '審査員スコア'
        verbose_name_plural = '審査員スコア'
        unique_together = ("entry", "judge")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.judge.username} -> {self.entry.title}: {self.score}"


class Flag(models.Model):
    """通報モデル"""
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="flags", verbose_name='エントリー')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flags", verbose_name='通報者')
    reason = models.TextField(verbose_name='理由')
    resolved = models.BooleanField(default=False, verbose_name='解決済み')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = '通報'
        verbose_name_plural = '通報'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} -> {self.entry.title}"

