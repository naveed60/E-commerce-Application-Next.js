import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChevronRight,
  Eye,
  MessageCircleMore,
  MoveDown,
  MoveUp,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  DashboardData,
  DashboardDeviceBreakdown,
  DashboardTrendPoint,
} from "@/lib/admin-dashboard-data";

type Tone = "green" | "cyan" | "orange" | "indigo";

type StatCardConfig = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  tone: Tone;
  sparkline: number[];
};

const toneStyles: Record<
  Tone,
  {
    background: string;
    value: string;
    badge: string;
    line: string;
    accent: string;
  }
> = {
  green: {
    background: "linear-gradient(135deg, #21c35e 0%, #1cb34f 100%)",
    value: "#ffffff",
    badge: "rgba(255,255,255,0.18)",
    line: "rgba(255,255,255,0.72)",
    accent: "rgba(255,255,255,0.18)",
  },
  cyan: {
    background: "linear-gradient(135deg, #18b3d6 0%, #0796c3 100%)",
    value: "#ffffff",
    badge: "rgba(255,255,255,0.18)",
    line: "rgba(255,255,255,0.72)",
    accent: "rgba(255,255,255,0.18)",
  },
  orange: {
    background: "linear-gradient(135deg, #f39c12 0%, #ef8605 100%)",
    value: "#ffffff",
    badge: "rgba(255,255,255,0.18)",
    line: "rgba(255,255,255,0.72)",
    accent: "rgba(255,255,255,0.18)",
  },
  indigo: {
    background: "linear-gradient(135deg, #6b6cf7 0%, #5b54f6 100%)",
    value: "#ffffff",
    badge: "rgba(255,255,255,0.18)",
    line: "rgba(255,255,255,0.72)",
    accent: "rgba(255,255,255,0.18)",
  },
};

const deviceColorMap: Record<
  DashboardDeviceBreakdown["color"],
  { solid: string; soft: string }
> = {
  indigo: { solid: "#6366f1", soft: "rgba(99, 102, 241, 0.18)" },
  emerald: { solid: "#22c55e", soft: "rgba(34, 197, 94, 0.18)" },
  amber: { solid: "#f59e0b", soft: "rgba(245, 158, 11, 0.18)" },
};

export function AdminOverview({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6 pb-10">
      <section className="grid gap-4 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <LineAnalyticsCard series={data.chart.series} />
        <DeviceAnalyticsCard breakdown={data.chart.deviceBreakdown} />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-[var(--admin-shadow)]">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">
              Recent Leads
            </h2>
            <p className="text-sm text-[var(--admin-text-soft)]">
              Fresh opportunities from the last 30 days.
            </p>
          </div>
          <Link
            href="/nextshop/admin/customers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--admin-accent)] transition hover:text-[var(--admin-accent-strong)]"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="min-h-[170px] px-6 py-8">
          {data.leads.length === 0 ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-[24px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg-soft)] text-sm text-[var(--admin-text-muted)]">
              No leads yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {data.leads.map((lead) => (
                <div
                  key={`${lead.email}-${lead.company}`}
                  className="grid gap-4 rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                      {lead.name}
                    </p>
                    <p className="truncate text-sm text-[var(--admin-text-soft)]">
                      {lead.company}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--admin-text-soft)]">
                      {lead.email}
                    </p>
                    <p className="text-sm font-medium text-[var(--admin-text)]">
                      {lead.budget}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 lg:justify-end">
                    <span className="rounded-full bg-[var(--admin-bg-elevated)] px-3 py-1 text-xs font-semibold text-[var(--admin-text)] shadow-sm">
                      {lead.stage}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] transition hover:border-[var(--admin-border-strong)]"
                      aria-label={`Open lead from ${lead.name}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <button
        type="button"
        className="fixed bottom-5 right-5 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_18px_35px_rgba(37,211,102,0.34)] transition hover:scale-105"
        aria-label="Open support chat"
      >
        <MessageCircleMore className="h-7 w-7" />
      </button>
    </div>
  );
}

function StatCard({ stat }: { stat: StatCardConfig }) {
  const tone = toneStyles[stat.tone];

  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-5 py-5 text-white shadow-[0_22px_50px_rgba(15,23,42,0.12)]"
      style={{ background: tone.background }}
    >
      <div
        className="absolute -right-8 top-4 h-24 w-24 rounded-full"
        style={{ backgroundColor: tone.accent }}
      />
      <div
        className="absolute -bottom-6 right-2 h-28 w-28 rounded-full"
        style={{ backgroundColor: tone.accent }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/90">{stat.label}</p>
          <p className="mt-1 text-[2.4rem] font-semibold leading-none text-white">
            {stat.value}
          </p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/92">
            {stat.trend === "up" ? (
              <MoveUp className="h-4 w-4" />
            ) : (
              <MoveDown className="h-4 w-4" />
            )}
            {stat.change}
          </p>
        </div>
        <Sparkline values={stat.sparkline} stroke={tone.line} />
      </div>
    </div>
  );
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  const width = 120;
  const height = 70;
  const padding = 6;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const step = (width - padding * 2) / Math.max(values.length - 1, 1);

  const points = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / span) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="relative z-10 h-[4.5rem] w-[7.5rem] opacity-90"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}

function LineAnalyticsCard({ series }: { series: DashboardTrendPoint[] }) {
  const pageViews = series.map((point) => point.pageViews);
  const sessions = series.map((point) => point.sessions);
  const chartWidth = 860;
  const chartHeight = 280;
  const paddingX = 44;
  const paddingY = 26;

  const pageViewPath = buildLinePath(pageViews, chartWidth, chartHeight, paddingX, paddingY);
  const sessionsPath = buildLinePath(sessions, chartWidth, chartHeight, paddingX, paddingY);
  const pageViewArea = buildAreaPath(pageViews, chartWidth, chartHeight, paddingX, paddingY);
  const sessionsArea = buildAreaPath(sessions, chartWidth, chartHeight, paddingX, paddingY);

  const novemberIndex = series.findIndex((point) => point.label === "Nov");
  const novemberPoint = novemberIndex >= 0 ? series[novemberIndex] : series[series.length - 2];
  const novemberPosition = getPointPosition(
    novemberIndex >= 0 ? novemberIndex : series.length - 2,
    pageViews,
    chartWidth,
    chartHeight,
    paddingX,
    paddingY,
  );

  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--admin-text)]">
            Real-time Analytics
          </h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <MetricPill
              icon={<Users className="h-4 w-4" />}
              label="Sessions"
              value="75,600"
              tone="indigo"
            />
            <MetricPill
              icon={<Eye className="h-4 w-4" />}
              label="Page Views"
              value="125,700"
              tone="cyan"
            />
          </div>
        </div>

        <div className="inline-flex rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] p-1 text-sm font-semibold text-[var(--admin-text-soft)]">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              type="button"
              className={cn(
                "rounded-xl px-4 py-2 transition",
                range === "30d"
                  ? "bg-[var(--admin-accent)] text-white shadow-[0_10px_24px_var(--admin-ring)]"
                  : "hover:text-[var(--admin-text)]",
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]">
        <div className="relative h-[310px] overflow-hidden rounded-[26px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pageViewsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="sessionsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3, 4].map((tick) => {
              const y =
                chartHeight - paddingY - (tick / 4) * (chartHeight - paddingY * 2);

              return (
                <line
                  key={tick}
                  x1={paddingX}
                  x2={chartWidth - paddingX}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.16)"
                  strokeDasharray="4 8"
                />
              );
            })}

            <path d={pageViewArea} fill="url(#pageViewsFill)" />
            <path d={sessionsArea} fill="url(#sessionsFill)" />
            <path
              d={pageViewPath}
              fill="none"
              stroke="#04b5db"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={sessionsPath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {series.map((point, index) => {
              const position = getPointPosition(
                index,
                pageViews,
                chartWidth,
                chartHeight,
                paddingX,
                paddingY,
              );

              return (
                <g key={point.label}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="4.5"
                    fill="#04b5db"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {series.map((point, index) => {
              const x =
                paddingX +
                (index * (chartWidth - paddingX * 2)) / Math.max(series.length - 1, 1);
              return (
                <text
                  key={point.label}
                  x={x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill="rgba(100, 116, 139, 0.9)"
                  fontSize="11"
                >
                  {point.label}
                </text>
              );
            })}

            {[0, 40, 80, 120, 160].map((tick) => {
              const y =
                chartHeight - paddingY - (tick / 160) * (chartHeight - paddingY * 2);

              return (
                <text
                  key={tick}
                  x="18"
                  y={y + 4}
                  fill="rgba(100, 116, 139, 0.9)"
                  fontSize="11"
                >
                  {tick}
                </text>
              );
            })}
          </svg>

          {novemberPoint ? (
            <div
              className="pointer-events-none absolute rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
              style={{
                left: `${(novemberPosition.x / chartWidth) * 100}%`,
                top: `${Math.max((novemberPosition.y / chartHeight) * 100 - 4, 16)}%`,
                transform: "translate(-18%, -10%)",
              }}
            >
              <p className="text-xs font-medium text-[var(--admin-text-soft)]">Nov</p>
              <p className="mt-2 text-sm text-cyan-500">
                Page Views : {novemberPoint.pageViews}
              </p>
              <p className="mt-2 text-sm text-indigo-500">
                Sessions : {novemberPoint.sessions}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm">
        <LegendDot color="#06b6d4" label="Page Views" />
        <LegendDot color="#6366f1" label="Sessions" />
      </div>
    </section>
  );
}

function MetricPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "cyan" | "indigo";
}) {
  const classes =
    tone === "cyan"
      ? "bg-cyan-100 text-cyan-500"
      : "bg-indigo-100 text-indigo-500";

  return (
    <div className="flex items-center gap-3">
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", classes)}>
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-[var(--admin-text-soft)]">{label}</p>
        <p className="text-2xl font-semibold leading-none text-[var(--admin-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function DeviceAnalyticsCard({
  breakdown,
}: {
  breakdown: DashboardDeviceBreakdown[];
}) {
  const size = 210;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = breakdown.reduce((sum, item) => sum + item.value, 0);
  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
      <h2 className="text-lg font-semibold text-[var(--admin-text)]">
        Device Analytics
      </h2>

      <div className="mt-8 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth={strokeWidth}
          />
          {breakdown.map((item, index) => {
            const segment = (item.value / total) * circumference;
            const palette = deviceColorMap[item.color];
            const previousSegments = breakdown.slice(0, index);
            const offset = previousSegments.reduce(
              (sum, previous) => sum + (previous.value / total) * circumference,
              0,
            );
            const dashOffset = circumference - offset;

            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={palette.solid}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 28}
            style={{ fill: "var(--admin-bg-elevated)" }}
          />
        </svg>
      </div>

      <div className="mt-6 space-y-4">
        {breakdown.map((item) => {
          const palette = deviceColorMap[item.color];

          return (
            <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <span
                className="h-4 w-4 rounded-md"
                style={{ backgroundColor: palette.solid }}
              />
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-[var(--admin-text)]">{item.label}</p>
                <div className="h-2 flex-1 rounded-full bg-[var(--admin-bg-soft)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: palette.solid,
                    }}
                  />
                </div>
              </div>
              <p className="min-w-[48px] text-right text-sm font-semibold text-[var(--admin-text)]">
                {item.value.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[var(--admin-text-soft)]">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  paddingX: number,
  paddingY: number,
) {
  const points = getChartPoints(values, width, height, paddingX, paddingY);
  if (points.length === 0) return "";

  return buildSmoothPath(points);
}

function buildAreaPath(
  values: number[],
  width: number,
  height: number,
  paddingX: number,
  paddingY: number,
) {
  const points = getChartPoints(values, width, height, paddingX, paddingY);
  if (points.length === 0) return "";

  const baseY = height - paddingY;
  return `${buildSmoothPath(points)} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
}

function getChartPoints(
  values: number[],
  width: number,
  height: number,
  paddingX: number,
  paddingY: number,
) {
  return values.map((_, index) =>
    getPointPosition(index, values, width, height, paddingX, paddingY),
  );
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const segments = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = points[index - 1] ?? current;
    const following = points[index + 2] ?? next;

    const cp1x = current.x + (next.x - previous.x) / 6;
    const cp1y = current.y + (next.y - previous.y) / 6;
    const cp2x = next.x - (following.x - current.x) / 6;
    const cp2y = next.y - (following.y - current.y) / 6;

    segments.push(
      `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`,
    );
  }

  return segments.join(" ");
}

function getPointPosition(
  index: number,
  values: number[],
  width: number,
  height: number,
  paddingX: number,
  paddingY: number,
) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const x = paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
  const value = values[index] ?? values[values.length - 1] ?? 0;
  const y = height - paddingY - ((value - min) / span) * (height - paddingY * 2);
  return { x, y };
}
