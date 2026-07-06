import { ModelCard } from "@/components/ModelCard";
import { getParticipatingModels } from "@/lib/data";
import type { PublicModel } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS = [
  { no: "01", title: "気になるモデルを探す", desc: "会場参加モデルの一覧から、プロフィールを見て気になる人を選びます。" },
  { no: "02", title: "プロフィールを見る", desc: "写真・所属事務所・ジャンル・在廊時間を確認できます。" },
  { no: "03", title: "空き枠を選ぶ", desc: "○印の枠（30分）から希望の時間を選択します。" },
  { no: "04", title: "名前を入れてリクエスト", desc: "お名前を入力するだけで撮影リクエスト完了。枠はすぐに×に変わります。" },
  { no: "05", title: "会場で合流", desc: "リクエストした時間に会場でモデルと合流。当日枠は受付でも対応します。" },
];

export default async function HomePage() {
  let models: PublicModel[] = [];
  let loadError = false;
  try {
    models = await getParticipatingModels();
  } catch (e) {
    loadError = true;
    console.error("Failed to load participating models", e);
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero__tag">YOLO PHOTO EXHIBITION — lumina</span>
          <h1>
            <span className="hero__line">今日の出会いが、</span>
            <span className="hero__line">次の一枚になる。</span>
          </h1>
          <p>気になる人を見つけたら、まずはプロフィールを覗いてみよう。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">写真展参加者一覧</h2>
          <p className="section__sub">PHOTO EXHIBITION GUESTS ／ 会場参加モデル</p>

          {loadError ? (
            <div className="alert alert--err">
              ただいま参加者一覧を表示できません。会場受付にお声がけください。
            </div>
          ) : models.length === 0 ? (
            <div className="empty">現在、会場参加中のモデルはいません。</div>
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
          <p className="section__sub">HOW TO REQUEST</p>
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
