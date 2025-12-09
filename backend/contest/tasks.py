"""
Celeryタスク - 画像処理とモデレーション
"""
from celery import shared_task
from PIL import Image
from django.core.files.base import ContentFile
from .models import Entry, EntryImage
import io
import logging

logger = logging.getLogger(__name__)


@shared_task
def process_entry_images(entry_id):
    """エントリーの画像を処理"""
    try:
        entry = Entry.objects.get(pk=entry_id)
        for image in entry.images.all():
            generate_thumbnail.delay(image.id)
        logger.info(f"Started processing images for entry {entry_id}")
    except Entry.DoesNotExist:
        logger.error(f"Entry {entry_id} not found")


@shared_task
def generate_thumbnail(entry_image_id):
    """サムネイル生成"""
    try:
        img_obj = EntryImage.objects.get(pk=entry_image_id)

        with img_obj.image.open('rb') as f:
            img = Image.open(f)

            # 画像サイズを保存
            img_obj.width = img.width
            img_obj.height = img.height

            # サムネイル生成
            img.thumbnail((800, 800), Image.Resampling.LANCZOS)

            # WebP形式で保存
            buf = io.BytesIO()
            img.save(buf, format="WEBP", quality=85)
            buf.seek(0)

            # ファイル名を生成
            thumb_name = (
                f"{img_obj.image.name.split('/')[-1].split('.')[0]}"
                f"_thumb.webp"
            )
            img_obj.thumbnail.save(
                thumb_name, ContentFile(buf.read()), save=False
            )

            img_obj.is_thumbnail_ready = True
            img_obj.save()

        logger.info(f"Generated thumbnail for image {entry_image_id}")

        # モデレーションタスクをキック
        moderate_image.delay(entry_image_id)

    except EntryImage.DoesNotExist:
        logger.error(f"EntryImage {entry_image_id} not found")
    except Exception as e:
        logger.error(
            f"Error generating thumbnail for image {entry_image_id}: "
            f"{str(e)}"
        )


@shared_task
def moderate_image(entry_image_id):
    """画像モデレーション（外部API連携）"""
    try:
        EntryImage.objects.get(pk=entry_image_id)  # noqa: F841

        # TODO: 外部モデレーションAPI（Google Vision, AWS Rekognition等）
        # を呼び出す
        # ここでは仮実装

        # 例: Google Vision SafeSearch API
        # from google.cloud import vision
        # client = vision.ImageAnnotatorClient()
        # response = client.safe_search_detection(image=...)
        # if response.safe_search_annotation.adult >= 4:
        #     entry.flagged = True
        #     entry.flag_reason = "Inappropriate content detected"
        #     entry.save()

        logger.info(f"Moderation completed for image {entry_image_id}")

    except EntryImage.DoesNotExist:
        logger.error(f"EntryImage {entry_image_id} not found")
    except Exception as e:
        logger.error(
            f"Error moderating image {entry_image_id}: {str(e)}"
        )


@shared_task
def cleanup_old_thumbnails():
    """古いサムネイルのクリーンアップ（定期実行）"""
    # TODO: 実装
    pass


@shared_task
def fetch_twitter_entries():
    """
    Twitterから投稿を取得してエントリーを作成（定期実行）
    """
    from .twitter_integration import fetch_all_active_contests

    try:
        results = fetch_all_active_contests()
        logger.info(f"Twitter fetch completed: {results}")
        return results
    except Exception as e:
        logger.error(f"Error in fetch_twitter_entries task: {str(e)}")
        return {}
