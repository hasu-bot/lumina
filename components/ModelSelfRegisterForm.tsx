"use client";

import { useState, useTransition } from "react";
import { submitModelRegistration } from "@/app/actions/model";

export function ModelSelfRegisterForm() {
  const [result, setResult] = useState<{ ok: boolean; message: string; passcode?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitModelRegistration(fd);
      setResult(res);
    });
  }

  if (result?.ok && result.passcode) {
    return (
      <div className="panel">
        <div className="alert alert--ok">
          <strong>申請を受け付けました！</strong>
          <br />
          運営の承認後、以下のパスコードでログインできます。
        </div>
        <div style={{ marginTop: 16, padding: "16px 20px", background: "var(--cream)", borderRadius: 10, border: "1px solid var(--line)" }}>
          <p className="muted" style={{ marginBottom: 6, fontSize: "0.84rem" }}>あなたのパスコード（必ずメモしてください）</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "0.2em", fontFamily: "monospace" }}>
            {result.passcode}
          </p>
        </div>
        <p className="muted" style={{ fontSize: "0.82rem", marginTop: 12 }}>
          このパスコードは再表示できません。承認後は「モデルログイン」画面から入力してください。
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="reg-name">
            お名前（表示名）<span className="req">必須</span>
          </label>
          <input id="reg-name" name="name" type="text" placeholder="例）山田 花子" required maxLength={40} />
        </div>

        <div className="field">
          <label htmlFor="reg-agency">
            所属事務所<span className="req">必須</span>
          </label>
          <input id="reg-agency" name="agency" type="text" placeholder="例）〇〇プロダクション / フリーランス" required maxLength={60} />
        </div>

        <div className="field">
          <label htmlFor="reg-email">通知用メールアドレス</label>
          <input id="reg-email" name="email" type="email" placeholder="例）you@example.com" maxLength={120} />
          <p className="muted" style={{ fontSize: "0.74rem", marginTop: 4 }}>
            撮影リクエストが入ったときにここへメールが届きます（任意）。
          </p>
        </div>

        <div className="field">
          <label htmlFor="reg-genre">ジャンル</label>
          <input id="reg-genre" name="genre" type="text" placeholder="例）ポートレート / コスプレ / ファッション" maxLength={40} />
        </div>

        <div className="field">
          <label htmlFor="reg-instagram">Instagram</label>
          <input id="reg-instagram" name="instagram" type="text" placeholder="例）@username" maxLength={80} />
        </div>

        <div className="field">
          <label htmlFor="reg-fee">撮影条件</label>
          <input id="reg-fee" name="fee" type="text" placeholder="例）30分 ¥3,000 ／ 要相談 ／ 相互無償歓迎" maxLength={100} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
          <div className="field">
            <label htmlFor="reg-start">参加開始時間</label>
            <input id="reg-start" name="available_start" type="time" />
          </div>
          <div className="field">
            <label htmlFor="reg-end">参加終了時間</label>
            <input id="reg-end" name="available_end" type="time" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="reg-profile">プロフィール</label>
          <textarea id="reg-profile" name="profile" rows={3} placeholder="ひとこと自己紹介" maxLength={300} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line)", fontFamily: "inherit", fontSize: "0.92rem" }} />
        </div>

        {result && !result.ok ? (
          <div className="alert alert--err" style={{ marginBottom: 14 }}>
            {result.message}
          </div>
        ) : null}

        <button className="btn" type="submit" disabled={pending} style={{ width: "100%" }}>
          {pending ? "申請中…" : "申請する"}
        </button>
      </form>

      <p className="muted" style={{ fontSize: "0.78rem", marginTop: 14 }}>
        ※ 申請後、運営が内容を確認して承認します。承認されるとサイトに掲載されます。写真はログイン後にアップロードできます。
      </p>
    </div>
  );
}
