import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getServiceClient } from "./supabase";

const MODEL_COOKIE = "lumina_model";
const ADMIN_COOKIE = "lumina_admin";
const MAX_AGE = 60 * 60 * 12; // 12時間（イベント当日運用想定）

function secret(): string {
  return process.env.SESSION_SECRET || "lumina-dev-secret-change-me";
}

/** 値を HMAC 署名して "value.signature" 形式にする */
function sign(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

/** 署名付き文字列を検証し、正しければ元の value を返す */
function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx <= 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return null;
    return timingSafeEqual(a, b) ? value : null;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

// ---- モデルセッション ----

/**
 * パスコードからモデルを照合し、成功すればセッションcookieを発行する。
 * 戻り値: ログインできたモデルID（失敗時 null）。
 */
export async function loginModelByPasscode(passcode: string): Promise<string | null> {
  const code = passcode.trim();
  if (!code) return null;
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("models").select("id").eq("passcode", code).limit(1).maybeSingle();
  if (error || !data) return null;
  (await cookies()).set(MODEL_COOKIE, sign(data.id), cookieOptions);
  return data.id as string;
}

/** ログイン中モデルのIDを返す（未ログインは null） */
export async function getModelSession(): Promise<string | null> {
  return verify((await cookies()).get(MODEL_COOKIE)?.value);
}

export async function logoutModel(): Promise<void> {
  (await cookies()).delete(MODEL_COOKIE);
}

// ---- 運営（admin）セッション ----

export async function loginAdmin(passcode: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSCODE || "";
  if (!expected || passcode.trim() !== expected) return false;
  (await cookies()).set(ADMIN_COOKIE, sign("admin"), cookieOptions);
  return true;
}

export async function isAdmin(): Promise<boolean> {
  return verify((await cookies()).get(ADMIN_COOKIE)?.value) === "admin";
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
