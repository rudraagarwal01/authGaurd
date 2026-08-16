import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { api } from "../api";
import type { DayStats, Domain } from "../types";
import { generateMockReports, MOCK_DOMAIN_STATS } from "../utils/seedData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value ?? 0;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold">
        {count} report{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-5 py-4">
      <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 leading-none">
        {label}
      </p>
      <p className="text-2xl font-medium text-gray-900 dark:text-white mt-2 tabular-nums leading-none">
        {value}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportsChart() {
  const [chartData, setChartData] = useState<DayStats[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainTotal, setDomainTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setChartData(generateMockReports());
      setDomainTotal(MOCK_DOMAIN_STATS.totalDomains);
      setLoading(false);
      return;
    }
    Promise.all([
      api.getReportsByDay(),
      api.getDomains({ page: 1, per_page: 100 }),
    ])
      .then(([reports, domainData]) => {
        setChartData(reports);
        setDomains(domainData.items);
        setDomainTotal(domainData.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reportsTotal = useMemo(
    () => chartData.reduce((sum, d) => sum + d.count, 0),
    [chartData],
  );

  const avgRisk = useMemo(() => {
    if (USE_MOCK) return MOCK_DOMAIN_STATS.avgRiskScore;
    if (!domains.length) return 0;
    return Math.round((domains.reduce((s, d) => s + d.risk_score, 0) / domains.length) * 10) / 10;
  }, [domains]);

  const activeThreats = useMemo(
    () => (USE_MOCK ? MOCK_DOMAIN_STATS.activeThreats : domains.filter((d) => d.risk_score >= 60).length),
    [domains],
  );

  // Show a tick every ~5 data points so labels don't collide
  const tickInterval = Math.max(0, Math.floor(chartData.length / 6) - 1);

  const dash = loading ? "—" : undefined;

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Domains tracked"   value={dash ?? domainTotal} />
        <KpiCard label="Reports (30 days)" value={dash ?? reportsTotal} />
        <KpiCard label="Avg risk score"    value={dash ?? avgRisk} />
        <KpiCard label="Active threats"    value={dash ?? activeThreats} />
      </div>

      {/* Area chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-5">
          Reported domains
        </p>

        {loading ? (
          <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
            Loading…
          </div>
        ) : chartData.every((d) => d.count === 0) ? (
          <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
            No reports in the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeWidth={1}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--chart-text)" }}
                tickFormatter={(d: string) => d.slice(5)}
                interval={tickInterval}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--chart-text)" }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--chart-grid)" }}
              />
              <Bar
                dataKey="count"
                fill="#e74c3c"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
