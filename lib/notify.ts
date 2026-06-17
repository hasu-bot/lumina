import "server-only";

/**
 * 撮影リクエスト（予約）が入った時にメール通知する。
 * 宛先は「モデル本人（models.email）」と「運営（NOTIFY_EMAIL）」の両方
 * （設定されているものだけ）。
 *
 * Resend (https://resend.com) のHTTP APIを直接呼ぶ（追加依存なし）。
 * 必要な環境変数:
 *   RESEND_API_KEY … Resend のAPIキー（必須。無ければ送信しない）
 *   NOTIFY_EMAIL   … 運営の通知先メールアドレス（任意）
 *   NOTIFY_FROM    … 差出人（任意。既定は Resend の検証不要アドレス）
 *
 * 宛先が1つも無い／APIキーが無いなら何もしない（予約自体は成立させる）。
 * 送信失敗も握りつぶしてログのみ（予約フローを止めない）。
 */
interface ReservationNotice {
  modelName: string;
  modelEmail?: string | null;
  visitorName: string;
  startTime: string;
  date: string;
}

export async function notifyReservation(notice: ReservationNotice): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || "lumina <onboarding@resend.dev>";

  // モデル本人 + 運営、設定されているものだけを宛先に（重複は除く）
  const recipients = Array.from(
    new Set([notice.modelEmail, process.env.NOTIFY_EMAIL].filter((v): v is string => !!v && v.includes("@")))
  );
  if (!apiKey || recipients.length === 0) return;

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
      body: JSON.stringify({ from, to: recipients, subject, text }),
    });
    if (!res.ok) {
      console.error("notifyReservation failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("notifyReservation error:", e);
  }
}
