"""
構造化エラークラス

DRF のビルトイン例外と併用し、アプリケーション固有のエラーを
コード + メッセージ + ステータスコードで一貫して表現する。

Usage:
    from shared.errors import AppError

    raise AppError("CONTEST_NOT_FOUND", "コンテストが見つかりません", 404)
"""

from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


class AppError(Exception):
    """構造化されたアプリケーションエラー

    Attributes:
        code: エラーコード（例: 'USER_NOT_FOUND', 'VOTE_LIMIT_EXCEEDED'）
        message: 人間が読めるエラーメッセージ
        status_code: HTTP ステータスコード
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

    def __repr__(self) -> str:
        return f"AppError(code={self.code!r}, message={self.message!r}, status_code={self.status_code})"

    def to_response(self) -> Response:
        """DRF Response に変換"""
        return Response(
            {"code": self.code, "detail": self.message},
            status=self.status_code,
        )


def app_exception_handler(exc: Exception, context: dict) -> Response | None:
    """DRF カスタム例外ハンドラー

    settings.py で以下のように設定して使用:
        REST_FRAMEWORK = {
            'EXCEPTION_HANDLER': 'shared.errors.app_exception_handler',
        }
    """
    if isinstance(exc, AppError):
        return exc.to_response()

    # AppError 以外は DRF デフォルトに委譲
    return exception_handler(exc, context)
