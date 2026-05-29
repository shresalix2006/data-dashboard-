import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { LanguageStat } from "../types";
import { Code, Hash } from "lucide-react";

interface LanguageBreakdownCardProps {
  languages: LanguageStat[];
}

export function LanguageBreakdownCard({ languages }: LanguageBreakdownCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (languages.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[300px]" id="empty-lanuages-panel">
        <Code className="h-10 w-10 text-gray-300 stroke-[1.5] mb-2" />
        <p className="text-gray-500 font-medium text-sm">No code volume data available</p>
        <p className="text-gray-400 text-xs mt-1">This repository might be empty or binary-only.</p>
      </div>
    );
  }

  // Cap visible list to 5 items, and group the rest into "Other"
  const processedLanguages = (() => {
    if (languages.length <= 6) return languages;
    
    const top5 = languages.slice(0, 5);
    const rest = languages.slice(5);
    const restBytes = rest.reduce((sum, item) => sum + item.value, 0);
    const restPercentage = parseFloat(rest.reduce((sum, item) => sum + item.percentage, 0).toFixed(1));
    
    return [
      ...top5,
      {
        name: "Other",
        value: restBytes,
        percentage: restPercentage,
        color: "#6b7280", // gray-500
      }
    ];
  })();

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  return (
    <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col" id="language-breakdown-card">
      <div className="flex items-baseline justify-between border-b border-editorial-ink pb-3">
        <div>
          <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
            <Code className="h-4 w-4 text-editorial-accent" />
            Codebase Composition
          </h3>
          <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Primary languages by bytes of code</p>
        </div>
      </div>

      {/* Stacked Percentage Bar - sharp flat segments */}
      <div className="mt-5">
        <div className="flex h-4.5 w-full overflow-hidden bg-editorial-bg border border-editorial-border" id="makeup-stacked-bar">
          {languages.slice(0, 8).map((lang) => (
            <div
              key={lang.name}
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
              }}
              className="h-full transition-all duration-300 hover:opacity-85 cursor-pointer border-r border-white/20 last:border-r-0"
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Pie Chart in Left/Top Column */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full h-[180px]" id="piechart-stage-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedLanguages}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {processedLanguages.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color}
                      className="transition-all duration-300 cursor-pointer"
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                      strokeWidth={1}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as LanguageStat;
                      return (
                        <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                          <p className="font-semibold flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                            {data.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Size: {formatBytes(data.value)}</p>
                          <p className="text-[10px] text-editorial-accent font-bold mt-0.5">Ratio: {data.percentage}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center HUD Info overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-serif italic text-editorial-ink">
                {activeIndex !== null ? `${processedLanguages[activeIndex].percentage}%` : `${languages[0].percentage}%`}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-editorial-muted truncate max-w-[90px] text-center">
                {activeIndex !== null ? processedLanguages[activeIndex].name : languages[0].name}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Legend list in Right Column */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-1.5" id="languages-legend-panel">
          {processedLanguages.map((entry, idx) => (
            <div
              key={`legend-${entry.name}`}
              className={`flex items-center justify-between p-2 rounded-none transition-all cursor-pointer border ${
                activeIndex === idx ? "bg-editorial-bg border-editorial-border" : "border-transparent hover:bg-editorial-bg/30"
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-editorial-ink truncate">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-editorial-muted">{formatBytes(entry.value)}</span>
                <span className="text-[10px] font-mono font-bold text-editorial-ink bg-white border border-editorial-border rounded-none px-1.5 py-0.5 min-w-[45px] text-center">
                  {entry.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
