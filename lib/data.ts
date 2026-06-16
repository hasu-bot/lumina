import { getPublicClient, getServiceClient } from "./supabase";
import type { Model, PublicModel, Reservation } from "./types";

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

/** 運営管理用: 全モデル（パスコード含む特権取得） */
export async function getAllModelsAdmin(): Promise<Model[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("models").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`モデル一覧（運営）の取得に失敗: ${error.message}`);
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
