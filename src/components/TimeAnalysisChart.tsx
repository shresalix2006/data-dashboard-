import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DayOfWeekPoint, HourOfDayPoint } from "../types";
import { Clock, BarChart2 } from "lucide-react";

interface TimeAnalysisChartProps {
  dayOfWeekActivity: DayOfWeekPoint[];
  hourActivity: HourOfDayPoint[];
}

export function TimeAnalysisChart({ dayOfWeekActivity, hourActivity }: TimeAnalysisChartProps) {
  const [metricMode, setMetricMode] = useState<"day" | "hour">("day");

  const currentChartData: Record<string, any>[] = metricMode === "day" ? dayOfWeekActivity : hourActivity;
  const xAxisKey = metricMode === "day" ? "dayName" : "hourString";

  return (
    <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col" id="time-analysis-card">
      {/* Header with Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-editorial-ink pb-3">
        <div>
          <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
            <Clock className="h-4 w-4 text-editorial-accent" />
            Developer Focus Peaks
          </h3>
          <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Identify active days and work shift densities</p>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-1 bg-editorial-bg p-1 rounded-none border border-editorial-border">
          <button
            onClick={() => setMetricMode("day")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${
              metricMode === "day"
                ? "bg-editorial-ink text-white"
                : "text-editorial-muted hover:text-editorial-ink"
            }`}
          >
            Day of Week
          </button>
          <button
            onClick={() => setMetricMode("hour")}
            className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${
              metricMode === "hour"
                ? "bg-editorial-ink text-white"
                : "text-editorial-muted hover:text-editorial-ink"
            }`}
          >
            Hourly Frequency
          </button>
        </div>
      </div>

      {/* Bar Chart stage */}
      <div className="mt-6 w-full h-[240px]" id="barchart-stage-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
            <XAxis
              dataKey={xAxisKey}
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
                  const data = payload[0].payload;
                  const label = metricMode === "day" ? data.dayName : `Hour: ${data.hourString}`;
                  return (
                    <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                      <p className="text-gray-400 text-[10px] font-mono leading-none">{label}</p>
                      <p className="font-bold text-white mt-1 text-sm font-serif italic">{data.count} commits</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Flat block-style columns without rounded borders */}
            <Bar
              dataKey="count"
              fill="#0047FF"
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
