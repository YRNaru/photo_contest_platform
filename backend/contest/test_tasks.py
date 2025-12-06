"""Celeryタスクのテスト"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, Mock, MagicMock
from .models import Contest, Entry, EntryImage
from .tasks import (
    process_entry_images, 
    generate_thumbnail, 
    moderate_image, 
    cleanup_old_thumbnails,
    fetch_twitter_entries
)
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


def create_test_image():
    """テスト用画像を作成"""
    file = BytesIO()
    image = Image.new('RGB', (200, 200), color='blue')
    image.save(file, 'PNG')
    file.seek(0)
    return SimpleUploadedFile('test.png', file.read(), content_type='image/png')


class ProcessEntryImagesTaskTest(TestCase):
    """process_entry_imagesタスクのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

    @patch('contest.tasks.generate_thumbnail.delay')
    def test_process_entry_images_success(self, mock_generate):
        """エントリー画像処理の成功ケース"""
        entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title='Test Entry',
            approved=True
        )
        
        # 画像を追加
        EntryImage.objects.create(
            entry=entry,
            image=create_test_image(),
            order=0
        )
        EntryImage.objects.create(
            entry=entry,
            image=create_test_image(),
            order=1
        )
        
        # タスクを実行
        process_entry_images(str(entry.id))
        
        # generate_thumbnailが各画像に対して呼ばれたことを確認
        self.assertEqual(mock_generate.call_count, 2)

    def test_process_entry_images_entry_not_found(self):
        """存在しないエントリーIDの場合"""
        # 存在しないIDで実行
        process_entry_images('99999999-9999-9999-9999-999999999999')
        # エラーログが出るが例外は発生しない
        self.assertTrue(True)


class GenerateThumbnailTaskTest(TestCase):
    """generate_thumbnailタスクのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title='Test Entry',
            approved=True
        )

    @patch('contest.tasks.moderate_image.delay')
    def test_generate_thumbnail_success(self, mock_moderate):
        """サムネイル生成の成功ケース"""
        entry_image = EntryImage.objects.create(
            entry=self.entry,
            image=create_test_image(),
            order=0
        )
        
        # タスクを実行
        generate_thumbnail(entry_image.id)
        
        # サムネイルが生成されたことを確認
        entry_image.refresh_from_db()
        self.assertTrue(entry_image.is_thumbnail_ready)
        self.assertIsNotNone(entry_image.width)
        self.assertIsNotNone(entry_image.height)
        
        # moderate_imageが呼ばれたことを確認
        mock_moderate.assert_called_once_with(entry_image.id)

    def test_generate_thumbnail_image_not_found(self):
        """存在しない画像IDの場合"""
        # 存在しないIDで実行
        generate_thumbnail(999999)
        # エラーログが出るが例外は発生しない
        self.assertTrue(True)

    @patch('contest.tasks.moderate_image.delay')
    def test_generate_thumbnail_handles_error(self, mock_moderate):
        """サムネイル生成中のエラーハンドリング"""
        entry_image = EntryImage.objects.create(
            entry=self.entry,
            image=create_test_image(),
            order=0
        )
        
        # 画像を削除してエラーを発生させる
        entry_image.image.delete()
        
        # タスクを実行（エラーが発生するがキャッチされる）
        generate_thumbnail(entry_image.id)
        
        # エラーログが出るが例外は発生しない
        self.assertTrue(True)


class ModerateImageTaskTest(TestCase):
    """moderate_imageタスクのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title='Test Entry',
            approved=True
        )

    def test_moderate_image_success(self):
        """画像モデレーションの成功ケース"""
        entry_image = EntryImage.objects.create(
            entry=self.entry,
            image=create_test_image(),
            order=0
        )
        
        # タスクを実行
        moderate_image(entry_image.id)
        
        # エラーが発生しないことを確認
        self.assertTrue(True)

    def test_moderate_image_not_found(self):
        """存在しない画像IDの場合"""
        # 存在しないIDで実行
        moderate_image(999999)
        # エラーログが出るが例外は発生しない
        self.assertTrue(True)

    def test_moderate_image_exception_handling(self):
        """モデレーション中の例外ハンドリング"""
        entry_image = EntryImage.objects.create(
            entry=self.entry,
            image=create_test_image(),
            order=0
        )
        
        # 画像を削除してエラーを発生させる
        entry_image.image.delete()
        
        # タスクを実行
        moderate_image(entry_image.id)
        
        # 例外がキャッチされることを確認
        self.assertTrue(True)


class FetchTwitterEntriesTaskTest(TestCase):
    """fetch_twitter_entriesタスクのテスト"""

    @patch('contest.twitter_integration.fetch_all_active_contests')
    def test_fetch_twitter_entries_success(self, mock_fetch):
        """Twitter取得の成功ケース"""
        mock_fetch.return_value = {'fetched': 10, 'created': 5}
        
        result = fetch_twitter_entries()
        
        self.assertEqual(result, {'fetched': 10, 'created': 5})
        mock_fetch.assert_called_once()

    @patch('contest.twitter_integration.fetch_all_active_contests')
    def test_fetch_twitter_entries_error(self, mock_fetch):
        """Twitter取得のエラーケース"""
        mock_fetch.side_effect = Exception('API Error')
        
        result = fetch_twitter_entries()
        
        # エラーが発生しても空辞書が返る
        self.assertEqual(result, {})


class CleanupOldThumbnailsTaskTest(TestCase):
    """cleanup_old_thumbnailsタスクのテスト"""

    def test_cleanup_old_thumbnails(self):
        """古いサムネイルクリーンアップタスク"""
        # タスクを実行（現在は未実装なのでpassのみ）
        result = cleanup_old_thumbnails()
        
        # Noneが返ることを確認
        self.assertIsNone(result)

