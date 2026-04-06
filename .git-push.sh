#!/bin/bash
echo "Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Check CI status:"
    echo "  https://github.com/YRNaru/photo_contest_platform/actions"
    echo ""
    echo "本番反映はサーバー上で git pull とサービス再起動（systemd 等）を行ってください。"
else
    echo "❌ Failed to push to GitHub"
fi
