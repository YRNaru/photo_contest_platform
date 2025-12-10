# Generated manually

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("contest", "0002_entryimage_image_hash"),
    ]

    operations = [
        migrations.AddField(
            model_name="contest",
            name="creator",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="created_contests",
                to=settings.AUTH_USER_MODEL,
                verbose_name="作成者",
            ),
        ),
    ]
