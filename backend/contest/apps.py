from django.apps import AppConfig


class ContestConfig(AppConfig):
    default_auto_field: str = 'django.db.models.BigAutoField'
    name: str = 'contest'
    verbose_name: str = 'コンテスト'
