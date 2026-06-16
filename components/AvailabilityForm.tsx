"use client";

import { useState, useTransition } from "react";
import { updateModelAvailability } from "@/app/actions/model";

export function AvailabilityForm({
  currentStart,
  currentEnd,
}: {
  currentStart: string | null;
  currentEnd: string | null;
}) {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateModelAvailability(fd);
      setResult(res);
    });
  }

  return (
    <div className="panel">
      <h2 className="panel__title">在廊時間の変更</h2>
      <form onSubmit={submit} className="btn-row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="avail-start">参加開始</label>
          <input id="avail-start" name="available_start" type="time" defaultValue={currentStart ?? ""} required />
        </div>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="avail-end">参加終了</label>
          <input id="avail-end" name="available_end" type="time" defaultValue={currentEnd ?? ""} required />
        </div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </button>
      </form>
      {result ? (
        <div className={`alert ${result.ok ? "alert--ok" : "alert--err"}`} style={{ marginTop: 10 }}>
          {result.message}
        </div>
      ) : null}
      <p className="muted" style={{ fontSize: "0.76rem", marginTop: 8 }}>
        保存すると即時反映されます。
      </p>
    </div>
  );
}
