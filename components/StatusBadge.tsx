import { STATUS_LABEL, type ModelStatus } from "@/lib/types";

const CLASS: Record<ModelStatus, string> = {
  active: "badge--active",
  break: "badge--break",
  closed: "badge--closed",
};

export function StatusBadge({ status }: { status: ModelStatus }) {
  return <span className={`badge ${CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}
