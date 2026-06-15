import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `環境変数 ${name} が未設定です。.env.local を作成し Supabase のキーを設定してください（.env.local.example 参照）。`
    );
  }
  return value;
}

/**
 * 公開読み取り用クライアント（anonキー / RLS適用）。
 * サーバー・ブラウザどちらからでも利用可。
 */
export function getPublicClient(): SupabaseClient {
  return createClient(assertEnv(url, "NEXT_PUBLIC_SUPABASE_URL"), assertEnv(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
}

/**
 * サーバー専用の特権クライアント（service roleキー / RLSバイパス）。
 * 予約作成・ステータス変更・モデル登録など書き込みに使用。
 * このキーはクライアントへ絶対に渡さないこと。
 */
export function getServiceClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getServiceClient はサーバー専用です。");
  }
  return createClient(assertEnv(url, "NEXT_PUBLIC_SUPABASE_URL"), assertEnv(serviceKey, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}
