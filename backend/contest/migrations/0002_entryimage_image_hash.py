# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contest', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='entryimage',
            name='image_hash',
            field=models.CharField(blank=True, db_index=True, help_text='SHA256ハッシュ値（重複チェック用）', max_length=64, null=True, verbose_name='画像ハッシュ'),
        ),
    ]
