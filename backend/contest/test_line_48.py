from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .models import Contest
from .serializers import ContestCreateSerializer

User = get_user_model()


class Line48CoverageTest(TestCase):
    """行48を確実にカバーするテスト"""

    def test_line_48_exact_coverage(self):
        """
        行48をカバーする条件:
        - voting_end_at がdataにある (行46が真)
        - end_at がdataにない (行47の左側が真)
        - self.instance が存在する (行47の右側が真)
        → 行48が実行される: end_at = self.instance.end_at
        """
        user = User.objects.create_user(username="user", email="user@example.com")

        # インスタンスを作成
        contest = Contest.objects.create(
            slug="contest",
            title="Contest",
            creator=user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        # dataにはvoting_end_atのみ含め、end_atは含めない
        # これにより、行47の条件 "if not end_at and self.instance:" が真になり
        # 行48 "end_at = self.instance.end_at" が実行される
        data = {
            "voting_end_at": timezone.now() + timedelta(days=45),  # instanceのend_atより後
        }

        # partial=Trueで部分更新
        serializer = ContestCreateSerializer(instance=contest, data=data, partial=True)  # instanceを渡す

        # バリデーション実行（行48が実行される）
        is_valid = serializer.is_valid()

        # 成功するはず（voting_end_at > instance.end_at）
        self.assertTrue(is_valid)

    def test_line_48_with_error_case(self):
        """行48カバー + エラーケース"""
        user = User.objects.create_user(username="user2", email="user2@example.com")

        contest = Contest.objects.create(
            slug="contest2",
            title="Contest 2",
            creator=user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        # voting_end_atがinstanceのend_atより前（エラーケース）
        data = {
            "voting_end_at": timezone.now() + timedelta(days=5),  # 30日より前
        }

        serializer = ContestCreateSerializer(instance=contest, data=data, partial=True)

        # 行48でinstanceのend_atが取得され、行49で比較してエラー
        is_valid = serializer.is_valid()
        self.assertFalse(is_valid)
        self.assertIn("投票終了日時", str(serializer.errors))
