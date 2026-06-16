export type ModelStatus = "active" | "break" | "closed";

export const STATUS_LABEL: Record<ModelStatus, string> = {
  active: "参加中",
  break: "休憩中",
  closed: "受付終了",
};

export interface Model {
  id: string;
  name: string;
  agency: string; // 所属事務所（必須）
  instagram: string | null;
  genre: string | null;
  profile: string | null;
  photo_url: string | null;
  fee: string | null;
  available_start: string | null; // "HH:MM" or "HH:MM:SS"
  available_end: string | null;
  status: ModelStatus;
  is_active: boolean;
  passcode: string; // モデル管理画面ログイン用（運営のみ取得）
  creator_type: string; // 将来拡張用。MVPは "model"
  created_at: string;
}

/** 公開向け（パスコードを含めない）モデル型 */
export type PublicModel = Omit<Model, "passcode">;

export interface Reservation {
  id: string;
  model_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM" or "HH:MM:SS"
  visitor_name: string;
  created_at: string;
}

export type SlotType = "reserved_quota" | "walkin";

export interface Slot {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  type: SlotType; // 予約枠 / 当日枠
  booked: boolean; // 予約済みか
  visitorName?: string | null; // 管理画面でのみ使用
}
