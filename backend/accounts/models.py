from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """カスタムユーザーモデル"""
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    is_judge = models.BooleanField(default=False, verbose_name='審査員')
    is_moderator = models.BooleanField(default=False, verbose_name='モデレーター')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'ユーザー'
        verbose_name_plural = 'ユーザー'

    def __str__(self):
        return self.email

