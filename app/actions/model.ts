"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { getModelSession, loginModelByPasscode, logoutModel } from "@/lib/session";
import type { ModelStatus } from "@/lib/types";

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
