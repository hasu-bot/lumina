import { redirect } from "next/navigation";
import { PasscodeForm } from "@/components/PasscodeForm";
import { modelLogin } from "@/app/actions/model";
import { getModelSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ModelLoginPage() {
  if (await getModelSession()) redirect("/m/dashboard");
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1 className="section__title">モデルログイン</h1>
        <p className="section__sub">運営から発行されたパスコードを入力してください</p>
        <div className="panel">
          <PasscodeForm action={modelLogin} label="パスコード" buttonText="ログイン" />
        </div>
      </div>
    </section>
  );
}
