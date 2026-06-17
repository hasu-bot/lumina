import "server-only";

/**
 * 撮影リクエスト（予約）が入った時に運営へメール通知する。
 *
 * Resend (https://resend.com) のHTTP APIを直接呼ぶ（追加依存なし）。
 * 必要な環境変数:
 *   RESEND_API_KEY … Resend のAPIキー
 *   NOTIFY_EMAIL   … 通知先メールアドレス（運営）
 *   NOTIFY_FROM    … 差出人（任意。既定は Resend の検証不要アドレス）
 *
 * いずれか未設定なら何もしない（通知が無くても予約自体は成立させる）。
 * 送信失敗も握りつぶしてログのみ（予約フローを止めない）。
 */
interface ReservationNotice {
  modelName: string;
  visitorName: string;
  startTime: string;
  date: string;
}

export async function notifyReservation(notice: ReservationNotice): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM || "lumina <onboarding@resend.dev>";
  if (!apiKey || !to) return;

  const subject = `【lumina】撮影リクエスト: ${notice.modelName} ${notice.startTime}`;
  const text = [
    "新しい撮影リクエストが入りました。",
    "",
    `モデル　：${notice.modelName}`,
    `リクエスト者：${notice.visitorName} 様`,
    `日時　　：${notice.date} ${notice.startTime}`,
    "",
    "モデル管理画面でご確認ください。",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) {
      console.error("notifyReservation failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("notifyReservation error:", e);
  }
}
