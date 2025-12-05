#!/usr/bin/env python
"""利用可能なソーシャルアカウントプロバイダーを確認"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from allauth.socialaccount import providers

print("=" * 60)
print("利用可能なソーシャルアカウントプロバイダー")
print("=" * 60)

registry = providers.registry.get_class_list()

for provider_class in registry:
    provider_id = provider_class.id
    provider_name = provider_class.name
    print(f"ID: {provider_id:25s} Name: {provider_name}")

print("\n" + "=" * 60)
print("Django管理画面で使用する値:")
print("=" * 60)
print("Twitter OAuth2を使用する場合:")
print("  Provider: twitter_oauth2")
print("\nGoogleを使用する場合:")
print("  Provider: google")
