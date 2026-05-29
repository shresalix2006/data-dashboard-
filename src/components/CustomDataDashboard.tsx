import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Upload, HelpCircle, FileText, Play, Check, AlertCircle, TrendingUp, Info, Search, RefreshCw } from "lucide-react";

interface DatasetTemplate {
  name: string;
  description: string;
  rawText: string;
}

const SAMPLE_TEMPLATES: DatasetTemplate[] = [
  {
    name: "Startup Revenue",
    description: "Multi-month growth revenue stream metrics",
    rawText: JSON.stringify([
      { "period": "Jan", "revenue": 14000, "conversionRate": 2.1, "signups": 530 },
      { "period": "Feb", "revenue": 18500, "conversionRate": 2.3, "signups": 620 },
      { "period": "Mar", "revenue": 22000, "conversionRate": 2.6, "signups": 710 },
      { "period": "Apr", "revenue": 21000, "conversionRate": 2.4, "signups": 690 },
      { "period": "May", "revenue": 28900, "conversionRate": 2.9, "signups": 940 },
      { "period": "Jun", "revenue": 34000, "conversionRate": 3.2, "signups": 1120 },
      { "period": "Jul", "revenue": 45000, "conversionRate": 3.5, "signups": 1450 }
    ], null, 2),
  },
  {
    name: "Product Core Ratings",
    description: "Customer segment engagement and item review averages",
    rawText: JSON.stringify([
      { "item": "Alpha Headset", "rating": 4.6, "reviews": 240, "shipped": 1200 },
      { "item": "Beta Keyboard", "rating": 4.1, "reviews": 115, "shipped": 890 },
      { "item": "Gamma Mouse", "rating": 4.8, "reviews": 460, "shipped": 2100 },
      { "item": "Delta Monitor", "rating": 3.9, "reviews": 85, "shipped": 450 },
      { "item": "Epsilon Hub", "rating": 4.3, "reviews": 92, "shipped": 600 }
    ], null, 2),
  },
  {
    name: "Web Server Hitrate",
    description: "Daily inbound requests & edge cache parameters",
    rawText: JSON.stringify([
      { "day": "Mon", "requests": 85000, "loadMs": 140, "errors": 340 },
      { "day": "Tue", "requests": 92000, "loadMs": 135, "errors": 210 },
      { "day": "Wed", "requests": 118000, "loadMs": 158, "errors": 510 },
      { "day": "Thu", "requests": 105000, "loadMs": 142, "errors": 280 },
      { "day": "Fri", "requests": 120000, "loadMs": 139, "errors": 420 },
      { "day": "Sat", "requests": 64000, "loadMs": 110, "errors": 180 },
      { "day": "Sun", "requests": 58000, "loadMs": 105, "errors": 120 }
    ], null, 2),
  }
];

export function CustomDataDashboard() {
  const [inputText, setInputText] = useState(SAMPLE_TEMPLATES[0].rawText);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentDataset, setCurrentDataset] = useState<any[]>(
    JSON.parse(SAMPLE_TEMPLATES[0].rawText)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://jsonplaceholder.typicode.com/todos?_limit=10");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleApplyData = () => {
    try {
      setErrorText(null);
      const parsed = JSON.parse(inputText);
      if (!Array.isArray(parsed)) {
        throw new Error("Dataset structure must be a JSON array of uniform objects.");
      }
      if (parsed.length === 0) {
        throw new Error("Object array must contain at least 1 record.");
      }
      setCurrentDataset(parsed);
    } catch (err: any) {
      setErrorText(err.message || "Failed to decode target JSON. Please confirm spelling and brackets.");
    }
  };

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    setFetchLoading(true);
    setErrorText(null);
    try {
      const response = await fetch(`/api/custom/fetch?url=${encodeURIComponent(targetUrl.trim())}`);
      if (!response.ok) {
        throw new Error(`Custom stream request failed (Status: ${response.status})`);
      }
      const parsed = await response.json();
      if (!Array.isArray(parsed)) {
        throw new Error("Target payload must return an Array of uniform items/objects.");
      }
      if (parsed.length === 0) {
        throw new Error("Returned array is empty.");
      }
      setCurrentDataset(parsed);
      setInputText(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setErrorText(err.message || "Failed to stream custom endpoint.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleApplyTemplate = (tpl: DatasetTemplate) => {
    setInputText(tpl.rawText);
    setErrorText(null);
    setCurrentDataset(JSON.parse(tpl.rawText));
    setAppliedSearch("");
    setSearchQuery("");
    setSortBy("");
    setSortOrder("asc");
  };

  // Filter and sort dataset by search terms and active sorting keys
  const filteredDataset = useMemo(() => {
    let list = [...currentDataset];
    if (appliedSearch.trim()) {
      const term = appliedSearch.toLowerCase().trim();
      list = list.filter((row) => {
        return Object.values(row).some((val) => 
          String(val).toLowerCase().includes(term)
        );
      });
    }
    if (sortBy) {
      list.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aString = String(aVal || "").toLowerCase();
        const bString = String(bVal || "").toLowerCase();
        if (aString < bString) return sortOrder === "asc" ? -1 : 1;
        if (aString > bString) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [currentDataset, appliedSearch, sortBy, sortOrder]);

  const handleClearFilter = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setSortBy("");
    setSortOrder("asc");
  };

  const handleExportCSV = () => {
    if (filteredDataset.length === 0) return;
    const headers = Object.keys(filteredDataset[0] || {});
    const csvRows = [
      headers.join(","),
      ...filteredDataset.map((row) =>
        headers
          .map((header) => {
            const val = row[header];
            const stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);
            return `"${stringVal.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_analytica_custom_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (filteredDataset.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredDataset, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", "data_analytica_custom_payload.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inspect the first item to find viable keys
  const schemaKeys = useMemo(() => {
    if (!filteredDataset || filteredDataset.length === 0) return { labelKey: "", numericKeys: [] as string[] };
    const firstRow = filteredDataset[0];
    const keys = Object.keys(firstRow);

    const numericKeys: string[] = [];
    let labelKey = "";

    keys.forEach((key) => {
      const value = firstRow[key];
      if (typeof value === "number") {
        numericKeys.push(key);
      } else if (typeof value === "string" && !labelKey) {
        labelKey = key;
      }
    });

    // Fallbacks
    if (!labelKey && keys.length > 0) {
      labelKey = keys.find(k => k !== numericKeys[0]) || keys[0];
    }

    return { labelKey, numericKeys };
  }, [filteredDataset]);

  const [activeMetricKey, setActiveMetricKey] = useState<string | null>(null);

  const selectedMetric = activeMetricKey || schemaKeys.numericKeys[0] || "";

  // Computed averages & sums on filtered dataset
  const statsSummary = useMemo(() => {
    if (!filteredDataset || filteredDataset.length === 0 || !selectedMetric) return null;
    let sum = 0;
    let maxVal = -Infinity;
    let minVal = Infinity;

    filteredDataset.forEach((row) => {
      const val = Number(row[selectedMetric]) || 0;
      sum += val;
      if (val > maxVal) maxVal = val;
      if (val < minVal) minVal = val;
    });

    const average = sum / filteredDataset.length;

    return {
      sum,
      average,
      maxVal,
      minVal,
    };
  }, [filteredDataset, selectedMetric]);

  return (
    <div className="space-y-8" id="editorial-custom-upload-portal">
      {/* Segment Workspace Description / API Stream Header */}
      <div className="rounded-none border border-editorial-border bg-white p-6">
        <h2 className="text-xl font-light font-serif italic text-editorial-ink">Custom Dataset Workbench</h2>
        <p className="text-xs text-editorial-muted font-sans mt-2 max-w-2xl leading-relaxed">
          Pase or stream real-time JSON array feeds down inside the target stream workspace.
          Our backend proxy safely requests external raw APIs without CORS blocks.
        </p>

        {/* REST API URL streaming input with Search/Fetch Buttons */}
        <form onSubmit={handleFetchUrl} className="mt-6 pt-6 border-t border-editorial-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 max-w-xl">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-editorial-muted font-mono text-[11px] font-bold">
                APIURL:
              </div>
              <input
                type="text"
                className="w-full rounded-none border border-editorial-border bg-editorial-bg/30 py-2.5 pl-14 pr-4 text-xs font-semibold text-editorial-ink placeholder-editorial-muted outline-hidden focus:border-editorial-ink focus:bg-white"
                placeholder="Stream an array endpoint (e.g. JSONPlaceholder, private feeds)..."
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={fetchLoading}
              className="px-5 py-2.5 bg-editorial-ink hover:bg-black text-[11px] font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              {fetchLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Stream REST Feed
            </button>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-editorial-muted shrink-0">
            Proxy-wrapped stream layer
          </div>
        </form>
      </div>

      {/* Editor Column and Quick Pickers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Templates Picker Block */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-none border border-editorial-border bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-editorial-ink border-b border-editorial-ink pb-2 mb-4">
              Demo Presets
            </h3>
            <div className="space-y-3">
              {SAMPLE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full text-left p-3.5 border border-editorial-border hover:border-editorial-ink bg-editorial-bg/20 transition-all rounded-none group"
                >
                  <h4 className="text-xs font-bold text-editorial-ink group-hover:text-editorial-accent transition-colors font-sans font-semibold">
                    {tpl.name}
                  </h4>
                  <p className="text-[10px] text-editorial-muted mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-none border border-editorial-border bg-editorial-bg/40 p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1.5">
              <Info className="h-4 w-4 text-editorial-accent" />
              JSON Data Constraint
            </h4>
            <p className="text-[11px] text-editorial-muted leading-relaxed">
              Ensure you pass a valid flat list array. Nested child items will be handled as plain string representations.
            </p>
          </div>
        </div>

        {/* Input Text Area and Error Banner */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-none border border-editorial-border bg-white p-6">
          <div className="flex items-center justify-between border-b border-editorial-ink pb-3 mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-editorial-muted">JSON Record Payload</span>
            <span className="text-xs font-mono text-editorial-muted">{currentDataset.length} rows loaded</span>
          </div>

          <textarea
            className="w-full h-[220px] rounded-none border border-editorial-border p-4 font-mono text-xs text-editorial-ink bg-editorial-bg/30 focus:bg-white focus:outline-hidden focus:border-editorial-ink"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your JSON records list here..."
          />

          {errorText && (
            <div className="mt-4 p-3 border border-rose-350 bg-rose-50/20 text-rose-700 flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-sans font-semibold leading-relaxed">{errorText}</p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleApplyData}
              className="inline-flex items-center gap-2 rounded-none bg-editorial-ink px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-editorial-accent transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              Apply & Stream Data
            </button>
          </div>
        </div>
      </div>

      {schemaKeys.numericKeys.length > 0 && (
        <>
          {/* Dataset Search Bar (and metric & sorting selectors) */}
          <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Left: Search & Sort Fields Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
              {/* Keyword Search field */}
              <div className="flex gap-2 max-w-md flex-1">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-editorial-muted" />
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-none border border-editorial-border bg-editorial-bg/30 py-2.5 pl-9 pr-4 text-xs font-semibold text-editorial-ink placeholder-editorial-muted outline-hidden focus:border-editorial-ink focus:bg-white"
                    placeholder="Insert search keyword (e.g. key, value, text)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedSearch(searchQuery)}
                  className="px-5 py-2.5 bg-editorial-ink hover:bg-black text-[11px] font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </button>
                {appliedSearch && (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="px-3 py-2.5 border border-editorial-border text-editorial-muted hover:text-editorial-ink text-xs font-bold uppercase transition-all shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sorting tools dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white text-xs font-bold text-editorial-ink border border-editorial-border rounded-none px-3 py-2 focus:border-editorial-ink focus:outline-hidden"
                >
                  <option value="">No Sorting</option>
                  {Object.keys(currentDataset[0] || {}).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                {sortBy && (
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-1.5 border border-editorial-border text-xs font-bold text-editorial-ink uppercase rounded-none hover:bg-editorial-bg whitespace-nowrap"
                  >
                    {sortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Target Metric selectors */}
            <div className="flex items-center gap-3 self-start xl:self-center">
              <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase mr-2 whitespace-nowrap">Target Metric:</span>
              <div className="flex flex-wrap gap-1.5">
                {schemaKeys.numericKeys.map((key) => {
                  const isActive = selectedMetric === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMetricKey(key)}
                      className={`px-3.5 py-1.5 text-xs font-bold border transition-all rounded-none ${
                        isActive
                          ? "bg-editorial-ink text-white border-editorial-ink"
                          : "bg-white text-editorial-ink border-editorial-border hover:border-editorial-ink"
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Computed Core Stats */}
          {statsSummary && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="custom-deck-cards-row">
              {[
                {
                  title: `Aggregate Sum`,
                  value: statsSummary.sum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                  subtitle: `Grand absolute total of ${selectedMetric}`,
                  meta: "metric sum index",
                },
                {
                  title: `Calculated Mean`,
                  value: statsSummary.average.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                  subtitle: `Arithmetic dataset standard deviation`,
                  meta: "record mean average",
                },
                {
                  title: `Highest Value`,
                  value: statsSummary.maxVal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                  subtitle: `Peak absolute observation`,
                  meta: "observed maximum",
                },
                {
                  title: `Lowest Value`,
                  value: statsSummary.minVal.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                  subtitle: `Valley absolute observation`,
                  meta: "observed minimum",
                },
              ].map((stat, i) => (
                <div
                  key={`custom-stat-${i}`}
                  className="relative bg-white p-6 rounded-none border border-editorial-border transition-all duration-300 hover:border-editorial-ink flex flex-col justify-between min-h-[160px] group"
                >
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase">{stat.title}</p>
                    <h4 className="mt-2 text-3xl font-light font-serif italic text-editorial-ink leading-none">
                      {stat.value}
                    </h4>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-editorial-border pt-4">
                    <span className="text-xs font-mono text-editorial-muted">{stat.subtitle}</span>
                    <span className="text-[9px] font-bold tracking-wider text-editorial-muted uppercase border border-editorial-border px-2 py-0.5 bg-editorial-bg select-none">
                      {stat.meta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visualization Charts Double layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Primary Area Chart */}
            <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-8 flex flex-col">
              <div className="border-b border-editorial-ink pb-3 mb-6">
                <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-editorial-accent" />
                  Chronological area wave — {selectedMetric}
                </h3>
              </div>

              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="customColorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0047FF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0047FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
                    <XAxis
                      dataKey={schemaKeys.labelKey}
                      tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                              <p className="text-gray-400 text-[10px] font-mono leading-none">{data[schemaKeys.labelKey]}</p>
                              <p className="font-bold text-white mt-1 text-sm font-serif italic">
                                {selectedMetric}: {Number(data[selectedMetric]).toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#0047FF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#customColorGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Flat block columns */}
            <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-4 flex flex-col justify-between">
              <div className="border-b border-editorial-ink pb-3 mb-4">
                <h3 className="text-base font-bold font-serif text-editorial-ink">Observation weights</h3>
                <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Absolute items spread parameters</p>
              </div>

              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
                    <XAxis
                      dataKey={schemaKeys.labelKey}
                      tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                              <p className="text-gray-400 text-[10px] font-mono leading-none">{data[schemaKeys.labelKey]}</p>
                              <p className="font-bold text-white mt-1 text-sm font-serif italic">
                                {selectedMetric}: {Number(data[selectedMetric]).toLocaleString()}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey={selectedMetric} fill="#0047FF" maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Pagination Data Table Preview */}
          <div className="rounded-none border border-editorial-border bg-white p-6">
            <div className="border-b border-editorial-ink pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-serif text-editorial-ink">Structured Records grid</h3>
                <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase">Compiled layout columns</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2 border border-editorial-border hover:border-editorial-ink text-[10px] font-bold uppercase tracking-wider text-editorial-ink bg-white transition hover:bg-editorial-bg select-none"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2 border border-editorial-border hover:border-editorial-ink text-[10px] font-bold uppercase tracking-wider text-editorial-ink bg-white transition hover:bg-editorial-bg select-none"
                >
                  Export JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-editorial-ink bg-editorial-bg/50">
                    {Object.keys(filteredDataset[0] || {}).map((key) => (
                      <th key={key} className="p-3 font-mono font-bold text-editorial-ink uppercase tracking-wider text-[10px]">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-editorial-border/60">
                  {filteredDataset.map((row, idx) => (
                    <tr key={idx} className="hover:bg-editorial-bg/30 transition-all">
                      {Object.keys(row).map((key) => (
                        <td key={key} className="p-3 font-sans text-editorial-ink">
                          {typeof row[key] === "object" ? JSON.stringify(row[key]) : String(row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
