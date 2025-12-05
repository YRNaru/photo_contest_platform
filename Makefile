.PHONY: help build up down logs shell-backend shell-frontend migrate createsuperuser test lint clean

help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Dockerイメージをビルド
	docker-compose build

up: ## サービスを起動
	docker-compose up

up-d: ## サービスをバックグラウンドで起動
	docker-compose up -d

down: ## サービスを停止
	docker-compose down

down-v: ## サービスを停止してボリュームも削除
	docker-compose down -v

logs: ## ログを表示
	docker-compose logs -f

logs-backend: ## バックエンドのログを表示
	docker-compose logs -f backend

logs-frontend: ## フロントエンドのログを表示
	docker-compose logs -f frontend

shell-backend: ## バックエンドのシェルに入る
	docker-compose exec backend bash

shell-frontend: ## フロントエンドのシェルに入る
	docker-compose exec frontend sh

migrate: ## マイグレーションを実行
	docker-compose exec backend python manage.py migrate

makemigrations: ## マイグレーションファイルを作成
	docker-compose exec backend python manage.py makemigrations

createsuperuser: ## スーパーユーザーを作成
	docker-compose exec backend python manage.py createsuperuser

collectstatic: ## 静的ファイルを収集
	docker-compose exec backend python manage.py collectstatic --noinput

test-backend: ## バックエンドのテストを実行
	docker-compose exec backend pytest

test-frontend: ## フロントエンドのテストを実行
	docker-compose exec frontend npm test

lint-backend: ## バックエンドのlintを実行
	docker-compose exec backend flake8 .
	docker-compose exec backend black --check .
	docker-compose exec backend isort --check-only .

lint-frontend: ## フロントエンドのlintを実行
	docker-compose exec frontend npm run lint

format-backend: ## バックエンドのコードをフォーマット
	docker-compose exec backend black .
	docker-compose exec backend isort .

clean: ## キャッシュとビルドファイルを削除
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache

restart: down up ## サービスを再起動

restart-backend: ## バックエンドを再起動
	docker-compose restart backend

restart-frontend: ## フロントエンドを再起動
	docker-compose restart frontend

ps: ## 実行中のサービスを表示
	docker-compose ps

init: build up-d migrate createsuperuser ## 初期セットアップ（ビルド、起動、マイグレーション、スーパーユーザー作成）

