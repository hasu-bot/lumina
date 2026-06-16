-- =====================================================================
-- Migration 001: モデル自己登録フロー用 registration_status カラム追加
-- Supabase SQL Editor で実行してください
-- =====================================================================

alter table public.models
  add column if not exists registration_status text not null default 'approved'
    check (registration_status in ('pending', 'approved'));

-- 既存モデルは全員 approved 扱い（default により自動適用）

-- 承認待ちモデルは一覧に出さない（is_active=false との二重ガード）
-- インデックス更新
drop index if exists models_visible_idx;
create index if not exists models_visible_idx
  on public.models (is_active, status, registration_status);

-- スキーマキャッシュ再読み込み
notify pgrst, 'reload schema';
