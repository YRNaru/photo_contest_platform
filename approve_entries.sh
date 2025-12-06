#!/bin/bash
# 既存の未承認エントリーを承認するスクリプト

docker-compose exec backend python manage.py shell << 'EOF'
from contest.models import Entry

entries = Entry.objects.filter(approved=False)
count = entries.count()
entries.update(approved=True)
print(f"{count}件のエントリーを承認しました")
EOF
