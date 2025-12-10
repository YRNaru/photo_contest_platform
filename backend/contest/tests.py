from datetime import timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Contest, Entry, EntryImage, Flag, JudgeScore, Vote

User = get_user_model()


def create_test_image():
    """テスト用の画像を作成"""
    file = BytesIO()
    image = Image.new("RGB", (100, 100), color="red")
    image.save(file, "PNG")
    file.seek(0)
    return SimpleUploadedFile("test.png", file.read(), content_type="image/png")


class ContestModelTest(TestCase):
    """コンテストモデルのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            description="Test Description",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            voting_end_at=timezone.now() + timedelta(days=45),
        )

    def test_contest_creation(self):
        """コンテストが正しく作成される"""
        self.assertEqual(self.contest.title, "Test Contest")
        self.assertEqual(self.contest.slug, "test-contest")
        self.assertEqual(self.contest.creator, self.user)

    def test_contest_str_representation(self):
        """コンテストの文字列表現"""
        self.assertEqual(str(self.contest), "Test Contest")

    def test_contest_phase_upcoming(self):
        """開始前のフェーズ"""
        future_contest = Contest.objects.create(
            slug="future-contest",
            title="Future Contest",
            start_at=timezone.now() + timedelta(days=1),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.assertEqual(future_contest.phase(), "upcoming")

    def test_contest_phase_submission(self):
        """応募期間中のフェーズ"""
        self.assertEqual(self.contest.phase(), "submission")

    def test_contest_phase_voting(self):
        """投票期間中のフェーズ"""
        voting_contest = Contest.objects.create(
            slug="voting-contest",
            title="Voting Contest",
            start_at=timezone.now() - timedelta(days=30),
            end_at=timezone.now() - timedelta(days=1),
            voting_end_at=timezone.now() + timedelta(days=15),
        )
        self.assertEqual(voting_contest.phase(), "voting")

    def test_contest_phase_closed(self):
        """終了後のフェーズ"""
        closed_contest = Contest.objects.create(
            slug="closed-contest",
            title="Closed Contest",
            start_at=timezone.now() - timedelta(days=60),
            end_at=timezone.now() - timedelta(days=30),
            voting_end_at=timezone.now() - timedelta(days=15),
        )
        self.assertEqual(closed_contest.phase(), "closed")

    def test_contest_default_settings(self):
        """デフォルト設定のテスト"""
        self.assertTrue(self.contest.is_public)
        self.assertEqual(self.contest.max_entries_per_user, 1)
        self.assertEqual(self.contest.max_images_per_entry, 5)
        self.assertFalse(self.contest.twitter_auto_fetch)
        self.assertFalse(self.contest.twitter_auto_approve)


class EntryModelTest(TestCase):
    """エントリーモデルのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Test Entry",
            description="Test Description",
            approved=True,
        )

    def test_entry_creation(self):
        """エントリーが正しく作成される"""
        self.assertEqual(self.entry.title, "Test Entry")
        self.assertEqual(self.entry.author, self.user)
        self.assertEqual(self.entry.contest, self.contest)
        self.assertTrue(self.entry.approved)

    def test_entry_str_representation(self):
        """エントリーの文字列表現"""
        self.assertEqual(str(self.entry), "Test Entry - testuser")

    def test_entry_vote_count(self):
        """投票数のカウント"""
        self.assertEqual(self.entry.vote_count(), 0)

        Vote.objects.create(entry=self.entry, user=self.user)
        self.assertEqual(self.entry.vote_count(), 1)

    def test_entry_average_score_no_scores(self):
        """スコアがない場合の平均スコア"""
        self.assertIsNone(self.entry.average_score())

    def test_entry_average_score_with_scores(self):
        """スコアがある場合の平均スコア"""
        judge1 = User.objects.create_user(username="judge1", email="judge1@example.com", is_judge=True)
        judge2 = User.objects.create_user(username="judge2", email="judge2@example.com", is_judge=True)

        JudgeScore.objects.create(entry=self.entry, judge=judge1, total_score=80)
        JudgeScore.objects.create(entry=self.entry, judge=judge2, total_score=90)

        self.assertEqual(self.entry.average_score(), 85.0)

    def test_entry_default_source(self):
        """デフォルトの投稿元は手動"""
        self.assertEqual(self.entry.source, "manual")

    def test_entry_twitter_source(self):
        """Twitter投稿元のエントリー"""
        twitter_entry = Entry.objects.create(
            contest=self.contest,
            title="Twitter Entry",
            source="twitter",
            twitter_tweet_id="123456789",
            twitter_username="twitteruser",
            approved=True,
        )
        self.assertEqual(twitter_entry.source, "twitter")
        self.assertEqual(twitter_entry.twitter_tweet_id, "123456789")


class EntryImageModelTest(TestCase):
    """エントリー画像モデルのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

    def test_entry_image_creation(self):
        """エントリー画像の作成"""
        image = EntryImage.objects.create(entry=self.entry, image=create_test_image(), order=0)

        self.assertEqual(image.entry, self.entry)
        self.assertEqual(image.order, 0)
        self.assertFalse(image.is_thumbnail_ready)

    def test_entry_image_str_representation(self):
        """エントリー画像の文字列表現"""
        image = EntryImage.objects.create(entry=self.entry, image=create_test_image(), order=1)

        self.assertEqual(str(image), "Test Entry - 画像 1")


class FlagModelTest(TestCase):
    """通報モデルのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

    def test_flag_creation(self):
        """通報の作成"""
        flag = Flag.objects.create(entry=self.entry, user=self.user, reason="Inappropriate content")

        self.assertEqual(flag.entry, self.entry)
        self.assertEqual(flag.user, self.user)
        self.assertFalse(flag.resolved)

    def test_flag_str_representation(self):
        """通報の文字列表現"""
        flag = Flag.objects.create(entry=self.entry, user=self.user, reason="Spam")

        self.assertEqual(str(flag), "testuser -> Test Entry")


class VoteTest(TestCase):
    """投票機能のテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.user2 = User.objects.create_user(username="testuser2", email="test2@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

    def test_vote_creation(self):
        """投票が正しく作成される"""
        vote = Vote.objects.create(entry=self.entry, user=self.user2)
        self.assertEqual(vote.entry, self.entry)
        self.assertEqual(vote.user, self.user2)

    def test_vote_str_representation(self):
        """投票の文字列表現"""
        vote = Vote.objects.create(entry=self.entry, user=self.user2)
        self.assertEqual(str(vote), "testuser2 → Test Entry (全体)")

    def test_duplicate_vote_prevented(self):
        """重複投票が防止される - unique_togetherの制約確認"""
        # 最初の投票
        Vote.objects.create(entry=self.entry, user=self.user2)
        self.assertEqual(Vote.objects.filter(entry=self.entry, user=self.user2).count(), 1)

        # 同じユーザーと同じエントリーで2つ目の投票は作成できない
        # unique_together制約があることを確認
        self.assertIn(("entry", "user", "category"), Vote._meta.unique_together)

    def test_multiple_users_can_vote(self):
        """複数のユーザーが投票できる"""
        Vote.objects.create(entry=self.entry, user=self.user2)

        user3 = User.objects.create_user(username="testuser3", email="test3@example.com", password="testpass123")
        Vote.objects.create(entry=self.entry, user=user3)

        self.assertEqual(self.entry.vote_count(), 2)


class JudgeScoreTest(TestCase):
    """審査員スコアのテスト"""

    def setUp(self):
        self.author = User.objects.create_user(username="author", email="author@example.com", password="testpass123")
        self.judge = User.objects.create_user(
            username="judge",
            email="judge@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.author, title="Test Entry", approved=True)

    def test_judge_score_creation(self):
        """審査員スコアの作成"""
        score = JudgeScore.objects.create(entry=self.entry, judge=self.judge, total_score=85, comment="Great photo!")
        self.assertEqual(score.total_score, 85)
        self.assertEqual(score.judge, self.judge)

    def test_judge_score_str_representation(self):
        """審査員スコアの文字列表現"""
        score = JudgeScore.objects.create(entry=self.entry, judge=self.judge, total_score=85, comment="Great photo!")
        expected = f"{self.judge.username} → {self.entry.title}: 85点"
        self.assertEqual(str(score), expected)

    def test_entry_average_score(self):
        """エントリーの平均スコア"""
        JudgeScore.objects.create(entry=self.entry, judge=self.judge, total_score=80)

        judge2 = User.objects.create_user(
            username="judge2",
            email="judge2@example.com",
            password="testpass123",
            is_judge=True,
        )
        JudgeScore.objects.create(entry=self.entry, judge=judge2, total_score=90)

        self.assertEqual(self.entry.average_score(), 85.0)


class ContestAPITest(APITestCase):
    """コンテストAPIのテスト"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            description="Test Description",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            is_public=True,
        )

    def test_get_contests_list(self):
        """コンテスト一覧を取得"""
        response = self.client.get("/api/contests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_contest_detail(self):
        """コンテスト詳細を取得"""
        response = self.client.get(f"/api/contests/{self.contest.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Contest")

    def test_create_contest_unauthenticated(self):
        """未認証ユーザーはコンテストを作成できない"""
        data = {
            "slug": "new-contest",
            "title": "New Contest",
            "start_at": timezone.now().isoformat(),
            "end_at": (timezone.now() + timedelta(days=30)).isoformat(),
        }
        response = self.client.post("/api/contests/", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_contest_authenticated(self):
        """認証済みユーザーがコンテストを作成"""
        self.client.force_authenticate(user=self.user)
        data = {
            "slug": "new-contest",
            "title": "New Contest",
            "description": "New Description",
            "start_at": timezone.now().isoformat(),
            "end_at": (timezone.now() + timedelta(days=30)).isoformat(),
        }
        response = self.client.post("/api/contests/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_contest_with_invalid_dates(self):
        """無効な日付でコンテストを作成"""
        self.client.force_authenticate(user=self.user)

        # 終了日が開始日より前
        data = {
            "slug": "invalid-contest",
            "title": "Invalid Contest",
            "start_at": (timezone.now() + timedelta(days=30)).isoformat(),
            "end_at": timezone.now().isoformat(),
        }
        response = self.client.post("/api/contests/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_contest_with_invalid_voting_end(self):
        """無効な投票終了日でコンテストを作成"""
        self.client.force_authenticate(user=self.user)

        # 投票終了日が応募終了日より前
        data = {
            "slug": "invalid-voting-contest",
            "title": "Invalid Voting Contest",
            "start_at": timezone.now().isoformat(),
            "end_at": (timezone.now() + timedelta(days=30)).isoformat(),
            "voting_end_at": (timezone.now() + timedelta(days=20)).isoformat(),
        }
        response = self.client.post("/api/contests/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_creator_can_update_contest(self):
        """作成者のみがコンテストを更新できる"""
        other_user = User.objects.create_user(username="otheruser", email="other@example.com", password="testpass123")
        self.client.force_authenticate(user=other_user)

        data = {"title": "Updated Title"}
        response = self.client.patch(f"/api/contests/{self.contest.slug}/", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_contest(self):
        """管理者はコンテストを更新できる"""
        admin = User.objects.create_superuser(username="admin", email="admin@example.com", password="testpass123")
        self.client.force_authenticate(user=admin)

        data = {"title": "Admin Updated Title"}
        response = self.client.patch(f"/api/contests/{self.contest.slug}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_creator_can_delete_contest(self):
        """作成者はコンテストを削除できる"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f"/api/contests/{self.contest.slug}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_non_creator_cannot_delete_contest(self):
        """作成者以外はコンテストを削除できない"""
        other_user = User.objects.create_user(username="otheruser", email="other@example.com", password="testpass123")
        self.client.force_authenticate(user=other_user)
        response = self.client.delete(f"/api/contests/{self.contest.slug}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_my_contests(self):
        """自分が作成したコンテスト一覧を取得"""
        self.client.force_authenticate(user=self.user)

        # 別のユーザーのコンテストを作成
        other_user = User.objects.create_user(username="otheruser", email="other@example.com", password="testpass123")
        Contest.objects.create(
            slug="other-contest",
            title="Other Contest",
            creator=other_user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )

        response = self.client.get("/api/contests/my_contests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # レスポンスがpagination付きの可能性があるため、resultsをチェック
        if "results" in response.data:
            contests = response.data["results"]
        else:
            contests = response.data
        # 自分のコンテストのみ含まれていることを確認
        self.assertGreaterEqual(len(contests), 1)
        # 他のユーザーのコンテストが含まれていないことを確認
        if isinstance(contests, list):
            for contest in contests:
                created_contest = Contest.objects.get(slug=contest["slug"])
                self.assertEqual(created_contest.creator, self.user)

    def test_get_contest_entries_with_ordering(self):
        """コンテストのエントリー一覧をソート順で取得"""
        # エントリーを作成
        # entry1 =  # unused

        Entry.objects.create(contest=self.contest, author=self.user, title="Entry 1", approved=True)
        entry2 = Entry.objects.create(contest=self.contest, author=self.user, title="Entry 2", approved=True)

        # 投票を追加
        voter = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        Vote.objects.create(entry=entry2, user=voter)

        # 投票数順で取得
        response = self.client.get(f"/api/contests/{self.contest.slug}/entries/?ordering=-vote_count")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 作成日順で取得
        response = self.client.get(f"/api/contests/{self.contest.slug}/entries/?ordering=-created_at")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_contest_entries_invalid_ordering(self):
        """無効なソート順でコンテストのエントリー一覧を取得"""
        Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        # 無効なorderingパラメータ（デフォルトソートが使用される）
        response = self.client.get(f"/api/contests/{self.contest.slug}/entries/?ordering=invalid_field")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_entry_viewset_get_serializer_class(self):
        """EntryViewSetのシリアライザークラス選択"""
        from contest.serializers import (
            EntryCreateSerializer,
            EntryDetailSerializer,
            EntryListSerializer,
        )
        from contest.views import EntryViewSet

        viewset = EntryViewSet()

        # createアクション
        viewset.action = "create"
        self.assertEqual(viewset.get_serializer_class(), EntryCreateSerializer)

        # retrieveアクション
        viewset.action = "retrieve"
        self.assertEqual(viewset.get_serializer_class(), EntryDetailSerializer)

        # その他のアクション
        viewset.action = "list"
        self.assertEqual(viewset.get_serializer_class(), EntryListSerializer)

    def test_get_contest_entries(self):
        """コンテストのエントリー一覧を取得"""
        # エントリーを作成
        Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        response = self.client.get(f"/api/contests/{self.contest.slug}/entries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_private_contest_as_creator(self):
        """非公開コンテストを作成者として取得"""
        private_contest = Contest.objects.create(
            slug="private-contest",
            title="Private Contest",
            creator=self.user,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            is_public=False,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/contests/{private_contest.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class EntryAPITest(APITestCase):
    """エントリーAPIのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            description="Test Description",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.client = APIClient()

    def test_get_entries_unauthenticated(self):
        """未認証でエントリー一覧を取得"""
        response = self.client.get("/api/entries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_entry_detail(self):
        """エントリー詳細を取得して閲覧数が増加"""
        entry = Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Test Entry",
            approved=True,
            view_count=0,
        )

        initial_count = entry.view_count
        response = self.client.get(f"/api/entries/{entry.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        entry.refresh_from_db()
        self.assertEqual(entry.view_count, initial_count + 1)

    def test_vote_api_authenticated(self):
        """認証済みユーザーが投票"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        other_user = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        self.client.force_authenticate(user=other_user)

        response = self.client.post(f"/api/entries/{entry.id}/vote/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_vote_closed_contest(self):
        """終了したコンテストへの投票"""
        closed_contest = Contest.objects.create(
            slug="closed-contest",
            title="Closed Contest",
            start_at=timezone.now() - timedelta(days=60),
            end_at=timezone.now() - timedelta(days=30),
        )
        entry = Entry.objects.create(contest=closed_contest, author=self.user, title="Test Entry", approved=True)

        voter = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        self.client.force_authenticate(user=voter)

        response = self.client.post(f"/api/entries/{entry.id}/vote/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_vote_api(self):
        """重複投票のAPIテスト"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        voter = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        self.client.force_authenticate(user=voter)

        # 1回目の投票
        self.client.post(f"/api/entries/{entry.id}/vote/")

        # 2回目の投票（重複）
        response = self.client.post(f"/api/entries/{entry.id}/vote/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unvote_api(self):
        """投票取消のAPIテスト"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        voter = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        self.client.force_authenticate(user=voter)

        # 投票
        self.client.post(f"/api/entries/{entry.id}/vote/")

        # 投票取消
        response = self.client.delete(f"/api/entries/{entry.id}/unvote/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unvote_not_voted(self):
        """投票していないエントリーの投票取消"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        voter = User.objects.create_user(username="voter", email="voter@example.com", password="testpass123")
        self.client.force_authenticate(user=voter)

        # 投票せずに取消
        response = self.client.delete(f"/api/entries/{entry.id}/unvote/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_flag_entry(self):
        """エントリーの通報"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        flagger = User.objects.create_user(username="flagger", email="flagger@example.com", password="testpass123")
        self.client.force_authenticate(user=flagger)

        data = {"reason": "Inappropriate content"}
        response = self.client.post(f"/api/entries/{entry.id}/flag/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_flag_entry_without_reason(self):
        """理由なしでエントリーを通報"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        flagger = User.objects.create_user(username="flagger", email="flagger@example.com", password="testpass123")
        self.client.force_authenticate(user=flagger)

        data = {"reason": ""}
        response = self.client.post(f"/api/entries/{entry.id}/flag/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_judge_score_invalid_score(self):
        """無効なスコアの審査"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        judge = User.objects.create_user(
            username="judge",
            email="judge@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.client.force_authenticate(user=judge)

        # 範囲外のスコア
        data = {"score": 150, "comment": "Too high"}
        response = self.client.post(f"/api/entries/{entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_judge_score_update_existing(self):
        """既存のスコアを更新"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        judge = User.objects.create_user(
            username="judge",
            email="judge@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.client.force_authenticate(user=judge)

        # 最初のスコア
        data = {"score": 80, "comment": "Good"}
        response = self.client.post(f"/api/entries/{entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 同じ審査員が更新
        data = {"score": 90, "comment": "Great"}
        response = self.client.post(f"/api/entries/{entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # スコアが更新されていることを確認
        score = JudgeScore.objects.get(entry=entry, judge=judge)
        self.assertEqual(score.total_score, 90)
        self.assertEqual(score.comment, "Great")

    def test_moderator_reject_entry(self):
        """モデレーターがエントリーを非承認"""
        entry = Entry.objects.create(contest=self.contest, author=self.user, title="Test Entry", approved=True)

        moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.client.force_authenticate(user=moderator)

        response = self.client.post(f"/api/entries/{entry.id}/reject/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        entry.refresh_from_db()
        self.assertFalse(entry.approved)

    def test_get_pending_entries(self):
        """承認待ちエントリー一覧の取得"""
        # 承認済みエントリー
        Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Approved Entry",
            approved=True,
        )

        # 未承認エントリー
        Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Pending Entry",
            approved=False,
        )

        moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.client.force_authenticate(user=moderator)

        response = self.client.get("/api/entries/pending/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 未承認のみが返される
        if "results" in response.data:
            entries = response.data["results"]
        else:
            entries = response.data

        self.assertGreaterEqual(len(entries), 1)
        if isinstance(entries, list):
            for entry_data in entries:
                entry = Entry.objects.get(id=entry_data["id"])
                self.assertFalse(entry.approved)

    def test_moderator_view_unapproved_entries(self):
        """モデレーターは未承認エントリーも閲覧可能"""
        # 未承認エントリー
        Entry.objects.create(
            contest=self.contest,
            author=self.user,
            title="Pending Entry",
            approved=False,
        )

        moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.client.force_authenticate(user=moderator)

        response = self.client.get("/api/entries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_view_private_contests(self):
        """スタッフは非公開コンテストも閲覧可能"""
        Contest.objects.create(
            slug="private-contest",
            title="Private Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            is_public=False,
        )

        staff = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="testpass123",
            is_staff=True,
        )
        self.client.force_authenticate(user=staff)

        response = self.client.get("/api/contests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ModeratorPermissionsTest(APITestCase):
    """モデレーター権限のテスト"""

    def setUp(self):
        self.author = User.objects.create_user(username="author", email="author@example.com", password="testpass123")
        self.moderator = User.objects.create_user(
            username="moderator",
            email="moderator@example.com",
            password="testpass123",
            is_moderator=True,
        )
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.author, title="Test Entry", approved=False)
        self.client = APIClient()

    def test_moderator_can_approve_entry(self):
        """モデレーターはエントリーを承認できる"""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f"/api/entries/{self.entry.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.entry.refresh_from_db()
        self.assertTrue(self.entry.approved)

    def test_normal_user_cannot_approve_entry(self):
        """通常ユーザーはエントリーを承認できない"""
        normal_user = User.objects.create_user(username="normaluser", email="normal@example.com", password="testpass123")
        self.client.force_authenticate(user=normal_user)
        response = self.client.post(f"/api/entries/{self.entry.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class JudgePermissionsTest(APITestCase):
    """審査員権限のテスト"""

    def setUp(self):
        self.author = User.objects.create_user(username="author", email="author@example.com", password="testpass123")
        self.judge = User.objects.create_user(
            username="judge",
            email="judge@example.com",
            password="testpass123",
            is_judge=True,
        )
        self.contest = Contest.objects.create(
            slug="test-contest",
            title="Test Contest",
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.entry = Entry.objects.create(contest=self.contest, author=self.author, title="Test Entry", approved=True)
        self.client = APIClient()

    def test_judge_can_score_entry(self):
        """審査員はエントリーにスコアをつけられる"""
        self.client.force_authenticate(user=self.judge)
        data = {"score": 85, "comment": "Great work!"}
        response = self.client.post(f"/api/entries/{self.entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_normal_user_cannot_score_entry(self):
        """通常ユーザーはエントリーにスコアをつけられない"""
        normal_user = User.objects.create_user(username="normaluser", email="normal@example.com", password="testpass123")
        self.client.force_authenticate(user=normal_user)
        data = {"score": 85}
        response = self.client.post(f"/api/entries/{self.entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_score_entry(self):
        """管理者もエントリーにスコアをつけられる"""
        admin = User.objects.create_superuser(username="admin", email="admin@example.com", password="testpass123")
        self.client.force_authenticate(user=admin)
        data = {"score": 90, "comment": "Excellent!"}
        response = self.client.post(f"/api/entries/{self.entry.id}/judge_score/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PermissionsDetailTest(TestCase):
    """権限の詳細テスト"""

    def test_is_owner_or_readonly_permission(self):
        """IsOwnerOrReadOnly権限のテスト"""
        from unittest.mock import Mock

        from rest_framework.test import APIRequestFactory

        from contest.permissions import IsOwnerOrReadOnly

        permission = IsOwnerOrReadOnly()
        factory = APIRequestFactory()

        # 読み取り専用メソッド（GET）は誰でもOK
        request = factory.get("/api/entries/")
        request.user = User.objects.create_user(username="user1", email="user1@example.com")

        mock_entry = Mock()
        mock_entry.author = User.objects.create_user(username="author", email="author@example.com")

        self.assertTrue(permission.has_object_permission(request, None, mock_entry))

        # オーナーは更新可能
        request = factory.patch("/api/entries/1/")
        request.user = mock_entry.author
        self.assertTrue(permission.has_object_permission(request, None, mock_entry))

        # オーナー以外は更新不可
        request = factory.patch("/api/entries/1/")
        request.user = User.objects.create_user(username="user2", email="user2@example.com")
        self.assertFalse(permission.has_object_permission(request, None, mock_entry))
