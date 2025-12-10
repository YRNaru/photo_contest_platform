# Generated manually

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("contest", "0003_contest_creator"),
    ]

    operations = [
        migrations.AddField(
            model_name="contest",
            name="judges",
            field=models.ManyToManyField(
                blank=True,
                related_name="judging_contests",
                to=settings.AUTH_USER_MODEL,
                verbose_name="審査員",
            ),
        ),
    ]
