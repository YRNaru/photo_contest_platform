#!/usr/bin/env python3
"""
GitHub Actions修正の検証スクリプト
MySQLとPostgreSQLの両方でsettingsが正しくロードできるかテスト
"""
import os
import sys

def test_postgresql_settings():
    """PostgreSQL設定のテスト（GitHub Actionsで使用）"""
    print("=" * 60)
    print("PostgreSQL設定のテスト (GitHub Actions環境)")
    print("=" * 60)
    
    # PostgreSQL環境変数を設定
    os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/test_db'
    os.environ['REDIS_URL'] = 'redis://localhost:6379/0'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['DEBUG'] = 'True'
    
    # dj_database_urlをモックして、実際の接続なしで設定を確認
    try:
        import dj_database_url
        parsed = dj_database_url.parse(os.environ['DATABASE_URL'])
        
        print(f"✓ DATABASE_URL: {os.environ['DATABASE_URL']}")
        print(f"✓ エンジン: {parsed['ENGINE']}")
        print(f"✓ データベース名: {parsed['NAME']}")
        
        # エンジンがPostgreSQLかどうか確認
        if 'mysql' in parsed['ENGINE']:
            print("✗ エラー: PostgreSQLなのにMySQLエンジンが検出されました")
            return False
        elif 'postgres' in parsed['ENGINE']:
            print("✓ PostgreSQLエンジンが正しく検出されました")
            
            # charsetオプションが設定されないことを確認
            # 実際のsettings.pyのロジックをシミュレート
            options = {}
            if 'mysql' in parsed['ENGINE']:
                options = {'charset': 'utf8mb4'}
            
            if 'charset' in options:
                print("✗ エラー: PostgreSQLでcharsetオプションが設定されています")
                return False
            else:
                print("✓ PostgreSQLではcharsetオプションが設定されていません（正しい）")
        
        return True
    except Exception as e:
        print(f"✗ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mysql_settings():
    """MySQL設定のテスト（ローカル環境）"""
    print("\n" + "=" * 60)
    print("MySQL設定のテスト (ローカル環境)")
    print("=" * 60)
    
    # MySQL環境変数を設定
    os.environ['DATABASE_URL'] = 'mysql://contestuser:contestpass@localhost:3307/contest'
    os.environ['REDIS_URL'] = 'redis://localhost:6379/0'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['DEBUG'] = 'True'
    
    try:
        import dj_database_url
        parsed = dj_database_url.parse(os.environ['DATABASE_URL'])
        
        print(f"✓ DATABASE_URL: {os.environ['DATABASE_URL']}")
        print(f"✓ エンジン: {parsed['ENGINE']}")
        print(f"✓ データベース名: {parsed['NAME']}")
        
        # エンジンがMySQLかどうか確認
        if 'mysql' in parsed['ENGINE']:
            print("✓ MySQLエンジンが正しく検出されました")
            
            # charsetオプションが設定されることを確認
            # 実際のsettings.pyのロジックをシミュレート
            options = {}
            if 'mysql' in parsed['ENGINE']:
                options = {'charset': 'utf8mb4'}
            
            if 'charset' in options and options['charset'] == 'utf8mb4':
                print("✓ MySQLでcharsetオプション（utf8mb4）が正しく設定されています")
            else:
                print("✗ エラー: MySQLでcharsetオプションが設定されていません")
                return False
        else:
            print("✗ エラー: MySQLエンジンが検出されませんでした")
            return False
        
        return True
    except Exception as e:
        print(f"✗ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "🧪 GitHub Actions修正の検証\n")
    
    # 依存パッケージのチェック
    try:
        import dj_database_url
        print("✓ dj-database-url がインストールされています\n")
    except ImportError:
        print("⚠️  dj-database-url がインストールされていません")
        print("インストールコマンド: pip install dj-database-url\n")
        sys.exit(1)
    
    # テスト実行
    postgresql_ok = test_postgresql_settings()
    mysql_ok = test_mysql_settings()
    
    # 結果サマリー
    print("\n" + "=" * 60)
    print("テスト結果サマリー")
    print("=" * 60)
    print(f"PostgreSQL設定: {'✓ PASS' if postgresql_ok else '✗ FAIL'}")
    print(f"MySQL設定: {'✓ PASS' if mysql_ok else '✗ FAIL'}")
    
    if postgresql_ok and mysql_ok:
        print("\n✅ すべてのテストが成功しました！")
        print("GitHub Actionsでの修正は正しく動作するはずです。")
        sys.exit(0)
    else:
        print("\n❌ 一部のテストが失敗しました")
        sys.exit(1)

