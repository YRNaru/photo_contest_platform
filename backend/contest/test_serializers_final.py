from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Contest
from .serializers import ContestCreateSerializer

User = get_user_model()


class SerializerCoverageCompleteTest(TestCase):
    """シリアライザーの100%カバレッジ達成テスト"""

    def test_voting_end_validation_with_missing_end_at_uses_instance(self):
        """voting_end_atのバリデーションでインスタンスのend_atを使用する分岐"""
        # コンテストを作成
        contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        
        # voting_end_atを設定するが、end_atはdataに含めない（インスタンスから取得される）
        # この時、行47-48の分岐がカバーされる
        serializer = ContestCreateSerializer(
            instance=contest,
            data={
                'voting_end_at': timezone.now() + timedelta(days=10),  # end_atより前なのでエラー
            },
            partial=True
        )
        
        # バリデーションエラー（end_atがインスタンスから取得され、比較される）
        is_valid = serializer.is_valid()
        self.assertFalse(is_valid)
        self.assertIn('投票終了日時', str(serializer.errors))
    
    def test_voting_end_validation_all_branches(self):
        """voting_end_atのバリデーションの全分岐をカバー"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        
        contest = Contest.objects.create(
            slug='existing-contest',
            title='Existing Contest',
            creator=user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        
        # ケース1: voting_end_atがあり、end_atがdataにない、インスタンスから取得
        # → 行47-48が実行される
        data1 = {
            'voting_end_at': timezone.now() + timedelta(days=5),  # end_atより前
        }
        serializer1 = ContestCreateSerializer(
            instance=contest,
            data=data1,
            partial=True
        )
        self.assertFalse(serializer1.is_valid())
        
        # ケース2: voting_end_atがあり、end_atもdataにある
        # → 行48はスキップされる
        data2 = {
            'voting_end_at': timezone.now() + timedelta(days=5),
            'end_at': timezone.now() + timedelta(days=10),
        }
        serializer2 = ContestCreateSerializer(
            instance=contest,
            data=data2,
            partial=True
        )
        self.assertFalse(serializer2.is_valid())
        
        # ケース3: voting_end_atが正しい値
        data3 = {
            'voting_end_at': timezone.now() + timedelta(days=45),  # end_atより後
        }
        serializer3 = ContestCreateSerializer(
            instance=contest,
            data=data3,
            partial=True
        )
        self.assertTrue(serializer3.is_valid())

