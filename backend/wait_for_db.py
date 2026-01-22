"""
データベース接続を待つスクリプト
"""

import os
import sys
import time
from django.core.management import execute_from_command_line
from django.db import connection
from django.db.utils import OperationalError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

MAX_RETRIES = 10  # 最大20秒（10回 × 2秒）
RETRY_DELAY = 2


def wait_for_db():
    """データベース接続が確立されるまで待つ"""
    retries = 0
    while retries < MAX_RETRIES:
        try:
            connection.ensure_connection()
            print("Database connection successful!")
            return True
        except OperationalError:
            retries += 1
            if retries < MAX_RETRIES:
                print(f"Waiting for database... ({retries}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
            else:
                print("Failed to connect to database after maximum retries.")
                return False
    return False


if __name__ == "__main__":
    if wait_for_db():
        sys.exit(0)
    else:
        sys.exit(1)
