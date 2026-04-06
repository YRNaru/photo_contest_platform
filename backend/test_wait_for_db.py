"""wait_for_db.wait_for_db のテスト（モジュールは pytest 収集対象の test*.py）"""

from unittest.mock import MagicMock, patch

from django.db.utils import OperationalError
from django.test import SimpleTestCase


class WaitForDbFunctionTests(SimpleTestCase):
    databases = {"default"}

    @patch("wait_for_db.time.sleep")
    def test_success_immediately(self, _sleep):
        import wait_for_db as wfd

        wfd.connection.ensure_connection = MagicMock()
        self.assertTrue(wfd.wait_for_db())
        wfd.connection.ensure_connection.assert_called_once()

    @patch("wait_for_db.time.sleep")
    def test_success_after_retries(self, _sleep):
        import wait_for_db as wfd

        wfd.connection.ensure_connection = MagicMock(
            side_effect=[OperationalError("x"), OperationalError("y"), None]
        )
        self.assertTrue(wfd.wait_for_db())
        self.assertEqual(wfd.connection.ensure_connection.call_count, 3)

    @patch("wait_for_db.time.sleep")
    def test_fails_after_max_retries(self, _sleep):
        import wait_for_db as wfd

        wfd.connection.ensure_connection = MagicMock(side_effect=OperationalError("down"))
        self.assertFalse(wfd.wait_for_db())
        self.assertEqual(wfd.connection.ensure_connection.call_count, wfd.MAX_RETRIES)
