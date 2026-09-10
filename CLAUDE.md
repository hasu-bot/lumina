# lumina

撮影モデルのマッチング／予約サービス。モデル名鑑・空き状況・予約・運営管理画面を持つ。

## スタック
- Next.js 15（App Router）+ React 19 + TypeScript
- DB: Supabase（`lib/supabase.ts`: anon = 公開読み取り / service role = サーバー専用書き込み）
- メール通知: Resend（`lib/notify.ts`）／ セッション: `lib/session.ts` + `SESSION_SECRET`

## コマンド
- `npm run dev` … 開発サーバー
- `npm run build` … ビルド＋型チェック（変更後は必ず通すこと。ESLint は未導入）
- env は `.env.local.example` を参照（ビルドは env 無しでも通る）

## 他サイトのコピーを置かない（重要）
- 映画祭サイトの正は `yolo-film-festival` リポジトリ（Vercel: https://yolo-film-festival.vercel.app/ 。旧GitHub Pagesは2026-07-27に停止済み）
- 映画「ラストコール」サイトの正は `last-call-movie` リポジトリ（https://last-call-movie.vercel.app/ ）
- Creative YOLO 公式サイトの正は `yolo-official` リポジトリ
過去にこのリポジトリ内へ複製（`film-festival/` `last-call/` `public/film-festival/` `public/last-call/` `public/creative-yolo/`）が置かれたが、本家より古く逆移植すべき変更も無いことを確認済み。**2026-09-10 にすべて削除済み**（あわせて `next.config.mjs` の `/film-festival`・`/last-call` rewrite も撤去）。再び複製せず、リンクで接続する。

## 意思決定の正
事業・UX・コピーの判断は yolo-members リポジトリの `docs/creative-yolo/` が正。単独セッションでは add_repo で yolo-members を追加して参照する。lumina 固有の事業・IP方針は `docs/LUMINA-BUSINESS.md` / `docs/LUMINA-IP.md`。

## ルール
- `SUPABASE_SERVICE_ROLE_KEY` を使う処理はサーバー専用に保つ（`getServiceClient` の制約を崩さない）
- DB スキーマ変更は `supabase/migrations/` に追加し、`supabase/schema.sql` も更新する
- `.env*` は読まない・コミットしない

## デプロイ
Vercel

## コミット規約
Conventional Commits + 日本語本文（例: `fix: 予約フォームの時刻表示崩れを修正`）
