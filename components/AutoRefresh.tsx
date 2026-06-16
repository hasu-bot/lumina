"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 一定間隔でサーバーコンポーネントを再取得し、新規予約を画面に反映する。
 * （メール通知は後回し・画面上で確認できればOKという要件に対応）
 */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
