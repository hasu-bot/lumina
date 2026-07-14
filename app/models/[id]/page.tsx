import Link from "next/link";
import { notFound } from "next/navigation";
import { ReservationPanel } from "@/components/ReservationPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { getModelById, getReservations } from "@/lib/data";
import { buildSlots, normalizeTime } from "@/lib/slots";
import { todayJST } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // DB接続に失敗しても来場者に開発者向けエラーを見せない。
  let model: Awaited<ReturnType<typeof getModelById>> = null;
  let reservations: Awaited<ReturnType<typeof getReservations>> = [];
  let loadError = false;
  try {
    model = await getModelById(id);
    if (model && model.is_active) {
      reservations = await getReservations(model.id, todayJST());
    }
  } catch (e) {
    loadError = true;
    console.error("Failed to load model detail", e);
  }

  if (loadError) {
    return (
      <section className="section">
        <div className="container">
          <div className="alert alert--err">
            ただいまプロフィールを表示できません。会場受付にお声がけください。
          </div>
          <p style={{ marginTop: 16 }}>
            <Link href="/">← 参加者一覧へ戻る</Link>
          </p>
        </div>
      </section>
    );
  }

  if (!model || !model.is_active) notFound();
  // 来場者向けには予約者名を伏せる（visitorName を渡さない）
  const slots = buildSlots(model.available_start, model.available_end, reservations).map((s) => ({ ...s, visitorName: null }));
  const acceptingReservations = model.status === "active";

  const start = normalizeTime(model.available_start);
  const end = normalizeTime(model.available_end);

  return (
    <section className="section">
      <div className="container">
        <p style={{ marginBottom: 16 }}>
          <Link href="/">← 参加者一覧へ戻る</Link>
        </p>

        <div className="detail">
          <div>
            {model.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="detail__photo" src={model.photo_url} alt={model.name} />
            ) : (
              <div className="detail__photo" />
            )}
          </div>

          <div>
            <div className="meta-row">
              <StatusBadge status={model.status} />
              {model.genre ? <span className="badge badge--agency">{model.genre}</span> : null}
            </div>
            <h1 className="detail__name">{model.name}</h1>
            {/* 所属事務所は必ず明記する（表示ルール） */}
            <p className="badge badge--agency" style={{ fontSize: "0.82rem" }}>
              所属：{model.agency}
            </p>

            <dl className="kv">
              {start && end ? (
                <>
                  <dt>在廊時間</dt>
                  <dd>
                    {start} 〜 {end}
                  </dd>
                </>
              ) : null}
              {model.fee ? (
                <>
                  <dt>撮影条件</dt>
                  <dd>{model.fee}</dd>
                </>
              ) : null}
              {model.instagram ? (
                <>
                  <dt>Instagram</dt>
                  <dd>
                    <InstagramLink handle={model.instagram} />
                  </dd>
                </>
              ) : null}
            </dl>

            {model.profile ? <p className="profile-text">{model.profile}</p> : null}
          </div>
        </div>

        <div style={{ marginTop: 28, maxWidth: 720 }}>
          <ReservationPanel modelId={model.id} slots={slots} acceptingReservations={acceptingReservations} />
        </div>
      </div>
    </section>
  );
}

function InstagramLink({ handle }: { handle: string }) {
  const isUrl = /^https?:\/\//.test(handle);
  const href = isUrl ? handle : `https://instagram.com/${handle.replace(/^@/, "")}`;
  const label = isUrl ? handle : `@${handle.replace(/^@/, "")}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
