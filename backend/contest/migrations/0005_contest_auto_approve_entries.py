# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contest", "0004_contest_judges"),
    ]

    operations = [
        migrations.AddField(
            model_name="contest",
            name="auto_approve_entries",
            field=models.BooleanField(
                default=False, help_text="有効にすると、投稿が自動的に承認されます", verbose_name="投稿の自動承認"
            ),
        ),
    ]
