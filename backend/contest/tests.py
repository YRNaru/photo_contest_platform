from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Contest, Entry, Vote
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class ContestModelTest(TestCase):
    """コンテストモデルのテスト"""

    def setUp(self):
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            description='Test Description',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
            voting_end_at=timezone.now() + timedelta(days=45),
        )

    def test_contest_creation(self):
        """コンテストが正しく作成される"""
        self.assertEqual(self.contest.title, 'Test Contest')
        self.assertEqual(self.contest.slug, 'test-contest')

    def test_contest_phase_submission(self):
        """応募期間中のフェーズ"""
        self.assertEqual(self.contest.phase(), 'submission')


class EntryAPITest(APITestCase):
    """エントリーAPIのテスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.contest = Contest.objects.create(
            slug='test-contest',
            title='Test Contest',
            description='Test Description',
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(days=30),
        )
        self.client = APIClient()

    def test_get_entries_unauthenticated(self):
        """未認証でエントリー一覧を取得"""
        response = self.client.get('/api/entries/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_entry_authenticated(self):
        """認証済みユーザーがエントリーを作成"""
        self.client.force_authenticate(user=self.user)
        # Note: 実際のファイルアップロードテストは省略
        # 画像ファイルのモックが必要


class VoteTest(TestCase):
    """投票機能のテスト"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
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

    def test_vote_creation(self):
        """投票が正しく作成される"""
        vote = Vote.objects.create(entry=self.entry, user=self.user)
        self.assertEqual(vote.entry, self.entry)
        self.assertEqual(vote.user, self.user)

    def test_duplicate_vote_prevented(self):
        """重複投票が防止される"""
        Vote.objects.create(entry=self.entry, user=self.user)
        with self.assertRaises(Exception):
            Vote.objects.create(entry=self.entry, user=self.user)

