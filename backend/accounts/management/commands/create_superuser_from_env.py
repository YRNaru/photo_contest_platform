"""
環境変数からスーパーユーザーを作成する管理コマンド
"""

import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create a superuser from environment variables"

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD "
                    "environment variables are not set. Skipping superuser creation."
                )
            )
            return

        # 既に存在する場合はスキップ
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"Superuser with email {email} already exists. Skipping."))
            return

        # スーパーユーザーを作成
        User.objects.create_superuser(
            email=email,
            username=username,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created superuser: {email}"))
