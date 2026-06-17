"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";
import { getReservations } from "@/lib/data";
import { isBookable, normalizeTime } from "@/lib/slots";
import { todayJST } from "@/lib/date";
import { notifyReservation } from "@/lib/notify";
import type { Model } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * 来場者の予約作成。名前のみで予約可能。
 * - 対象が「予約枠」かつ空きであることをサーバー側で再検証
 * - DBのユニーク制約(model_id,date,start_time)で二重予約を防止
 */
export async function createReservation(formData: FormData): Promise<ActionResult> {
  const modelId = String(formData.get("modelId") ?? "").trim();
  const startTime = normalizeTime(String(formData.get("startTime") ?? ""));
  const visitorName = String(formData.get("visitorName") ?? "").trim();

  if (!modelId || !startTime) return { ok: false, message: "リクエスト情報が不正です。" };
  if (!visitorName) return { ok: false, message: "お名前を入力してください。" };
  if (visitorName.length > 40) return { ok: false, message: "お名前が長すぎます。" };

  const supabase = getServiceClient();
  const date = todayJST();

  const { data: model, error: modelErr } = await supabase
    .from("models")
    .select("id,name,available_start,available_end,status,is_active")
    .eq("id", modelId)
    .maybeSingle();
  if (modelErr || !model) return { ok: false, message: "モデルが見つかりません。" };

  const m = model as Pick<Model, "id" | "name" | "available_start" | "available_end" | "status" | "is_active">;
  if (!m.is_active || m.status !== "active") {
    return { ok: false, message: "現在このモデルは撮影リクエストを受け付けていません。" };
  }

  const existing = await getReservations(modelId, date);
  if (!isBookable(m.available_start, m.available_end, startTime, existing)) {
    return { ok: false, message: "その枠はリクエストできません（当日枠またはリクエスト済みです）。" };
  }

  const { error: insertErr } = await supabase.from("reservations").insert({
    model_id: modelId,
    date,
    start_time: startTime,
    visitor_name: visitorName,
  });

  if (insertErr) {
    // 23505 = unique_violation（同時リクエストの競合）
    if ((insertErr as { code?: string }).code === "23505") {
      return { ok: false, message: "申し訳ありません。今その枠はリクエストされました。" };
    }
    return { ok: false, message: `リクエストに失敗しました: ${insertErr.message}` };
  }

  // 運営へメール通知（未設定/失敗でも予約は成立させる）
  await notifyReservation({ modelName: m.name, visitorName, startTime, date });

  revalidatePath(`/models/${modelId}`);
  revalidatePath("/m/dashboard");
  return { ok: true, message: `${startTime} の枠に撮影リクエストを送りました。` };
}
