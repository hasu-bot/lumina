import Link from "next/link";
import type { PublicModel } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ModelCard({ model }: { model: PublicModel }) {
  return (
    <Link href={`/models/${model.id}`} className="card">
      <span
        className="card__photo"
        style={model.photo_url ? { backgroundImage: `url(${model.photo_url})` } : undefined}
        aria-hidden
      />
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
