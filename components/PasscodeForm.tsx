"use client";

import { useState, useTransition } from "react";

type LoginAction = (formData: FormData) => Promise<{ ok: false; message: string } | void>;

export function PasscodeForm({ action, label, buttonText }: { action: LoginAction; label: string; buttonText: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      // 成功時はサーバーアクションが redirect する。失敗時のみ戻り値を受け取る。
      const res = await action(fd);
      if (res && !res.ok) setError(res.message);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? <div className="alert alert--err">{error}</div> : null}
      <div className="field">
        <label htmlFor="passcode">{label}</label>
        <input id="passcode" name="passcode" type="password" autoComplete="off" autoFocus />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "確認中…" : buttonText}
      </button>
    </form>
  );
}
