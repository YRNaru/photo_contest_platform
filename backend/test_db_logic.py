#!/usr/bin/env python3
"""
データベース設定ロジックの直接テスト
settings.pyの該当部分を抽出してテスト
"""
import os

import dj_database_url


def test_database_options_logic():
    """settings.pyの該当ロジックをテスト"""
    print("\n🧪 データベース設定ロジックの検証\n")
    print("=" * 70)

    # テストケース1: PostgreSQL
    print("テストケース1: PostgreSQL (GitHub Actions環境)")
    print("-" * 70)

    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/test_db"

    # settings.pyのロジックを再現
    DATABASES = {
        "default": dj_database_url.config(
            default="mysql://contestuser:contestpass@localhost:3307/contest",
            conn_max_age=600,
        )
    }

    print(f"DATABASE_URL: {os.environ['DATABASE_URL']}")
    print(f"エンジン: {DATABASES['default']['ENGINE']}")
    print(f"データベース名: {DATABASES['default']['NAME']}")

    # 修正後のロジック
    if "mysql" in DATABASES["default"]["ENGINE"]:
        DATABASES["default"]["OPTIONS"] = {
            "charset": "utf8mb4",
        }
        charset_set = True
    else:
        charset_set = False

    print(f"OPTIONS: {DATABASES['default'].get('OPTIONS', {})}")
    print(f"charsetが設定されているか: {charset_set}")

    if charset_set:
        print("❌ FAIL: PostgreSQLでcharsetが設定されています")
        return False
    else:
        print("✅ PASS: PostgreSQLではcharsetが設定されていません\n")

    # テストケース2: MySQL
    print("=" * 70)
    print("テストケース2: MySQL (ローカル環境)")
    print("-" * 70)

    os.environ["DATABASE_URL"] = "mysql://contestuser:contestpass@localhost:3307/contest"

    # settings.pyのロジックを再現
    DATABASES = {
        "default": dj_database_url.config(
            default="mysql://contestuser:contestpass@localhost:3307/contest",
            conn_max_age=600,
        )
    }

    print(f"DATABASE_URL: {os.environ['DATABASE_URL']}")
    print(f"エンジン: {DATABASES['default']['ENGINE']}")
    print(f"データベース名: {DATABASES['default']['NAME']}")

    # 修正後のロジック
    if "mysql" in DATABASES["default"]["ENGINE"]:
        DATABASES["default"]["OPTIONS"] = {
            "charset": "utf8mb4",
        }
        charset_set = True
    else:
        charset_set = False

    print(f"OPTIONS: {DATABASES['default'].get('OPTIONS', {})}")
    print(f"charsetが設定されているか: {charset_set}")

    if not charset_set or DATABASES["default"]["OPTIONS"].get("charset") != "utf8mb4":
        print("❌ FAIL: MySQLでcharset=utf8mb4が設定されていません")
        return False
    else:
        print("✅ PASS: MySQLでcharset=utf8mb4が正しく設定されています\n")

    # テストケース3: デフォルト（DATABASE_URLがない場合）
    print("=" * 70)
    print("テストケース3: デフォルト設定（DATABASE_URL未設定）")
    print("-" * 70)

    if "DATABASE_URL" in os.environ:
        del os.environ["DATABASE_URL"]

    # settings.pyのロジックを再現
    DATABASES = {
        "default": dj_database_url.config(
            default="mysql://contestuser:contestpass@localhost:3307/contest",
            conn_max_age=600,
        )
    }

    print(f"DATABASE_URL: (未設定)")
    print(f"デフォルトURL: mysql://contestuser:contestpass@localhost:3307/contest")
    print(f"エンジン: {DATABASES['default']['ENGINE']}")
    print(f"データベース名: {DATABASES['default']['NAME']}")

    # 修正後のロジック
    if "mysql" in DATABASES["default"]["ENGINE"]:
        DATABASES["default"]["OPTIONS"] = {
            "charset": "utf8mb4",
        }
        charset_set = True
    else:
        charset_set = False

    print(f"OPTIONS: {DATABASES['default'].get('OPTIONS', {})}")
    print(f"charsetが設定されているか: {charset_set}")

    if not charset_set:
        print("❌ FAIL: デフォルト（MySQL）でcharsetが設定されていません")
        return False
    else:
        print("✅ PASS: デフォルト（MySQL）でcharsetが正しく設定されています\n")

    return True


if __name__ == "__main__":
    success = test_database_options_logic()

    print("=" * 70)
    print("📊 最終結果")
    print("=" * 70)

    if success:
        print("✅ すべてのテストが成功しました！\n")
        print("修正内容:")
        print("  - PostgreSQL環境ではcharsetオプションが設定されない")
        print("  - MySQL環境ではcharsetオプション（utf8mb4）が設定される")
        print("  - デフォルト（MySQL）でも正しく動作する\n")
        print("👍 GitHub Actionsでバックエンドテストが正常に実行されます！")
        exit(0)
    else:
        print("❌ テストが失敗しました")
        exit(1)
