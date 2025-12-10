from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .models import Contest
from .serializers import ContestCreateSerializer

User = get_user_model()


class Serializer100PercentTest(TestCase):
    """シリアライザーの100%カバレッジ達成のための最終テスト"""

    def test_voting_end_validation_line_48_coverage(self):
        """行48のカバレッジ: voting_end_atがあり、end_atがdataになく、instanceから取得"""
        user = User.objects.create_user(username="testuser", email="test@example.com")

        # 既存のコンテストを作成
        contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            creator=user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        # voting_end_atのみを含むデータ（end_atはなし）
        # この時、行47の条件が真になり、行48が実行される
        data = {
            "voting_end_at": timezone.now() + timedelta(days=45),
        }

        serializer = ContestCreateSerializer(instance=contest, data=data, partial=True)

        # バリデーション成功（end_atがinstanceから取得され、voting_end_at > end_atなので正常）
        is_valid = serializer.is_valid()
        self.assertTrue(is_valid)

        # 同様に、無効なケースもテスト
        data_invalid = {
            "voting_end_at": timezone.now() + timedelta(days=10),  # end_atより前
        }

        serializer_invalid = ContestCreateSerializer(instance=contest, data=data_invalid, partial=True)

        # バリデーションエラー（end_atがinstanceから取得され、voting_end_at <= end_atなのでエラー）
        is_valid_invalid = serializer_invalid.is_valid()
        self.assertFalse(is_valid_invalid)

    def test_voting_end_none_end_at_from_instance(self):
        """end_atがNoneでインスタンスから取得するケース"""
        user = User.objects.create_user(username="testuser", email="test@example.com")

        contest = Contest.objects.create(
            slug="test-contest2",
            title="Test Contest 2",
            creator=user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        # voting_end_atを設定、end_atはデータに含めない
        # 条件: voting_end_atがあり、end_atがdataにない → instanceから取得
        serializer = ContestCreateSerializer(
            instance=contest,
            data={
                "title": "Updated Title",  # 他のフィールドも更新
                "voting_end_at": timezone.now() + timedelta(days=50),
            },
            partial=True,
        )

        # 成功（instanceのend_atが使用される）
        self.assertTrue(serializer.is_valid())
