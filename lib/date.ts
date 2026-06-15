/**
 * 会場運用は日本時間（Asia/Tokyo）基準。
 * サーバーのタイムゾーンに依存せず「今日」の日付(YYYY-MM-DD)を返す。
 */
export function todayJST(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  // en-CA は "YYYY-MM-DD" 形式
  return parts;
}
