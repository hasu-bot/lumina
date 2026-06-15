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
