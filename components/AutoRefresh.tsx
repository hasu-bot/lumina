"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * 一定間隔でサーバーコンポーネントを再取得し、新規予約を画面に反映する。
 * 画面右下に控えめなインジケーターを出し、更新が起きていることを可視化する。
 */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1400);
      return () => clearTimeout(t);
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <div className={`auto-refresh${flash ? " auto-refresh--flash" : ""}`} aria-hidden>
      <span className="auto-refresh__dot" />
      {flash ? "更新しました" : `自動更新中・${seconds}秒ごと`}
    </div>
  );
}
