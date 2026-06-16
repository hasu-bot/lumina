import { redirect } from "next/navigation";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StatusBadge } from "@/components/StatusBadge";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";
import { AvailabilityForm } from "@/components/AvailabilityForm";
import { getServiceClient } from "@/lib/supabase";
import { getReservations } from "@/lib/data";
import { getModelSession } from "@/lib/session";
import { setModelStatus, modelLogout } from "@/app/actions/model";
import { buildSlots, normalizeTime } from "@/lib/slots";
import { todayJST } from "@/lib/date";
import { STATUS_LABEL, type Model, type ModelStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_ORDER: ModelStatus[] = ["active", "break", "closed"];

export default async function ModelDashboardPage() {
  const sessionId = await getModelSession();
  if (!sessionId) redirect("/m/login");

  const supabase = getServiceClient();
  const { data } = await supabase.from("models").select("*").eq("id", sessionId).maybeSingle();
  const model = data as Model | null;
  if (!model) redirect("/m/login");

  const date = todayJST();
  const reservations = await getReservations(model.id, date);
  const slots = buildSlots(model.available_start, model.available_end, reservations);
  const now = Date.now();

  const start = normalizeTime(model.available_start);
  const end = normalizeTime(model.available_end);

  return (
    <section className="section">
      <AutoRefresh seconds={15} />
      <div className="container">
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1 className="section__title">{model.name} さんの管理画面</h1>
            <p className="section__sub">所属：{model.agency} ／ 本日 {date}</p>
          </div>
          <form action={modelLogout}>
            <button className="btn btn--ghost btn--sm" type="submit">
              ログアウト
            </button>
          </form>
        </div>

        {/* 写真アップロード */}
        <PhotoUploadForm currentPhotoUrl={model.photo_url} />

        {/* 在廊時間の変更 */}
        <AvailabilityForm currentStart={normalizeTime(model.available_start)} currentEnd={normalizeTime(model.available_end)} />

        {/* ステータス切替 */}
        <div className="panel">
          <h2 className="panel__title">
            ステータス切替 <StatusBadge status={model.status} />
          </h2>
          <div className="btn-row">
            {STATUS_ORDER.map((s) => (
              <form action={setModelStatus} key={s}>
                <input type="hidden" name="status" value={s} />
                <button className={`btn ${model.status === s ? "" : "btn--ghost"}`} type="submit" disabled={model.status === s}>
                  {STATUS_LABEL[s]}
                </button>
              </form>
            ))}
          </div>
          <p className="muted" style={{ fontSize: "0.78rem", marginTop: 10 }}>
            「参加中」のときのみ、一覧表示・オンラインでの撮影リクエストが有効になります。
          </p>
        </div>

        {/* 本日の撮影リクエスト一覧 */}
        <div className="panel">
          <h2 className="panel__title">本日の撮影リクエスト一覧（{reservations.length}件）</h2>
          {reservations.length === 0 ? (
            <p className="muted">まだリクエストはありません。</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>時間</th>
                  <th>リクエスト者名</th>
                  <th style={{ width: 90 }} />
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const isNew = now - new Date(r.created_at).getTime() < 60_000;
                  return (
                    <tr key={r.id} className={isNew ? "row-new" : undefined}>
                      <td>{normalizeTime(r.start_time)}</td>
                      <td>{r.visitor_name} 様</td>
                      <td>{isNew ? <span className="badge badge--active">NEW</span> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="muted" style={{ fontSize: "0.76rem", marginTop: 10 }}>
            この画面は15秒ごとに自動更新され、新しいリクエストは「NEW」で表示されます。
          </p>
        </div>

        {/* 空き状況 */}
        <div className="panel">
          <h2 className="panel__title">空き状況</h2>
          {slots.length === 0 ? (
            <p className="muted">
              対応時間が未設定です。{start && end ? "" : "運営に在廊時間の設定を依頼してください。"}
            </p>
          ) : (
            <div className="slots">
              {slots.map((slot) => (
                <div
                  key={slot.start}
                  className={`slot ${slot.booked ? "slot--booked" : slot.type === "walkin" ? "slot--walkin" : "slot--open"}`}
                >
                  <div className="slot__time">
                    {slot.start}–{slot.end}
                  </div>
                  <div className="slot__state">
                    {slot.booked ? `× ${slot.visitorName ?? "リクエスト済"}` : slot.type === "walkin" ? "当日枠" : "○ 空き"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
