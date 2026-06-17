-- =====================================================================
-- Migration 002: モデル本人への通知用 email カラム追加
-- Supabase SQL Editor で実行してください
-- =====================================================================

alter table public.models
  add column if not exists email text;

-- email は公開ロールから読めないように列単位で権限を絞る
-- （service role は所有者権限で引き続き読める）
revoke select (email) on public.models from anon, authenticated;

-- スキーマキャッシュ再読み込み
notify pgrst, 'reload schema';
