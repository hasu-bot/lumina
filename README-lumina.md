# YOLO写真映像展「lumina」 モデル・クリエイター マッチングシステム

写真展会場で、来場者がモデルと出会い・プロフィールを見て・撮影予約できる Web システム（MVP）。
Next.js (App Router) + Supabase で構築。既存の静的サイト「Last Call」とは独立して動作します。

> 既存の `index.html` / `css/` / `js/` / `photos/`（Last Call サイト）はこのアプリと共存します。
> Next.js は `public/` 以外の静的ファイルを配信しないため、互いに干渉しません。

## 機能（MVP）

| 区分 | 画面 | 内容 |
|------|------|------|
| 来場者 | `/` | 写真展参加者一覧（本日「参加中」のモデルのみ） |
| 来場者 | `/models/[id]` | モデル詳細・空き枠(30分)・名前だけで予約 |
| モデル | `/m/login` → `/m/dashboard` | パスコードでログイン。ステータス切替・本日の予約一覧（自動更新）・空き状況 |
| 運営 | `/admin/login` → `/admin` | モデル登録・参加/非参加・対応時間/料金設定 |

### 表示ルール（厳守）
- モデルの**所属事務所を必ず明記**（カード・詳細とも「所属：◯◯」）。
- **「YOLOメンバー」表記はしない**（YOLO はイベント主催ブランド表記のみ）。
- 一覧ページ名は「写真展参加者一覧 / PHOTO EXHIBITION GUESTS」。

### 予約設計
- 1枠 **30分**。
- 在廊時間を30分刻みで生成し、**予約枠（○）と当日枠（会場受付）を50%ずつ交互**に配置（完全予約制にしない）。
- 予約が入ると枠が即 **×** に。モデル管理画面は15秒ごとに自動更新し新規予約を「NEW」表示。

## セットアップ

### 1. Supabase プロジェクト作成
1. https://supabase.com で無料プロジェクトを作成。
2. SQL Editor で `supabase/schema.sql` を実行。
3. 続けて `supabase/seed.sql` を実行（サンプルモデル投入。任意）。

### 2. 環境変数
`.env.local.example` をコピーして `.env.local` を作成し、値を設定:

```
NEXT_PUBLIC_SUPABASE_URL=...        # Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # 同 → anon public
SUPABASE_SERVICE_ROLE_KEY=...       # 同 → service_role（サーバー専用・秘匿）
ADMIN_PASSCODE=lumina-admin         # 運営ログイン用パスコード（任意の値に）
SESSION_SECRET=（長いランダム文字列）  # cookie 署名用
```

### 3. 起動

```bash
npm install
npm run dev
# http://localhost:3000
```

## ログイン情報（seed 投入時）
- 運営：`ADMIN_PASSCODE` に設定した値（既定例 `lumina-admin`）。
- モデル：`miu-1234` / `rena-5678` / `aoi-9012` / `hikari-3456`。
  （運営画面で各モデルのパスコードを確認・配布できます）

## 動作確認フロー
1. `/` に「参加中」モデルのみ表示され、各カードに「所属：◯◯」があること。
2. モデル詳細で30分枠（○予約可 / ×予約済 / 当日枠）を確認 → 名前を入れて予約 → 枠が × に。
3. 別タブで `/m/login` にモデルパスコードでログイン → 予約が一覧に「NEW」で出現。ステータスを休憩中にすると `/` から外れる。
4. `/admin/login` で運営ログイン → 新規モデル登録（所属事務所必須）→ 参加/非参加トグルが `/` に反映。

## デプロイ（Vercel）
1. リポジトリを Vercel に接続。
2. 上記の環境変数を Vercel の Environment Variables に設定。
3. デプロイ。Supabase が共有DBなので複数端末で予約が同期します。

GA4を有効化する場合は、Vercelの Environment Variables に以下も設定します。

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-R0YPCPLNFQ
```

## 将来拡張（未実装・設計のみ）
- `models.creator_type` 列でモデル以外（カメラマン・デザイナー等）を追加可能。
- 撮影会 / MV / 映画キャスト募集は将来 `projects`（募集案件）テーブルで拡張する想定。

## 主要ファイル
- `app/` … 各画面と `app/actions/*`（Server Actions）
- `lib/` … `supabase.ts`（クライアント）/ `slots.ts`（枠生成）/ `session.ts`（認証）/ `data.ts`（取得）
- `components/` … カード・枠グリッド・予約フォーム等
- `supabase/` … `schema.sql` / `seed.sql`
