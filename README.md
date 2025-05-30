# AIMemoTool 📚🤖

Discordで送信したメモを自動で要約し、Notionに登録する「第二の脳」ツールです 🧠✨  
→ AI × 自動化 × メモ管理 の練習・学習用プロジェクト 📈

---

## 📌 機能概要

✅ Discord で「分類」「やったことメモ」を送信  
✅ OpenAI (ChatGPT) で要約  
✅ Notion に「分類 / 要約 / 詳細 / 日時」として自動登録  
✅ 重複チェック機能あり（同じメモは登録しない）  

---

## ⚙️ 使用技術

- Node.js
- Discord.js
- OpenAI API
- Notion API (@notionhq/client)
- dotenv
- axios

---

## 🚀 セットアップ方法

### 1️⃣ リポジトリを clone

```bash
git clone https://github.com/あなたのユーザー名/AIMemoTool.git
cd AIMemoTool
2️⃣ 必要パッケージをインストール
bash
コピーする
編集する
npm install
3️⃣ .env ファイルを作成
ルートに .env ファイルを作成して以下の内容を記載：
env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_BOT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TEST_MODE=true
※ .env は .gitignore により GitHub にはアップロードされません

🏃‍♀️ 起動方法
Discord Bot を起動：

bash
node discordBot.js
💬 Discord での使い方
Discord チャンネルに以下のフォーマットでメッセージを送信：
分類: 学習
やったこと: Node.js の非同期処理を学んだ
✅ → OpenAI で要約し、Notion に自動で登録されます！

📝 ファイル構成
AIMemoTool/
├── node_modules/
├── .env            ← 環境変数（Git管理対象外）
├── .gitignore
├── discordBot.js   ← Discord Bot 本体
├── notionHelper.js ← Notion連携 & OpenAI連携
├── package.json
├── package-lock.json
└── README.md       ← このファイル
🚀 今後の予定・改善アイデア
Railway / Vercel へのデプロイ
定期バッチ実行（cron）
Web画面からのメモ入力対応
日報フォーマット自動生成機能
Google Calendar連携（予定）


📄 ライセンス
MIT License  
このプロジェクトは自由に利用・改変・再配布可能です。  
LICENSE ファイルをご確認ください。