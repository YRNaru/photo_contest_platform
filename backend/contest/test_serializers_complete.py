from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from django.utils import timezone
from datetime import timedelta
from .models import Contest, Entry, EntryImage
from .serializers import ContestCreateSerializer, EntryCreateSerializer
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
import hashlib

User = get_user_model()


def create_exact_test_image():
    """完全に同一のテスト画像を作成"""
    file = BytesIO()
    image = Image.new('RGB', (50, 50), color=(255, 0, 0))
    image.save(file, 'PNG')
    file.seek(0)
    return file.read()


class SerializerEdgeCaseTest(TestCase):
    """シリアライザーのエッジケーステスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.factory = APIRequestFactory()

    def test_voting_end_date_validation_with_instance_end_at(self):
        """投票終了日のバリデーション（インスタンスからend_atを取得）"""
        contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        
        # voting_end_atのみを更新（end_atはインスタンスから取得される）
        # 無効な値（end_atより前）
        serializer = ContestCreateSerializer(
            instance=contest,
            data={'voting_end_at': timezone.now() + timedelta(days=10)},
            partial=True
        )
        
        # end_atがインスタンスから取得され、バリデーションエラー
        is_valid = serializer.is_valid()
        self.assertFalse(is_valid)

    def test_voting_end_date_validation_needs_instance_end_at(self):
        """voting_end_atのバリデーションでインスタンスからend_atを取得"""
        contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        
        # voting_end_atのみを更新（end_atがdataにない場合、インスタンスから取得）
        serializer = ContestCreateSerializer(
            instance=contest,
            data={
                'voting_end_at': timezone.now() + timedelta(days=5),  # end_atより前
            },
            partial=True
        )
        
        # インスタンスのend_atが使用され、バリデーションエラー
        is_valid = serializer.is_valid()
        self.assertFalse(is_valid)
        
        # 正しい日付で再試行
        serializer2 = ContestCreateSerializer(
            instance=contest,
            data={
                'voting_end_at': timezone.now() + timedelta(days=45),  # end_atより後
            },
            partial=True
        )
        
        # 成功
        is_valid2 = serializer2.is_valid()
        self.assertTrue(is_valid2)

    def test_duplicate_image_exact_match(self):
        """完全に同一の画像での重複検出"""
        # 最初のコンテストとエントリーを作成
        contest1 = Contest.objects.create(
            slug='contest-1',
            title='Contest 1',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            max_entries_per_user=10,
        )
        
        # 同一画像データを作成
        exact_image_data = create_exact_test_image()
        image_hash = hashlib.sha256(exact_image_data).hexdigest()
        
        # 最初のエントリーを直接作成
        entry1 = Entry.objects.create(
            contest=contest1,
            author=self.user,
            title='First Entry',
            approved=True
        )
        
        # 画像を手動で作成（ハッシュ付き）
        EntryImage.objects.create(
            entry=entry1,
            image=SimpleUploadedFile('first.png', exact_image_data, content_type='image/png'),
            image_hash=image_hash,
            order=0
        )
        
        # 2番目のコンテストを作成
        contest2 = Contest.objects.create(
            slug='contest-2',
            title='Contest 2',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        
        # 別ユーザーを作成
        user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        
        # 同じ画像データで新規エントリーを試みる
        request = self.factory.post('/api/entries/')
        request.user = user2
        
        duplicate_image = SimpleUploadedFile(
            'duplicate.png',
            exact_image_data,
            content_type='image/png'
        )
        
        data = {
            'contest': contest2.slug,
            'title': 'Duplicate Entry',
            'images': [duplicate_image],
        }
        
        serializer = EntryCreateSerializer(data=data, context={'request': request})
        is_valid = serializer.is_valid()
        
        # 重複エラーが発生
        self.assertFalse(is_valid)
        
        # エラーメッセージに「既に投稿されています」と元のエントリー名が含まれる
        error_str = str(serializer.errors)
        self.assertIn('投稿', error_str)
        self.assertIn('First Entry', error_str)

    def test_image_max_limit_error_message(self):
        """画像枚数制限超過時の詳細エラーメッセージ"""
        contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            max_images_per_entry=3,  # 最大3枚
        )
        
        request = self.factory.post('/api/entries/')
        request.user = self.user
        
        # 4枚の画像（制限超過）
        images = []
        for i in range(4):
            img_data = create_exact_test_image()
            images.append(SimpleUploadedFile(f'img{i}.png', img_data, content_type='image/png'))
        
        data = {
            'contest': contest.slug,
            'title': 'Too Many Images',
            'images': images,
        }
        
        serializer = EntryCreateSerializer(data=data, context={'request': request})
        is_valid = serializer.is_valid()
        
        # バリデーションエラー
        self.assertFalse(is_valid)
        
        # エラーメッセージに最大枚数が含まれる
        error_str = str(serializer.errors)
        self.assertIn('最大3枚', error_str)

