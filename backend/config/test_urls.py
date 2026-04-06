"""config.urls の api_root / health_check / serve_media のテスト"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

from django.http import Http404
from django.test import RequestFactory, TestCase, override_settings

from config.urls import api_root, health_check, serve_media


class ApiRootAndHealthTests(TestCase):
    def test_api_root(self):
        req = RequestFactory().get("/")
        resp = api_root(req)
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        self.assertEqual(data["status"], "running")
        self.assertIn("api", data["endpoints"])

    @patch("config.urls.connection")
    def test_health_check_ok(self, mock_conn):
        mock_conn.ensure_connection = MagicMock()
        req = RequestFactory().get("/health/")
        resp = health_check(req)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(json.loads(resp.content)["database"], "connected")

    @patch("config.urls.connection")
    def test_health_check_db_failure_returns_503(self, mock_conn):
        mock_conn.ensure_connection.side_effect = RuntimeError("db down")
        req = RequestFactory().get("/health/")
        resp = health_check(req)
        self.assertEqual(resp.status_code, 503)
        self.assertEqual(json.loads(resp.content)["status"], "unhealthy")


class ServeMediaTests(TestCase):
    @override_settings(MEDIA_ROOT=Path("/nonexistent/media/root/xyz"))
    def test_serve_media_missing_file_raises_404(self):
        req = RequestFactory().get("/media/foo.jpg")
        with self.assertRaises(Http404):
            serve_media(req, "foo.jpg")

    def test_serve_media_serves_existing_file(self):
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "sub").mkdir()
            (root / "sub" / "a.png").write_bytes(b"x")
            req = RequestFactory().get("/media/sub/a.png")
            with override_settings(MEDIA_ROOT=root):
                resp = serve_media(req, "sub/a.png")
            self.assertEqual(resp.status_code, 200)
