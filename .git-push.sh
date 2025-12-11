#!/bin/bash
echo "Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo "GitHub Actions will automatically deploy to Render."
    echo ""
    echo "Check deployment status:"
    echo "1. GitHub: https://github.com/YRNaru/photo_contest_platform/actions"
    echo "2. Render: https://dashboard.render.com/"
else
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Alternative: Set environment variable on Render.com"
    echo "ALLOWED_HOSTS=photo-contest-platform.onrender.com,.onrender.com,localhost,127.0.0.1"
fi
