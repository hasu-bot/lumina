import { ModelCard } from "@/components/ModelCard";
import { getParticipatingModels } from "@/lib/data";
import type { PublicModel } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  { no: "01", title: "気になるモデルを探す", desc: "本日参加中のモデル一覧から、プロフィールを見て気になる人を選びます。" },
  { no: "02", title: "プロフィールを見る", desc: "写真・所属事務所・ジャンル・在廊時間を確認できます。" },
  { no: "03", title: "空き枠を選ぶ", desc: "○印の予約枠（30分）から希望の時間を選択します。" },
  { no: "04", title: "名前を入れて予約", desc: "お名前を入力するだけで予約完了。枠はすぐに×に変わります。" },
  { no: "05", title: "会場で合流", desc: "予約時間に会場でモデルと合流。当日枠は受付でも対応します。" },
];

export default async function HomePage() {
  let models: PublicModel[] = [];
  let loadError: string | null = null;
  try {
    models = await getParticipatingModels();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "データの取得に失敗しました。";
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero__tag">YOLO PHOTO EXHIBITION — lumina</span>
          <h1>出会いが、作品を生む。</h1>
          <p>会場で出展モデルと出会い、話し、その場で撮影予約。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">写真展参加者一覧</h2>
          <p className="section__sub">PHOTO EXHIBITION GUESTS ／ 本日参加中のモデル</p>

          {loadError ? (
            <div className="alert alert--err">
              {loadError}
              <br />
              <span className="muted">.env.local に Supabase のキーを設定し、supabase/schema.sql・seed.sql を実行してください。</span>
            </div>
          ) : models.length === 0 ? (
            <div className="empty">現在参加中のモデルはいません。</div>
          ) : (
            <div className="grid">
              {models.map((m) => (
                <ModelCard key={m.id} model={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--cream" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <h2 className="section__title">ご利用の流れ</h2>
          <p className="section__sub">HOW TO BOOK</p>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.no} className="step">
                <div className="step__no">{s.no}</div>
                <div className="step__title">{s.title}</div>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
