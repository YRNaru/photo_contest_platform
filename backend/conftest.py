"""pytest 共通設定（テスト用に書き込み可能な MEDIA_ROOT を使う）"""

import pytest


@pytest.fixture(autouse=True)
def _tmp_media_root(tmp_path, settings):
    media = tmp_path / "media"
    media.mkdir(parents=True, exist_ok=True)
    settings.MEDIA_ROOT = str(media)
