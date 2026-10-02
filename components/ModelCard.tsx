import Link from "next/link";
import type { PublicModel } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ModelCard({ model }: { model: PublicModel }) {
  return (
    <Link href={`/models/${model.id}`} className="card">
      <span
        className={`card__photo${model.photo_url ? "" : " card__photo--empty"}`}
        style={model.photo_url ? { backgroundImage: `url(${model.photo_url})` } : undefined}
        aria-hidden
      >{!model.photo_url ? <><span className="card__initial">{model.name.trim().slice(0, 1)}</span><span className="card__photo-label">写真未掲載</span></> : null}</span>
      <div className="card__body">
        <div className="meta-row" style={{ marginBottom: 6 }}>
          <StatusBadge status={model.status} />
        </div>
        <p className="card__name">{model.name}</p>
        {/* 所属事務所は必ず明記する（表示ルール） */}
        <p className="card__agency">所属：{model.agency}</p>
        {model.genre ? <p className="card__genre">{model.genre}</p> : null}
      </div>
    </Link>
  );
}
