"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { getModelSession, loginModelByPasscode, logoutModel } from "@/lib/session";
import { isMissingColumnError } from "@/lib/data";
import { normalizeTime } from "@/lib/slots";
import type { ModelStatus } from "@/lib/types";

/** ランダム6文字パスコード生成 */
function generatePasscode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** モデル自己登録申請。承認待ち状態で登録され、運営承認後に公開される。 */
export async function submitModelRegistration(
  formData: FormData
): Promise<{ ok: boolean; message: string; passcode?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const agency = String(formData.get("agency") ?? "").trim();
  if (!name) return { ok: false, message: "名前は必須です。" };
  if (!agency) return { ok: false, message: "所属事務所は必須です。" };

  const start = normalizeTime(String(formData.get("available_start") ?? "")) || null;
  const end = normalizeTime(String(formData.get("available_end") ?? "")) || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  const passcode = generatePasscode();
  const baseRow = {
    name,
    agency,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    genre: String(formData.get("genre") ?? "").trim() || null,
    profile: String(formData.get("profile") ?? "").trim() || null,
    fee: String(formData.get("fee") ?? "").trim() || null,
    available_start: start,
    available_end: end,
    passcode,
    status: "closed",
    is_active: false,
  };

  const supabase = getServiceClient();
  let { error } = await supabase
    .from("models")
    .insert({ ...baseRow, registration_status: "pending", email });
  // registration_status(001) / email(002) 列が未追加の環境では、存在する列だけで申請
  if (
    error &&
    (isMissingColumnError(error, "registration_status") || isMissingColumnError(error, "email"))
  ) {
    ({ error } = await supabase.from("models").insert(baseRow));
  }

  if (error) return { ok: false, message: `申請に失敗しました: ${error.message}` };

  revalidatePath("/admin");
  return { ok: true, message: "申請を受け付けました。運営の承認をお待ちください。", passcode };
}

/** ログイン中モデルが自分の在廊時間を変更 */
export async function updateModelAvailability(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const sessionId = await getModelSession();
  if (!sessionId) redirect("/m/login");

  const start = normalizeTime(String(formData.get("available_start") ?? "")) || null;
  const end = normalizeTime(String(formData.get("available_end") ?? "")) || null;

  if (!start || !end) return { ok: false, message: "開始・終了時間を両方入力してください。" };
  if (start >= end) return { ok: false, message: "終了時間は開始時間より後にしてください。" };

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("models")
    .update({ available_start: start, available_end: end })
    .eq("id", sessionId);
  if (error) return { ok: false, message: `更新に失敗しました: ${error.message}` };

  revalidatePath("/m/dashboard");
  revalidatePath("/");
  revalidatePath(`/models/${sessionId}`);
  return { ok: true, message: "在廊時間を更新しました。" };
}

const VALID_STATUS: ModelStatus[] = ["active", "break", "closed"];

/** モデルログイン（パスコード）。成功でダッシュボードへ。 */
export async function modelLogin(formData: FormData): Promise<{ ok: false; message: string } | void> {
  const passcode = String(formData.get("passcode") ?? "");
  const id = await loginModelByPasscode(passcode);
  if (!id) return { ok: false, message: "パスコードが正しくありません。" };
  redirect("/m/dashboard");
}

export async function modelLogout(): Promise<void> {
  await logoutModel();
  redirect("/m/login");
}

/** ログイン中モデル自身のステータス切替（参加中/休憩中/受付終了） */
export async function setModelStatus(formData: FormData): Promise<void> {
  const sessionId = await getModelSession();
  if (!sessionId) redirect("/m/login");

  const status = String(formData.get("status") ?? "") as ModelStatus;
  if (!VALID_STATUS.includes(status)) return;

  const supabase = getServiceClient();
  const { error } = await supabase.from("models").update({ status }).eq("id", sessionId);
  if (error) throw new Error(`ステータス更新に失敗: ${error.message}`);

  revalidatePath("/m/dashboard");
  revalidatePath("/");
  revalidatePath(`/models/${sessionId}`);
}

const PHOTOS_BUCKET = "photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB（ブラウザ側で圧縮済みのものを想定した安全弁）

/** ログイン中モデル自身の写真アップロード（ブラウザ側で圧縮済みの画像を受け取る） */
export async function uploadModelPhoto(formData: FormData): Promise<{ ok: false; message: string } | void> {
  const sessionId = await getModelSession();
  if (!sessionId) redirect("/m/login");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "画像ファイルを選択してください。" };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, message: "画像サイズが大きすぎます（5MB以下にしてください）。" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "画像ファイルを選択してください。" };
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${sessionId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getServiceClient();
  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (uploadError) return { ok: false, message: `アップロードに失敗しました: ${uploadError.message}` };

  const { data: urlData } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("models")
    .update({ photo_url: urlData.publicUrl })
    .eq("id", sessionId);
  if (updateError) return { ok: false, message: `写真の登録に失敗しました: ${updateError.message}` };

  revalidatePath("/m/dashboard");
  revalidatePath("/");
  revalidatePath(`/models/${sessionId}`);
}
