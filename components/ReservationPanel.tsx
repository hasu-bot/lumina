"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Slot } from "@/lib/types";
import { createReservation, type ActionResult } from "@/app/actions/reservations";

function slotClass(slot: Slot, selected: boolean): string {
  if (slot.booked) return "slot slot--booked";
  if (slot.type === "walkin") return "slot slot--walkin";
  const base = "slot slot--open slot--selectable";
  return selected ? `${base} slot--selected` : base;
}

function slotState(slot: Slot): string {
  if (slot.booked) return "× 予約済";
  if (slot.type === "walkin") return "当日枠";
  return "○ 予約可";
}

export function ReservationPanel({ modelId, slots, acceptingReservations }: { modelId: string; slots: Slot[]; acceptingReservations: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const hasOpenSlots = slots.some((s) => s.type === "reserved_quota" && !s.booked);

  function submit() {
    if (!selected || !name.trim()) return;
    const fd = new FormData();
    fd.set("modelId", modelId);
    fd.set("startTime", selected);
    fd.set("visitorName", name.trim());
    startTransition(async () => {
      const res = await createReservation(fd);
      setResult(res);
      if (res.ok) {
        setSelected(null);
        setName("");
        router.refresh(); // サーバーから最新の枠状況を再取得
      }
    });
  }

  return (
    <div className="panel">
      <h2 className="panel__title">空き時間・予約（1枠30分）</h2>

      {slots.length === 0 ? (
        <p className="muted">対応時間が未設定です。</p>
      ) : (
        <>
          <div className="slots" role="list">
            {slots.map((slot) => {
              const isSelectable = acceptingReservations && slot.type === "reserved_quota" && !slot.booked;
              const isSelected = selected === slot.start;
              return (
                <div
                  key={slot.start}
                  role="listitem"
                  className={slotClass(slot, isSelected)}
                  onClick={isSelectable ? () => setSelected(isSelected ? null : slot.start) : undefined}
                >
                  <div className="slot__time">
                    {slot.start}–{slot.end}
                  </div>
                  <div className="slot__state">{slotState(slot)}</div>
                </div>
              );
            })}
          </div>
          <p className="muted" style={{ fontSize: "0.76rem", marginTop: 10 }}>
            ○ 予約可 / × 予約済 / 当日枠 は会場受付で対応（オンライン予約不可）
          </p>
        </>
      )}

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "18px 0" }} />

      {!acceptingReservations ? (
        <div className="alert alert--info">現在このモデルは予約を受け付けていません（休憩中／受付終了）。</div>
      ) : !hasOpenSlots ? (
        <div className="alert alert--info">現在予約可能な枠はありません。当日枠は会場受付でお問い合わせください。</div>
      ) : (
        <div>
          <div className="field">
            <label>予約する枠</label>
            <div>{selected ? <strong>{selected} の枠</strong> : <span className="muted">上の○の枠を選択してください</span>}</div>
          </div>
          <div className="field">
            <label htmlFor="visitorName">
              お名前<span className="req">必須</span>
            </label>
            <input
              id="visitorName"
              type="text"
              value={name}
              maxLength={40}
              placeholder="例）山田"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className="btn" disabled={!selected || !name.trim() || pending} onClick={submit}>
            {pending ? "送信中…" : "この枠で予約する"}
          </button>
        </div>
      )}

      {result ? <div className={`alert ${result.ok ? "alert--ok" : "alert--err"}`} style={{ marginTop: 14 }}>{result.message}</div> : null}
    </div>
  );
}
