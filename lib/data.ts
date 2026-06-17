import { getPublicClient, getServiceClient } from "./supabase";
import type { Model, PublicModel, Reservation } from "./types";

/**
 * マイグレーション未適用などで指定カラムが存在しない場合のエラーか判定する。
 * （列追加前でも email を含む書き込みをフォールバックさせるために使う）
 */
export function isMissingColumnError(
  error: { code?: string; message?: string } | null | undefined,
  column: string
): boolean {
  if (!error) return false;
  if (error.code === "PGRST204") return true; // schema cache に列が無い
  if (error.code === "42703") return true; // undefined_column
  return (error.message ?? "").includes(column);
}

const PUBLIC_FIELDS =
  "id,name,agency,instagram,genre,profile,photo_url,fee,available_start,available_end,status,is_active,creator_type,created_at";

/** 公開一覧: 本日参加中（is_active=true かつ status='active'）のモデルのみ */
export async function getParticipatingModels(): Promise<PublicModel[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("models")
    .select(PUBLIC_FIELDS)
    .eq("is_active", true)
    .eq("status", "active")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`モデル一覧の取得に失敗: ${error.message}`);
  return (data ?? []) as PublicModel[];
}

/** 詳細ページ用: 1モデル取得（非公開でも取得し、ページ側で表示可否を判断） */
export async function getModelById(id: string): Promise<PublicModel | null> {
  const supabase = getPublicClient();
  const { data, error } = await supabase.from("models").select(PUBLIC_FIELDS).eq("id", id).maybeSingle();
  if (error) throw new Error(`モデル取得に失敗: ${error.message}`);
  return (data as PublicModel) ?? null;
}

/** 運営管理用: 承認済みモデル一覧（パスコード含む特権取得） */
export async function getAllModelsAdmin(): Promise<Model[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("registration_status", "approved")
    .order("created_at", { ascending: true });
  if (error) {
    // registration_status 列が未追加(migration 001 未適用)なら全件返す
    if (isMissingColumnError(error, "registration_status")) {
      const { data: all, error: e2 } = await supabase
        .from("models")
        .select("*")
        .order("created_at", { ascending: true });
      if (e2) throw new Error(`モデル一覧（運営）の取得に失敗: ${e2.message}`);
      return (all ?? []) as Model[];
    }
    throw new Error(`モデル一覧（運営）の取得に失敗: ${error.message}`);
  }
  return (data ?? []) as Model[];
}

/** 運営管理用: 承認待ちモデル一覧 */
export async function getPendingModelsAdmin(): Promise<Model[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("registration_status", "pending")
    .order("created_at", { ascending: true });
  if (error) {
    // 列が未追加なら「承認待ち」概念が無いので空配列を返す
    if (isMissingColumnError(error, "registration_status")) return [];
    throw new Error(`申請中モデル一覧の取得に失敗: ${error.message}`);
  }
  return (data ?? []) as Model[];
}

/** 指定モデル・指定日の予約一覧 */
export async function getReservations(modelId: string, date: string): Promise<Reservation[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("model_id", modelId)
    .eq("date", date)
    .order("start_time", { ascending: true });
  if (error) throw new Error(`予約一覧の取得に失敗: ${error.message}`);
  return (data ?? []) as Reservation[];
}
