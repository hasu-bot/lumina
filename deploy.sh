#!/bin/bash
# YOLO Magazine — テーマデプロイスクリプト
# 使い方: ./deploy.sh

SSH_USER="rencame"
SSH_HOST="sv10444.xserver.jp"
SSH_PORT="10022"
LOCAL_THEME="/Users/sakamotoren/Local Sites/yolo-magazine/app/public/wp-content/themes/swell_child/"
REMOTE_THEME="/home/${SSH_USER}/rencame.net/public_html/yolo-magazine/wp-content/themes/swell_child/"

echo "🚀 YOLO Magazine をデプロイ中..."

rsync -avz --progress \
  -e "ssh -p ${SSH_PORT}" \
  --exclude=".DS_Store" \
  --exclude="*.log" \
  --exclude=".git/" \
  "${LOCAL_THEME}" \
  "${SSH_USER}@${SSH_HOST}:${REMOTE_THEME}"

if [ $? -eq 0 ]; then
  echo "✅ デプロイ完了！"
  echo "   https://yolo-magazine.rencame.net/"
else
  echo "❌ デプロイ失敗。SSH接続を確認してください。"
fi
