from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'is_judge', 'is_moderator', 'is_staff', 'created_at')
    list_filter = ('is_judge', 'is_moderator', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('カスタムフィールド', {
            'fields': ('avatar_url', 'is_judge', 'is_moderator'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('カスタムフィールド', {
            'fields': ('email', 'avatar_url', 'is_judge', 'is_moderator'),
        }),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

