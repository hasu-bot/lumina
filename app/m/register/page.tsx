import Link from "next/link";
import { ModelSelfRegisterForm } from "@/components/ModelSelfRegisterForm";

export const dynamic = "force-dynamic";

export default function ModelRegisterPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <p style={{ marginBottom: 16 }}>
          <Link href="/m/login">← ログイン画面へ戻る</Link>
        </p>
        <h1 className="section__title">モデル参加申請</h1>
        <p className="section__sub">YOLO写真映像展 lumina への参加をお申し込みください</p>
        <ModelSelfRegisterForm />
      </div>
    </section>
  );
}
