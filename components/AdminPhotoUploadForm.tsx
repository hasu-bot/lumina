"use client";

import { useRef, useState, useTransition } from "react";
import { adminUploadModelPhoto } from "@/app/actions/admin";

const MAX_DIMENSION = 1200; // 長辺の最大px
const JPEG_QUALITY = 0.82;

/** 画像をブラウザ側でリサイズ・圧縮してJPEGのBlobにする */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像の処理に失敗しました。");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("画像の圧縮に失敗しました。"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/** 運営代理アップロード（モデルがログインできない等のトラブル時用） */
export function AdminPhotoUploadForm({ modelId }: { modelId: string }) {
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);

    startTransition(async () => {
      try {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.set("id", modelId);
        formData.set("photo", compressed, "photo.jpg");
        const result = await adminUploadModelPhoto(formData);
        if (result && result.ok === false) {
          setMessage({ type: "err", text: result.message });
        } else {
          setMessage({ type: "ok", text: "写真を更新しました。" });
        }
      } catch (err) {
        setMessage({ type: "err", text: err instanceof Error ? err.message : "アップロードに失敗しました。" });
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div>
      <label className="btn btn--ghost btn--sm" style={{ display: "inline-block", cursor: "pointer" }}>
        {isPending ? "アップロード中…" : "写真を代理アップロード"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={isPending}
          style={{ display: "none" }}
        />
      </label>
      {message ? (
        <div className={`alert ${message.type === "ok" ? "alert--ok" : "alert--err"}`} style={{ marginTop: 6 }}>
          {message.text}
        </div>
      ) : null}
    </div>
  );
}
