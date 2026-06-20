"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createModel } from "@/app/actions/admin";

export function ModelRegisterForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string | null)?.trim() || "モデル";
    setMsg(null);
    startTransition(async () => {
      const res = await createModel(fd);
      if (res && !res.ok) {
        setMsg({ ok: false, text: res.message });
      } else {
        setMsg({ ok: true, text: `${name} を登録しました。` });
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      {msg ? <div className={`alert ${msg.ok ? "alert--ok" : "alert--err"}`}>{msg.text}</div> : null}

      <div className="form-section">
        <p className="form-section__label">基本情報</p>
        <div className="field">
          <label>名前<span className="req">必須</span></label>
          <input name="name" type="text" required />
        </div>
        <div className="field">
          <label>所属事務所<span className="req">必須</span></label>
          <input name="agency" type="text" placeholder="例）バレンタインデュウ" required />
        </div>
        <div className="field">
          <label>モデル用パスコード<span className="req">必須</span></label>
          <input name="passcode" type="text" placeholder="モデルがログインに使う合言葉" required />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section__label">プロフィール</p>
        <div className="field">
          <label>ジャンル</label>
          <input name="genre" type="text" placeholder="例）ポートレート / 映像" />
        </div>
        <div className="field">
          <label>Instagram（@ または URL）</label>
          <input name="instagram" type="text" placeholder="例）@lumina_model" />
        </div>
        <div className="field">
          <label>写真URL</label>
          <input name="photo_url" type="url" placeholder="https://…" />
        </div>
        <div className="field">
          <label>プロフィール</label>
          <textarea name="profile" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section__label">在廊時間・料金</p>
        <div className="btn-row">
          <div className="field" style={{ flex: 1 }}>
            <label>対応開始</label>
            <input name="available_start" type="time" defaultValue="13:00" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>対応終了</label>
            <input name="available_end" type="time" defaultValue="18:00" />
          </div>
        </div>
        <div className="field">
          <label>料金</label>
          <input name="fee" type="text" placeholder="例）30分 ¥3,000" />
        </div>
      </div>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "登録中…" : "モデルを登録する"}
      </button>
    </form>
  );
}
