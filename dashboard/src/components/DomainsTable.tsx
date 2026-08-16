import { useEffect, useState } from "react";
import { api } from "../api";
import type { Domain, DomainStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import { MOCK_DOMAINS } from "../utils/seedData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

const PER_PAGE = 20;

function RiskScore({ score }: { score: number }) {
  const color =
    score >= 60 ? "text-red-600" : score >= 30 ? "text-yellow-600" : "text-green-600";
  return <span className={`font-semibold tabular-nums ${color}`}>{score}</span>;
}

function ActionMenu({
  id,
  current,
  onUpdate,
}: {
  id: number;
  current: DomainStatus;
  onUpdate: (id: number, status: DomainStatus) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {current !== "safe" && (
        <button
          onClick={() => onUpdate(id, "safe")}
          className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        >
          Approve
        </button>
      )}
      {current !== "flagged" && (
        <button
          onClick={() => onUpdate(id, "flagged")}
          className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          Flag
        </button>
      )}
      {current !== "dismissed" && (
        <button
          onClick={() => onUpdate(id, "dismissed")}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export function DomainsTable({ isAdmin }: { isAdmin: boolean }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Debounce search and reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when status filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Fetch domains
  useEffect(() => {
    if (USE_MOCK) {
      let filtered = MOCK_DOMAINS;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter((d) => d.url.toLowerCase().includes(q));
      }
      if (statusFilter) {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }
      setTotal(filtered.length);
      setDomains(filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .getDomains({
        page,
        per_page: PER_PAGE,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      })
      .then((data) => {
        if (!cancelled) {
          setDomains(data.items);
          setTotal(data.total);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter]);

  const handleStatusUpdate = async (id: number, status: DomainStatus) => {
    if (USE_MOCK) {
      setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      return;
    }
    try {
      await api.updateDomainStatus(id, status);
      setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    } catch (err) {
      console.error(err);
    }
  };

  const colSpan = isAdmin ? 6 : 5;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Domains</h2>
          <p className="text-xs text-gray-400 mt-0.5">{total} total</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search domains…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-52"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="safe">Safe</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-3 font-medium">Domain</th>
              <th className="text-left px-4 py-3 font-medium">Risk</th>
              <th className="text-left px-4 py-3 font-medium">Reports</th>
              <th className="text-left px-4 py-3 font-medium">Last Seen</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              {isAdmin && <th className="text-left px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-10 text-center text-gray-400 text-sm">
                  Loading…
                </td>
              </tr>
            ) : domains.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-10 text-center text-gray-400 text-sm">
                  No domains found.
                </td>
              </tr>
            ) : (
              domains.map((domain) => (
                <tr key={domain.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-gray-800 max-w-xs">
                    <span className="truncate block" title={domain.url}>
                      {domain.url}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskScore score={domain.risk_score} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 tabular-nums">{domain.report_count}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(domain.last_seen).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={domain.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <ActionMenu
                        id={domain.id}
                        current={domain.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
