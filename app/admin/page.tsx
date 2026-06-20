import { redirect } from "next/navigation";
import { ModelRegisterForm } from "@/components/ModelRegisterForm";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { getAllModelsAdmin } from "@/lib/data";
import { isAdmin } from "@/lib/session";
import { adminLogout, setModelActive, updateModelSettings } from "@/app/actions/admin";
import { normalizeTime } from "@/lib/slots";
import { STATUS_LABEL, type Model, type ModelStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: ModelStatus[] = ["active", "break", "closed"];

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let models: Model[] = [];
  let loadError: string | null = null;
  try {
    models = await getAllModelsAdmin();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "取得に失敗しました。";
  }

  return (
    <section className="section">
      <div className="container">
        <div className="meta-row" style={{ justifyContent: "space-between" }}>
          <div>
            <h1 className="section__title">運営管理</h1>
            <p className="section__sub">モデル登録・参加管理・対応時間/料金設定</p>
          </div>
          <form action={adminLogout}>
            <button className="btn btn--ghost btn--sm" type="submit">
              ログアウト
            </button>
          </form>
        </div>

        {loadError ? <div className="alert alert--err">{loadError}</div> : null}

        <div className="detail" style={{ gridTemplateColumns: "380px 1fr" }}>
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
                <div className="empty">
                  まだモデルが登録されていません
                  <span className="empty__sub">左のフォームから最初のモデルを登録してください。</span>
                </div>
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

function ModelAdminRow({ model }: { model: Model }) {
  return (
    <div className="admin-row">
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

      {/* 対応時間・料金・ステータス設定 */}
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
          <label>料金</label>
          <input name="fee" type="text" defaultValue={model.fee ?? ""} placeholder="30分 ¥3,000" />
        </div>
        <button className="btn btn--sm" type="submit">
          保存
        </button>
      </form>
      <div className="code-row">
        <span className="muted" style={{ fontSize: "0.74rem" }}>パスコード</span>
        <code>{model.passcode}</code>
        <CopyButton value={model.passcode} />
        <span className="muted" style={{ fontSize: "0.72rem" }}>（モデルに伝えてください）</span>
      </div>
    </div>
  );
}
