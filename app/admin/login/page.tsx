import { redirect } from "next/navigation";
import { PasscodeForm } from "@/components/PasscodeForm";
import { adminLogin } from "@/app/actions/admin";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1 className="section__title">運営ログイン</h1>
        <p className="section__sub">運営パスコード（環境変数 ADMIN_PASSCODE）を入力してください</p>
        <div className="panel">
          <PasscodeForm action={adminLogin} label="運営パスコード" buttonText="ログイン" />
        </div>
      </div>
    </section>
  );
}
