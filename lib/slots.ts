import type { Reservation, Slot, SlotType } from "./types";

export const SLOT_MINUTES = 30;

/** "HH:MM" / "HH:MM:SS" → 分(0-1439)。不正値は null。 */
export function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** 分 → "HH:MM" */
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "HH:MM:SS" や "HH:MM" を "HH:MM" に正規化 */
export function normalizeTime(time: string | null | undefined): string {
  const min = toMinutes(time);
  return min === null ? "" : fromMinutes(min);
}

/**
 * 在廊時間（start〜end）を30分刻みで枠生成する。
 * 枠タイプはインデックスの偶奇で交互に割り当て（偶数=予約枠 / 奇数=当日枠）、
 * 「予約枠50%・当日枠50%の混在（完全予約制にしない）」を満たす。
 *
 * reservations を渡すと、該当開始時刻の枠を booked=true にする。
 */
export function buildSlots(
  availableStart: string | null | undefined,
  availableEnd: string | null | undefined,
  reservations: Reservation[] = []
): Slot[] {
  const start = toMinutes(availableStart);
  const end = toMinutes(availableEnd);
  if (start === null || end === null || end <= start) return [];

  const bookedByStart = new Map<string, Reservation>();
  for (const r of reservations) {
    bookedByStart.set(normalizeTime(r.start_time), r);
  }

  const slots: Slot[] = [];
  let i = 0;
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES, i++) {
    const startStr = fromMinutes(t);
    const type: SlotType = i % 2 === 0 ? "reserved_quota" : "walkin";
    const reservation = bookedByStart.get(startStr);
    slots.push({
      start: startStr,
      end: fromMinutes(t + SLOT_MINUTES),
      type,
      booked: Boolean(reservation),
      visitorName: reservation?.visitor_name ?? null,
    });
  }
  return slots;
}

/** 指定した開始時刻の枠がオンライン予約可能（予約枠 かつ 空き）か検証する */
export function isBookable(
  availableStart: string | null | undefined,
  availableEnd: string | null | undefined,
  startTime: string,
  reservations: Reservation[] = []
): boolean {
  const target = normalizeTime(startTime);
  const slot = buildSlots(availableStart, availableEnd, reservations).find((s) => s.start === target);
  return Boolean(slot && slot.type === "reserved_quota" && !slot.booked);
}
