import type { DomainStatus } from "../types";

const CONFIG: Record<DomainStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-gray-100 text-gray-600" },
  flagged:   { label: "Flagged",   className: "bg-red-100 text-red-700" },
  safe:      { label: "Safe",      className: "bg-green-100 text-green-700" },
  dismissed: { label: "Dismissed", className: "bg-yellow-100 text-yellow-700" },
};

export function StatusBadge({ status }: { status: DomainStatus }) {
  const { label, className } = CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
