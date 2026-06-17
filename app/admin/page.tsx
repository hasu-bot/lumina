import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { ModelRegisterForm } from "@/components/ModelRegisterForm";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminPhotoUploadForm } from "@/components/AdminPhotoUploadForm";
import { getAllModelsAdmin, getPendingModelsAdmin } from "@/lib/data";
import { isAdmin } from "@/lib/session";
import { adminLogout, setModelActive, updateModelSettings, approveModel, rejectModel } from "@/app/actions/admin";
import { normalizeTime } from "@/lib/slots";
import { STATUS_LABEL, type Model, type ModelStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: ModelStatus[] = ["active", "break", "closed"];

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let models: Model[] = [];
  let pendingModels: Model[] = [];
  let loadError: string | null = null;
  try {
    [models, pendingModels] = await Promise.all([getAllModelsAdmin(), getPendingModelsAdmin()]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "取得に失敗しました。";
  }

  return (
    <section className="section">
      <div className="container">
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1 className="section__title">運営管理</h1>
            <p className="section__sub">モデル登録・参加管理・対応時間/撮影条件設定</p>
          </div>
          <form action={adminLogout}>
            <button className="btn btn--ghost btn--sm" type="submit">
              ログアウト
            </button>
          </form>
        </div>

        {loadError ? <div className="alert alert--err">{loadError}</div> : null}

        {/* 承認待ちモデル */}
        {pendingModels.length > 0 ? (
          <div className="panel" style={{ borderLeft: "4px solid #f59e0b", marginBottom: 24 }}>
            <h2 className="panel__title">承認待ちの参加申請（{pendingModels.length}件）</h2>
            <div className="stack-sm">
              {pendingModels.map((m) => (
                <PendingModelRow key={m.id} model={m} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="detail" style={{ "--detail-cols": "380px 1fr" } as CSSProperties}>
          {/* モデル登録 */}
          <div className="panel">
            <h2 className="panel__title">モデル登録</h2>
            <ModelRegisterForm />
          </div>

          {/* 登録済みモデル管理 */}
          <div>
            <div className="panel">
              <h2 className="panel__title">登録済みモデル（{models.length}名）</h2>
              {models.length === 0 ? (
                <p className="muted">まだモデルが登録されていません。</p>
              ) : (
                <div className="stack-sm">
                  {models.map((m) => (
                    <ModelAdminRow key={m.id} model={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PendingModelRow({ model }: { model: Model }) {
  return (
    <div style={{ border: "1px solid #fbbf24", borderRadius: 10, padding: 14, background: "#fffbeb" }}>
      <div className="meta-row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <strong>{model.name}</strong>
          <div className="card__agency">所属：{model.agency}</div>
          {model.genre ? <div className="muted" style={{ fontSize: "0.82rem" }}>{model.genre}</div> : null}
          {model.fee ? <div className="muted" style={{ fontSize: "0.82rem" }}>撮影条件：{model.fee}</div> : null}
          {model.profile ? <div className="muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>{model.profile}</div> : null}
          <div className="muted" style={{ fontSize: "0.76rem", marginTop: 4 }}>パスコード：<code>{model.passcode}</code>（本人に伝えてください）</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <form action={approveModel}>
            <input type="hidden" name="id" value={model.id} />
            <button className="btn btn--sm" type="submit">承認して公開</button>
          </form>
          <form action={rejectModel}>
            <input type="hidden" name="id" value={model.id} />
            <button className="btn btn--ghost btn--sm" type="submit" style={{ color: "#ef4444" }}>却下</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModelAdminRow({ model }: { model: Model }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 14 }}>
      <div className="meta-row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>{model.name}</strong> <StatusBadge status={model.status} />
          <div className="card__agency">所属：{model.agency}</div>
        </div>
        {/* 参加 / 非参加トグル */}
        <form action={setModelActive}>
          <input type="hidden" name="id" value={model.id} />
          <input type="hidden" name="is_active" value={(!model.is_active).toString()} />
          <button className={`btn btn--sm ${model.is_active ? "btn--ghost" : ""}`} type="submit">
            {model.is_active ? "非参加にする" : "参加にする"}
          </button>
        </form>
      </div>

      {/* 対応時間・撮影条件・ステータス設定 */}
      <form action={updateModelSettings} className="btn-row" style={{ alignItems: "flex-end", marginTop: 10 }}>
        <input type="hidden" name="id" value={model.id} />
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>開始</label>
          <input name="available_start" type="time" defaultValue={normalizeTime(model.available_start)} />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>終了</label>
          <input name="available_end" type="time" defaultValue={normalizeTime(model.available_end)} />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>ステータス</label>
          <select name="status" defaultValue={model.status}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: 1.4, marginBottom: 0 }}>
          <label>撮影条件</label>
          <input name="fee" type="text" defaultValue={model.fee ?? ""} placeholder="30分 ¥3,000 ／ 要相談 ／ 相互無償歓迎" />
        </div>
        <div className="field" style={{ flex: 1.4, marginBottom: 0 }}>
          <label>通知用メール</label>
          <input name="email" type="email" defaultValue={model.email ?? ""} placeholder="撮影リクエスト時に通知" />
        </div>
        <button className="btn btn--sm" type="submit">
          保存
        </button>
      </form>

      {/* 写真の代理アップロード（モデルがログインできない等のトラブル時用） */}
      <div style={{ marginTop: 10 }}>
        <AdminPhotoUploadForm modelId={model.id} />
      </div>
      <p className="muted" style={{ fontSize: "0.74rem", marginTop: 6 }}>
        パスコード：<code>{model.passcode}</code>（モデルに伝えてください）
      </p>
    </div>
  );
}
