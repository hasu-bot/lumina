-- =====================================================================
-- YOLO写真映像展「lumina」 マッチングシステム スキーマ
-- Supabase の SQL Editor にこのファイルを貼り付けて実行してください。
-- =====================================================================

-- ---- models（モデル / 将来はクリエイター全般） ----
create table if not exists public.models (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  agency          text not null,                 -- 所属事務所（必須・表示必須）
  instagram       text,
  genre           text,
  profile         text,
  photo_url       text,
  email           text,                           -- モデル本人への撮影リクエスト通知用（非公開）
  fee             text,                           -- 料金（自由記述: 例「30分 ¥3,000」）
  available_start time,                           -- 在廊/対応 開始
  available_end   time,                           -- 在廊/対応 終了
  status          text not null default 'active'  -- active=参加中 / break=休憩中 / closed=受付終了
                    check (status in ('active', 'break', 'closed')),
  is_active       boolean not null default true,  -- 運営の参加/非参加管理（本日出展するか）
  passcode        text not null,                  -- モデル管理画面ログイン用 簡易パスコード
  creator_type    text not null default 'model',  -- 将来拡張用（model/photographer/designer…）
  created_at      timestamptz not null default now()
);

-- パスコードはユニーク（ログイン時の一意特定 & 取り違え防止）
create unique index if not exists models_passcode_key on public.models (passcode);
create index if not exists models_visible_idx on public.models (is_active, status);

-- ---- reservations（予約） ----
create table if not exists public.reservations (
  id           uuid primary key default gen_random_uuid(),
  model_id     uuid not null references public.models (id) on delete cascade,
  date         date not null,                     -- 予約日（当日運用）
  start_time   time not null,                     -- 30分枠の開始時刻
  visitor_name text not null,
  created_at   timestamptz not null default now(),
  -- 同一モデル・同一日・同一開始時刻の二重予約を防止
  unique (model_id, date, start_time)
);

create index if not exists reservations_lookup_idx on public.reservations (model_id, date);

-- =====================================================================
-- RLS（Row Level Security）
--  - 公開読み取りを許可（一覧・空き状況の表示に必要）
--  - 書き込みはサーバーの service role（RLSバイパス）からのみ行う
-- =====================================================================
alter table public.models enable row level security;
alter table public.reservations enable row level security;

drop policy if exists models_public_read on public.models;
create policy models_public_read on public.models for select using (true);

drop policy if exists reservations_public_read on public.reservations;
create policy reservations_public_read on public.reservations for select using (true);

-- パスコード・メールは公開ロールから読めないよう列単位で権限を絞る
-- （service role は所有者権限で引き続き読める）
revoke select (passcode) on public.models from anon, authenticated;
revoke select (email) on public.models from anon, authenticated;

-- realtime（モデル管理画面の自動反映を Realtime でも使いたい場合に有効化）
-- alter publication supabase_realtime add table public.reservations;
