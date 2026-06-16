"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { isAdmin, loginAdmin, logoutAdmin } from "@/lib/session";
import { normalizeTime } from "@/lib/slots";
import type { ModelStatus } from "@/lib/types";

export async function adminLogin(formData: FormData): Promise<{ ok: false; message: string } | void> {
  const passcode = String(formData.get("passcode") ?? "");
  if (!(await loginAdmin(passcode))) return { ok: false, message: "運営パスコードが正しくありません。" };
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await logoutAdmin();
  redirect("/admin/login");
}

/** 申請中モデルを承認して公開状態にする */
export async function approveModel(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("models")
    .update({ registration_status: "approved", is_active: true, status: "active" })
    .eq("id", id);
  if (error) throw new Error(`承認に失敗しました: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/");
}

/** 申請中モデルを却下して削除する */
export async function rejectModel(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getServiceClient();
  const { error } = await supabase.from("models").delete().eq("id", id);
  if (error) throw new Error(`却下に失敗しました: ${error.message}`);

  revalidatePath("/admin");
}

/** モデル新規登録（運営）。所属事務所は必須。 */
export async function createModel(formData: FormData): Promise<{ ok: false; message: string } | void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const agency = String(formData.get("agency") ?? "").trim();
  const passcode = String(formData.get("passcode") ?? "").trim();

  if (!name) return { ok: false, message: "名前は必須です。" };
  if (!agency) return { ok: false, message: "所属事務所は必須です。" };
  if (!passcode) return { ok: false, message: "モデル用パスコードは必須です。" };

  const start = normalizeTime(String(formData.get("available_start") ?? "")) || null;
  const end = normalizeTime(String(formData.get("available_end") ?? "")) || null;

  const supabase = getServiceClient();
  const { error } = await supabase.from("models").insert({
    name,
    agency,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    genre: String(formData.get("genre") ?? "").trim() || null,
    profile: String(formData.get("profile") ?? "").trim() || null,
    photo_url: String(formData.get("photo_url") ?? "").trim() || null,
    fee: String(formData.get("fee") ?? "").trim() || null,
    available_start: start,
    available_end: end,
    passcode,
    status: "active",
    is_active: true,
  });

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, message: "そのパスコードは既に使われています。別の値にしてください。" };
    }
    return { ok: false, message: `登録に失敗しました: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

/** 参加/非参加トグル（運営） */
export async function setModelActive(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!id) return;

  const supabase = getServiceClient();
  const { error } = await supabase.from("models").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`参加状態の更新に失敗: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/");
}

/** 対応時間・料金の更新（運営） */
export async function updateModelSettings(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = String(formData.get("status") ?? "") as ModelStatus;
  const patch: Record<string, unknown> = {
    available_start: normalizeTime(String(formData.get("available_start") ?? "")) || null,
    available_end: normalizeTime(String(formData.get("available_end") ?? "")) || null,
    fee: String(formData.get("fee") ?? "").trim() || null,
  };
  if (["active", "break", "closed"].includes(status)) patch.status = status;

  const supabase = getServiceClient();
  const { error } = await supabase.from("models").update(patch).eq("id", id);
  if (error) throw new Error(`設定の更新に失敗: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/models/${id}`);
}

const PHOTOS_BUCKET = "photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB（ブラウザ側で圧縮済みのものを想定した安全弁）

/** モデルがログインできない等のトラブル時、運営が代理で写真をアップロード */
export async function adminUploadModelPhoto(formData: FormData): Promise<{ ok: false; message: string } | void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "モデルIDが不正です。" };

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
  const path = `${id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getServiceClient();
  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (uploadError) return { ok: false, message: `アップロードに失敗しました: ${uploadError.message}` };

  const { data: urlData } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase.from("models").update({ photo_url: urlData.publicUrl }).eq("id", id);
  if (updateError) return { ok: false, message: `写真の登録に失敗しました: ${updateError.message}` };

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/models/${id}`);
}
