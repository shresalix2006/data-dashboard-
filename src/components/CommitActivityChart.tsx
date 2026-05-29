import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CommitTrendPoint } from "../types";
import { Calendar, TrendingUp } from "lucide-react";

interface CommitActivityChartProps {
  commitTrend: CommitTrendPoint[];
}

export function CommitActivityChart({ commitTrend }: CommitActivityChartProps) {
  const [timeRange, setTimeRange] = useState<"7" | "14" | "30" | "all">("all");

  const filteredTrend = useMemo(() => {
    if (commitTrend.length === 0) return [];
    if (timeRange === "all") return commitTrend;

    const daysCount = parseInt(timeRange, 10);
    // Slice corresponding items from the end of the chronological list
    return commitTrend.slice(-daysCount);
  }, [commitTrend, timeRange]);

  const totalCommits = useMemo(() => {
    return filteredTrend.reduce((sum, item) => sum + item.count, 0);
  }, [filteredTrend]);

  const maxCommitsInDay = useMemo(() => {
    if (filteredTrend.length === 0) return 0;
    return Math.max(...filteredTrend.map((t) => t.count));
  }, [filteredTrend]);

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${monthNames[monthIndex]} ${day}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (commitTrend.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[350px]" id="empty-commits-trend">
        <Calendar className="h-10 w-10 text-gray-300 stroke-[1.5] mb-2" />
        <p className="text-gray-500 font-medium text-sm">No commit velocity logs found</p>
        <p className="text-gray-400 text-xs mt-1">Check repo path or try another active directory.</p>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col" id="commit-activity-trend-card">
      {/* Header and Controller Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-editorial-ink pb-3">
        <div>
          <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-editorial-accent" />
            Commit Activity Stream
          </h3>
          <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Chronological volume distribution of code revisions</p>
        </div>

        {/* Filter / Search segment buttons */}
        <div className="flex items-center gap-1 bg-editorial-bg p-1 rounded-none border border-editorial-border">
          {(["7", "14", "30", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-bold rounded-none transition-all ${
                timeRange === range
                  ? "bg-editorial-ink text-white"
                  : "text-editorial-muted hover:text-editorial-ink hover:bg-neutral-200/50"
              }`}
            >
              {range === "all" ? "All" : `${range}D`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats micro HUD row */}
      <div className="mt-5 grid grid-cols-2 gap-4 rounded-none bg-editorial-bg p-4 border border-editorial-border">
        <div>
          <p className="text-[9px] font-bold tracking-widest text-editorial-muted uppercase">Commits in Range</p>
          <p className="text-xl font-light font-serif italic text-editorial-ink mt-0.5">{totalCommits}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-widest text-editorial-muted uppercase">Peak Daily Output</p>
          <p className="text-xl font-light font-serif italic text-editorial-ink mt-0.5">{maxCommitsInDay} commits</p>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="mt-5 w-full h-[240px]" id="area-chart-view-host">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="commitColorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0047FF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0047FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
            <XAxis
              dataKey="dateString"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CommitTrendPoint;
                  return (
                    <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                      <p className="text-gray-400 text-[10px] font-mono leading-none">{formatDateLabel(data.dateString)}</p>
                      <p className="font-bold text-white mt-1 text-sm font-serif italic">{data.count} commits</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0047FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#commitColorGrad)"
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 1.5, fill: "#0047FF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
