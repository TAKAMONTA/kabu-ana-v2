# 株穴 - kabu-ana-v2

AIを活用して株式銘柄の分析を行うWebアプリです。  
テクニカル・ファンダメンタル・企業の強みを多角的に分析し、投資判断の参考情報を提供します。

---

## 🔧 プロジェクト概要

- フロントエンド：React + TypeScript + Vite
- API連携：OpenAI / Anthropic Claude
- 状態管理・ルーティング：React Router
- 開発環境：Node.js + npm
- 機密情報管理：`.env`（※Gitには含めない）

---

## 📂 ディレクトリ構成

project-clean/
├── src/
│ ├── components/ # UIパーツ
│ ├── pages/ # 各画面ページ
│ ├── services/ # API・データ通信
│ └── utils/ # 共通関数・定数
├── public/ # 静的ファイル
├── .env # 機密情報（Git非追跡）
├── .env.example # 環境構成のサンプル
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts

yaml
コピーする
編集する

---

## 🚀 開発・起動方法

### 1. リポジトリのクローン

```bash
git clone https://github.com/TAKAMONTA/kabu-ana-v2.git
cd kabu-ana-v2
2. 依存パッケージのインストール
bash
コピーする
編集する
npm install
3. .env を作成（.env.example をコピー）
bash
コピーする
編集する
cp .env.example .env
4. 開発サーバー起動
bash
コピーする
編集する
npm run dev
ブラウザで http://localhost:5173 にアクセス。

⚙️ 必要な環境変数
.env.example を参考に .env を作成してください：

env
コピーする
編集する
# OpenAI APIキー
OPENAI_API_KEY=sk-xxxxxx

# Claude (Anthropic) APIキー
ANTHROPIC_API_KEY=claude-xxxxxx
🔐 .env ファイルは絶対に Git にコミットしないよう注意してください。

🛠 ブランチ運用ルール
開発ブランチを切って作業（master直コミット禁止）

例：

bash
コピーする
編集する
git checkout -b feature/機能名
git add .
git commit -m "機能追加: 機能名"
git push origin feature/機能名
GitHubでPull Requestを作成 → レビュー後に master にマージ

🔒 セキュリティ対策（実施済）
APIキーはすべて再生成済み

.env は .gitignore で保護

.env.example を用意して共有管理

📌 注意事項
.env を 絶対にGitにコミットしない

コミット前に git status で .env が含まれていないことを確認

Pull Request には簡単な変更内容の説明を添えてください

🧑‍💻 開発者
作成者：@TAKAMONTA

📜 ライセンス
MIT License

yaml
コピーする
編集する

-

