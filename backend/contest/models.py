import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Contest(models.Model):
    """コンテストモデル"""

    JUDGING_TYPE_CHOICES = [
        ("vote", "投票方式"),
        ("score", "点数方式"),
    ]

    slug = models.SlugField(unique=True, verbose_name="スラッグ")
    title = models.CharField(max_length=200, verbose_name="タイトル")
    description = models.TextField(blank=True, verbose_name="説明")
    banner_image = models.ImageField(upload_to="contests/banners/", blank=True, null=True, verbose_name="バナー画像")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_contests",
        verbose_name="作成者",
        null=True,
        blank=True,
    )
    judges = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="judging_contests",
        blank=True,
        verbose_name="審査員",
    )
    start_at = models.DateTimeField(verbose_name="開始日時")
    end_at = models.DateTimeField(verbose_name="終了日時")
    voting_end_at = models.DateTimeField(null=True, blank=True, verbose_name="投票終了日時")
    is_public = models.BooleanField(default=True, verbose_name="公開")
    max_entries_per_user = models.IntegerField(default=1, verbose_name="ユーザーあたり最大応募数")
    max_images_per_entry = models.IntegerField(default=5, verbose_name="エントリーあたり最大画像数")

    # 審査方式設定
    judging_type = models.CharField(
        max_length=20,
        choices=JUDGING_TYPE_CHOICES,
        default="vote",
        verbose_name="審査方式",
        help_text="投票方式または点数方式を選択",
    )
    max_votes_per_judge = models.IntegerField(
        default=3, verbose_name="審査員あたり最大投票数", help_text="投票方式の場合のみ有効。各審査員が投票できる作品数"
    )

    # 承認設定
    auto_approve_entries = models.BooleanField(
        default=False, verbose_name="投稿の自動承認", help_text="有効にすると、投稿が自動的に承認されます"
    )

    # Twitter自動取得設定
    twitter_hashtag = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Twitterハッシュタグ",
        help_text="例: フォトコンテスト (# は不要)",
    )
    twitter_auto_fetch = models.BooleanField(default=False, verbose_name="Twitter自動取得")
    twitter_auto_approve = models.BooleanField(default=False, verbose_name="Twitter投稿の自動承認")
    twitter_last_fetch = models.DateTimeField(null=True, blank=True, verbose_name="最終取得日時")

    # Twitter連携必須設定
    require_twitter_account = models.BooleanField(
        default=False,
        verbose_name="Twitter連携必須",
        help_text="有効にすると、投稿にはTwitterアカウント連携が必須になります",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "コンテスト"
        verbose_name_plural = "コンテスト"
        ordering = ["-start_at"]

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
        ("manual", "手動投稿"),
        ("twitter", "Twitter自動取得"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name="entries", verbose_name="コンテスト")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="entries",
        verbose_name="投稿者",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=200, verbose_name="タイトル")
    description = models.TextField(blank=True, verbose_name="説明")
    tags = models.CharField(max_length=500, blank=True, verbose_name="タグ", help_text="カンマ区切り")

    # Twitter連携フィールド
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual", verbose_name="投稿元")
    twitter_tweet_id = models.CharField(max_length=100, blank=True, null=True, unique=True, verbose_name="ツイートID")
    twitter_user_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="TwitterユーザーID")
    twitter_username = models.CharField(max_length=100, blank=True, null=True, verbose_name="Twitterユーザー名")
    twitter_url = models.URLField(blank=True, null=True, verbose_name="ツイートURL")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved = models.BooleanField(default=False, verbose_name="承認済み")
    flagged = models.BooleanField(default=False, verbose_name="フラグ")
    flag_reason = models.TextField(blank=True, verbose_name="フラグ理由")
    view_count = models.IntegerField(default=0, verbose_name="閲覧数")

    class Meta:
        verbose_name = "エントリー"
        verbose_name_plural = "エントリー"
        ordering = ["-created_at"]

    def __str__(self):
        if self.author:
            return f"{self.title} - {self.author.username}"
        elif self.twitter_username:
            return f"{self.title} - @{self.twitter_username} (Twitter)"
        else:
            return f"{self.title} - (投稿者不明)"

    def vote_count(self):
        """投票数を返す"""
        return self.votes.count()

    def average_score(self):
        """平均スコアを返す"""
        scores = self.scores.all()
        if not scores:
            return None
        return sum(float(s.total_score) for s in scores) / len(scores)


class Category(models.Model):
    """賞モデル - コンテストの賞を管理（エントリーは賞に紐づかず、審査時に各賞ごとに投票）"""

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name="categories",
        verbose_name="コンテスト",
    )
    name = models.CharField(max_length=100, verbose_name="賞名", help_text="例: グランプリ、風景賞、人物賞、技術賞")
    description = models.TextField(blank=True, verbose_name="説明")
    order = models.IntegerField(default=0, verbose_name="表示順")
    max_votes_per_judge = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="審査員あたり最大投票数",
        help_text=("この賞での審査員の最大投票数。" "未設定の場合はコンテストの設定を使用"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "賞"
        verbose_name_plural = "賞"
        ordering = ["order", "created_at"]
        unique_together = ("contest", "name")

    def __str__(self):
        return f"{self.contest.title} - {self.name}"

    def get_max_votes(self):
        """この賞の最大投票数を取得（未設定の場合はコンテストの設定）"""
        return self.max_votes_per_judge if self.max_votes_per_judge is not None else self.contest.max_votes_per_judge


class EntryImage(models.Model):
    """エントリー画像モデル"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="images", verbose_name="エントリー")
    image = models.ImageField(upload_to="entries/%Y/%m/%d/", verbose_name="画像")
    thumbnail = models.ImageField(
        upload_to="entries/thumbs/%Y/%m/%d/",
        blank=True,
        null=True,
        verbose_name="サムネイル",
    )
    width = models.IntegerField(null=True, blank=True, verbose_name="幅")
    height = models.IntegerField(null=True, blank=True, verbose_name="高さ")
    is_thumbnail_ready = models.BooleanField(default=False, verbose_name="サムネイル生成済み")
    order = models.IntegerField(default=0, verbose_name="表示順")
    image_hash = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name="画像ハッシュ",
        db_index=True,
        help_text="SHA256ハッシュ値（重複チェック用）",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "エントリー画像"
        verbose_name_plural = "エントリー画像"
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"{self.entry.title} - 画像 {self.order}"


class Vote(models.Model):
    """投票モデル - 投票方式用"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="votes", verbose_name="エントリー")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="votes",
        verbose_name="部門",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="votes",
        verbose_name="ユーザー",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "投票"
        verbose_name_plural = "投票"
        unique_together = ("entry", "user", "category")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "user"]),
            models.Index(fields=["entry", "category"]),
        ]

    def __str__(self):
        user_name = self.user.username if self.user else "(ユーザー不明)"
        entry_title = self.entry.title if self.entry else "(エントリー不明)"
        category_name = self.category.name if self.category else "全体"
        return f"{user_name} → {entry_title} ({category_name})"


class JudgingCriteria(models.Model):
    """審査基準モデル - 点数方式で使用する評価項目"""

    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name="judging_criteria",
        verbose_name="コンテスト",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="judging_criteria",
        verbose_name="部門",
        null=True,
        blank=True,
        help_text="部門固有の基準。未設定の場合は全部門共通",
    )
    name = models.CharField(max_length=100, verbose_name="評価項目名", help_text="例: 構図、色彩、独創性")
    description = models.TextField(blank=True, verbose_name="説明")
    max_score = models.IntegerField(default=10, verbose_name="最大点数", help_text="この項目の最大点数")
    order = models.IntegerField(default=0, verbose_name="表示順")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "審査基準"
        verbose_name_plural = "審査基準"
        ordering = ["order", "created_at"]

    def __str__(self):
        contest_name = f"{self.contest.title}"
        category_name = f" - {self.category.name}" if self.category else ""
        return f"{contest_name}{category_name}: {self.name} " f"(最大{self.max_score}点)"


class JudgeScore(models.Model):
    """審査員スコアモデル - 点数方式用（総合スコア）"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="scores", verbose_name="エントリー")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="scores",
        verbose_name="部門",
        null=True,
        blank=True,
    )
    judge = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="judge_scores",
        verbose_name="審査員",
    )
    total_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        verbose_name="総合点",
        help_text="各評価項目の合計点",
    )
    comment = models.TextField(blank=True, verbose_name="総評コメント")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "審査員スコア"
        verbose_name_plural = "審査員スコア"
        unique_together = ("entry", "judge", "category")
        ordering = ["-total_score", "-created_at"]
        indexes = [
            models.Index(fields=["category", "judge"]),
            models.Index(fields=["entry", "category"]),
        ]

    def __str__(self):
        judge_name = self.judge.username if self.judge else "(審査員不明)"
        entry_title = self.entry.title if self.entry else "(エントリー不明)"
        category_name = f" ({self.category.name})" if self.category else ""
        return f"{judge_name} → {entry_title}{category_name}: " f"{self.total_score}点"

    def calculate_total_score(self):
        """詳細スコアから総合点を計算"""
        detailed_scores = self.detailed_scores.all()
        self.total_score = sum(ds.score for ds in detailed_scores)
        self.save()
        return self.total_score


class DetailedScore(models.Model):
    """詳細スコアモデル - 各審査基準に対する点数"""

    judge_score = models.ForeignKey(
        JudgeScore,
        on_delete=models.CASCADE,
        related_name="detailed_scores",
        verbose_name="審査員スコア",
    )
    criteria = models.ForeignKey(
        JudgingCriteria,
        on_delete=models.CASCADE,
        related_name="detailed_scores",
        verbose_name="審査基準",
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="点数", help_text="この評価項目の点数")
    comment = models.TextField(blank=True, verbose_name="コメント")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "詳細スコア"
        verbose_name_plural = "詳細スコア"
        unique_together = ("judge_score", "criteria")
        ordering = ["criteria__order"]

    def __str__(self):
        return f"{self.judge_score} - {self.criteria.name}: {self.score}点"

    def save(self, *args, **kwargs):
        """保存時にスコアの妥当性をチェック"""
        if self.score > self.criteria.max_score:
            raise ValueError(f"スコアは最大{self.criteria.max_score}点を" "超えることはできません")
        if self.score < 0:
            raise ValueError("スコアは0点未満にはできません")
        super().save(*args, **kwargs)
        # 総合点を再計算
        self.judge_score.calculate_total_score()


class Flag(models.Model):
    """通報モデル"""

    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name="flags", verbose_name="エントリー")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flags",
        verbose_name="通報者",
    )
    reason = models.TextField(verbose_name="理由")
    resolved = models.BooleanField(default=False, verbose_name="解決済み")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "通報"
        verbose_name_plural = "通報"
        ordering = ["-created_at"]

    def __str__(self):
        user_name = self.user.username if self.user else "(ユーザー不明)"
        entry_title = self.entry.title if self.entry else "(エントリー不明)"
        return f"{user_name} -> {entry_title}"
