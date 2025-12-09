from django.contrib import admin
from .models import (
    Contest, Entry, EntryImage, Vote, JudgeScore, Flag,
    Category, EntryCategoryAssignment, JudgingCriteria, DetailedScore
)


class EntryImageInline(admin.TabularInline):
    model = EntryImage
    extra = 1
    readonly_fields = ('width', 'height', 'is_thumbnail_ready', 'created_at')


@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'slug', 'judging_type', 'start_at',
        'end_at', 'is_public', 'twitter_auto_fetch', 'created_at'
    )
    list_filter = (
        'is_public', 'judging_type',
        'twitter_auto_fetch', 'start_at', 'end_at'
    )
    search_fields = ('title', 'slug', 'description', 'twitter_hashtag')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'start_at'
    filter_horizontal = ('judges',)
    fieldsets = (
        ('基本情報', {
            'fields': (
                'slug', 'title', 'description',
                'banner_image', 'is_public', 'creator', 'judges'
            )
        }),
        ('審査設定', {
            'fields': ('judging_type', 'max_votes_per_judge')
        }),
        ('期間設定', {
            'fields': ('start_at', 'end_at', 'voting_end_at')
        }),
        ('応募設定', {
            'fields': (
                'max_entries_per_user', 'max_images_per_entry',
                'auto_approve_entries', 'require_twitter_account'
            )
        }),
        ('Twitter連携', {
            'fields': (
                'twitter_hashtag', 'twitter_auto_fetch',
                'twitter_auto_approve', 'twitter_last_fetch'
            ),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('twitter_last_fetch',)
    actions = ['fetch_twitter_now']

    def fetch_twitter_now(self, request, queryset):
        """選択したコンテストのTwitter投稿を今すぐ取得"""
        from .twitter_integration import TwitterFetcher
        fetcher = TwitterFetcher()
        total = 0
        for contest in queryset:
            if contest.twitter_auto_fetch and contest.twitter_hashtag:
                count = fetcher.fetch_and_create_entries(contest)
                total += count
        self.message_user(request, f'{total}件のエントリーを取得しました')
    fetch_twitter_now.short_description = '選択したコンテストのTwitter投稿を取得'


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_author_display', 'contest', 'source', 'approved', 'flagged', 'vote_count', 'created_at')
    list_filter = ('approved', 'flagged', 'source', 'contest', 'created_at')
    search_fields = ('title', 'description', 'author__username', 'author__email', 'twitter_username')
    readonly_fields = ('id', 'view_count', 'created_at', 'updated_at', 'twitter_tweet_id', 'twitter_user_id', 'twitter_url')
    inlines = [EntryImageInline]
    actions = ['approve_entries', 'reject_entries']
    fieldsets = (
        ('基本情報', {
            'fields': ('id', 'contest', 'author', 'title', 'description', 'tags')
        }),
        ('ステータス', {
            'fields': ('approved', 'flagged', 'flag_reason', 'view_count')
        }),
        ('Twitter情報', {
            'fields': ('source', 'twitter_tweet_id', 'twitter_user_id', 'twitter_username', 'twitter_url'),
            'classes': ('collapse',),
        }),
        ('タイムスタンプ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_author_display(self, obj):
        """投稿者の表示名を取得"""
        if obj.author:
            return obj.author.username
        elif obj.twitter_username:
            return f"@{obj.twitter_username} (Twitter)"
        else:
            return "(投稿者不明)"
    get_author_display.short_description = '投稿者'

    def approve_entries(self, request, queryset):
        queryset.update(approved=True, flagged=False)
    approve_entries.short_description = '選択したエントリーを承認'

    def reject_entries(self, request, queryset):
        queryset.update(approved=False)
    reject_entries.short_description = '選択したエントリーを非承認'


@admin.register(EntryImage)
class EntryImageAdmin(admin.ModelAdmin):
    list_display = ('entry', 'order', 'width', 'height', 'is_thumbnail_ready', 'created_at')
    list_filter = ('is_thumbnail_ready', 'created_at')
    search_fields = ('entry__title',)
    readonly_fields = ('width', 'height', 'is_thumbnail_ready', 'created_at')


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'entry', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('user__username', 'user__email', 'entry__title')
    readonly_fields = ('created_at',)


@admin.register(JudgeScore)
class JudgeScoreAdmin(admin.ModelAdmin):
    list_display = ('judge', 'entry', 'category', 'total_score', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('judge__username', 'entry__title', 'comment')
    readonly_fields = ('total_score', 'created_at', 'updated_at')


@admin.register(Flag)
class FlagAdmin(admin.ModelAdmin):
    list_display = ('user', 'entry', 'resolved', 'created_at')
    list_filter = ('resolved', 'created_at')
    search_fields = ('user__username', 'entry__title', 'reason')
    readonly_fields = ('created_at',)
    actions = ['mark_resolved']

    def mark_resolved(self, request, queryset):
        queryset.update(resolved=True)
    mark_resolved.short_description = '選択した通報を解決済みにする'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'contest', 'order',
        'max_votes_per_judge', 'created_at'
    )
    list_filter = ('contest', 'created_at')
    search_fields = ('name', 'description', 'contest__title')
    ordering = ('contest', 'order')


@admin.register(EntryCategoryAssignment)
class EntryCategoryAssignmentAdmin(admin.ModelAdmin):
    list_display = ('entry', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('entry__title', 'category__name')


@admin.register(JudgingCriteria)
class JudgingCriteriaAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'contest', 'category',
        'max_score', 'order', 'created_at'
    )
    list_filter = ('contest', 'category', 'created_at')
    search_fields = ('name', 'description', 'contest__title')
    ordering = ('contest', 'category', 'order')


@admin.register(DetailedScore)
class DetailedScoreAdmin(admin.ModelAdmin):
    list_display = (
        'judge_score', 'criteria', 'score', 'created_at'
    )
    list_filter = ('criteria', 'created_at')
    search_fields = (
        'judge_score__judge__username',
        'criteria__name', 'comment'
    )
    readonly_fields = ('created_at', 'updated_at')
