import React, { useState, useMemo } from "react";
import useSWR from "swr";
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
import { Search, RefreshCw, CloudRain, Sun, Wind, Compass, Droplets, Landmark } from "lucide-react";

interface WeatherPeriod {
  dayName: string;
  temp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
}

const CITY_PRESETS: Record<string, {
  name: string;
  country: string;
  temp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  condition: string;
  history: WeatherPeriod[];
}> = {
  london: {
    name: "London",
    country: "United Kingdom",
    temp: 16,
    humidity: 78,
    pressure: 1014,
    windSpeed: 4.8,
    condition: "Moderate Rain Shower",
    history: [
      { dayName: "Mon", temp: 15, humidity: 82, pressure: 1012, windSpeed: 5.1 },
      { dayName: "Tue", temp: 16, humidity: 78, pressure: 1014, windSpeed: 4.8 },
      { dayName: "Wed", temp: 18, humidity: 72, pressure: 1015, windSpeed: 3.9 },
      { dayName: "Thu", temp: 19, humidity: 65, pressure: 1018, windSpeed: 3.2 },
      { dayName: "Fri", temp: 17, humidity: 70, pressure: 1016, windSpeed: 4.0 },
      { dayName: "Sat", temp: 15, humidity: 85, pressure: 1010, windSpeed: 6.2 },
      { dayName: "Sun", temp: 14, humidity: 88, pressure: 1008, windSpeed: 5.5 },
    ],
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    temp: 22,
    humidity: 61,
    pressure: 1012,
    windSpeed: 3.1,
    condition: "Clear Sky",
    history: [
      { dayName: "Mon", temp: 20, humidity: 65, pressure: 1010, windSpeed: 2.8 },
      { dayName: "Tue", temp: 22, humidity: 61, pressure: 1012, windSpeed: 3.1 },
      { dayName: "Wed", temp: 24, humidity: 58, pressure: 1013, windSpeed: 3.4 },
      { dayName: "Thu", temp: 25, humidity: 55, pressure: 1015, windSpeed: 2.9 },
      { dayName: "Fri", temp: 23, humidity: 60, pressure: 1014, windSpeed: 3.0 },
      { dayName: "Sat", temp: 21, humidity: 64, pressure: 1011, windSpeed: 4.1 },
      { dayName: "Sun", temp: 22, humidity: 62, pressure: 1012, windSpeed: 3.2 },
    ],
  },
  newyork: {
    name: "New York",
    country: "United States",
    temp: 24,
    humidity: 55,
    pressure: 1018,
    windSpeed: 2.5,
    condition: "Sunny Overcast",
    history: [
      { dayName: "Mon", temp: 22, humidity: 58, pressure: 1016, windSpeed: 2.1 },
      { dayName: "Tue", temp: 24, humidity: 55, pressure: 1018, windSpeed: 2.5 },
      { dayName: "Wed", temp: 26, humidity: 50, pressure: 1020, windSpeed: 2.0 },
      { dayName: "Thu", temp: 27, humidity: 48, pressure: 1019, windSpeed: 1.8 },
      { dayName: "Fri", temp: 25, humidity: 52, pressure: 1017, windSpeed: 3.2 },
      { dayName: "Sat", temp: 23, humidity: 60, pressure: 1014, windSpeed: 4.0 },
      { dayName: "Sun", temp: 24, humidity: 56, pressure: 1016, windSpeed: 2.7 },
    ],
  },
  sydney: {
    name: "Sydney",
    country: "Australia",
    temp: 19,
    humidity: 68,
    pressure: 1022,
    windSpeed: 5.6,
    condition: "Fresh Breeze",
    history: [
      { dayName: "Mon", temp: 18, humidity: 70, pressure: 1020, windSpeed: 5.1 },
      { dayName: "Tue", temp: 19, humidity: 68, pressure: 1022, windSpeed: 5.6 },
      { dayName: "Wed", temp: 20, humidity: 65, pressure: 1023, windSpeed: 4.9 },
      { dayName: "Thu", temp: 19, humidity: 66, pressure: 1021, windSpeed: 5.3 },
      { dayName: "Fri", temp: 17, humidity: 72, pressure: 1019, windSpeed: 6.0 },
      { dayName: "Sat", temp: 16, humidity: 75, pressure: 1018, windSpeed: 6.5 },
      { dayName: "Sun", temp: 18, humidity: 69, pressure: 1021, windSpeed: 5.2 },
    ],
  }
};

export function WeatherDashboard() {
  const [selectedCityKey, setSelectedCityKey] = useState("london");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempUnit, setTempUnit] = useState<"c" | "f">("c");

  const { data: realTimeWeather, error, isValidating } = useSWR(
    `/api/weather/search?city=${encodeURIComponent(selectedCityKey)}`,
    (url) => fetch(url).then((res) => {
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    }),
    { refreshInterval: 45000, revalidateOnFocus: false }
  );

  const activeData = useMemo(() => {
    if (realTimeWeather) return realTimeWeather;
    const key = selectedCityKey.toLowerCase().replace(/\s+/g, "");
    return CITY_PRESETS[key] || CITY_PRESETS.london;
  }, [realTimeWeather, selectedCityKey]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedCityKey(searchQuery.trim());
    }
  };

  const convertTemp = (celsius: number) => {
    if (tempUnit === "f") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const formattedHistory = useMemo(() => {
    return activeData.history.map((pt: any) => ({
      ...pt,
      temp: convertTemp(pt.temp),
    }));
  }, [activeData, tempUnit]);

  const comfortInfo = useMemo(() => {
    const t = activeData.temp;
    const h = activeData.humidity;
    
    let label = "Pleasant Balance";
    let desc = "Ideal atmospheric conditions: optimal humidity matched with fresh, pleasant temperatures.";
    let rating = "Nominal Comfort";
    let color = "border-emerald-600/60 bg-emerald-50/10 text-emerald-850";

    if (t > 28 && h > 65) {
      label = "Stuffy & Humid";
      desc = "Heavy air mass saturation combined with high temperatures, leading to a steamy feel.";
      rating = "Oppressive Index";
      color = "border-amber-600/60 bg-amber-50/10 text-amber-850";
    } else if (t < 10) {
      label = "Crisp Coolness";
      desc = "Low ambient thermals. Cool air flow supports active energy, minimal moisture burden.";
      rating = "Fresh Air Factor";
      color = "border-blue-600/60 bg-blue-50/10 text-blue-850";
    } else if (h < 30) {
      label = "Dry Atmosphere";
      desc = "Moisture indices dropped below nominal range. Low relative moisture level detected.";
      rating = "Arid Dry Air";
      color = "border-yellow-600/60 bg-yellow-50/10 text-yellow-850";
    } else if (h > 80) {
      label = "Wet Saturation";
      desc = "Saturated air boundaries. High fog probability or thick moisture mist likely.";
      rating = "Wet Atmosphere";
      color = "border-cyan-600/60 bg-cyan-50/10 text-cyan-850";
    }
    
    return { label, desc, rating, color };
  }, [activeData]);

  const activeAlerts = useMemo(() => {
    const alerts: { title: string; type: "warning" | "nominal"; text: string }[] = [];
    const t = activeData.temp;
    const w = activeData.windSpeed;
    const h = activeData.humidity;

    if (t > 35) {
      alerts.push({
        title: "Extreme Thermal Warning",
        type: "warning",
        text: `Extreme heat advisory detected with temperature hovering around ${t}°C. Prevent direct exposure.`,
      });
    }
    if (w > 8) {
      alerts.push({
        title: "High Wind Gust Alert",
        type: "warning",
        text: `Strong gales running at ${w} m/s active. Secure loose architectural elements.`,
      });
    }
    if (h > 85) {
      alerts.push({
        title: "Heavy Precipitation / Dew Alert",
        type: "warning",
        text: `Extremely heavy saturation of ${h}% observed. Microclimatic sensors detect very high precipitation/dew likelihood.`,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        title: "Atmospheric Sensors: Nominal Status",
        type: "nominal",
        text: "Global meteorological indices indicate clean breeze stability. Zero extreme alert advisory triggers active.",
      });
    }

    return alerts;
  }, [activeData]);

  return (
    <div className="space-y-8" id="editorial-weather-telemetry-portal">
      {/* Search Input Box */}
      <form onSubmit={handleCitySearch} className="rounded-none border border-editorial-border bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-editorial-muted" />
            </div>
            <input
              type="text"
              className="w-full rounded-none border border-editorial-border bg-editorial-bg/30 py-2.5 pl-9 pr-4 text-xs font-semibold text-editorial-ink placeholder-editorial-muted outline-hidden focus:border-editorial-ink focus:bg-white"
              placeholder="Search any global city (e.g. Paris, Tokyo, Mumbai, Moscow)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-editorial-ink hover:bg-black text-[11px] font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            Search City
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-muted">Temp Scale:</span>
          <div className="flex items-center gap-1 bg-editorial-bg p-1 border border-editorial-border">
            <button
              type="button"
              onClick={() => setTempUnit("c")}
              className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${
                tempUnit === "c" ? "bg-editorial-ink text-white" : "text-editorial-muted hover:text-editorial-ink"
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setTempUnit("f")}
              className={`px-3 py-1.5 text-xs font-bold rounded-none transition-all ${
                tempUnit === "f" ? "bg-editorial-ink text-white" : "text-editorial-muted hover:text-editorial-ink"
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Fast links */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase mr-2">Suggestions:</span>
        {Object.keys(CITY_PRESETS).map((key) => {
          const item = CITY_PRESETS[key];
          const isActive = selectedCityKey.toLowerCase().replace(/\s+/g, "") === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedCityKey(item.name);
                setSearchQuery(item.name);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-none border transition-all ${
                isActive
                  ? "bg-editorial-ink text-white border-editorial-ink"
                  : "bg-white text-editorial-ink border-editorial-border hover:border-editorial-ink"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Main Stats Summary Banner */}
      <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="weather-banner">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-muted">{activeData.country}</span>
            {activeData.isRealTime && (
              <span className="font-mono text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-250 px-1 py-0.5 font-bold uppercase rounded-none">
                Live Open-Meteo Feed
              </span>
            )}
          </div>
          <h2 className="text-3xl font-light font-serif italic text-editorial-ink flex items-baseline gap-1">
            {activeData.name}
            <span className="text-xl font-normal text-editorial-accent ml-2 font-sans tracking-tight">
              {convertTemp(activeData.temp)}°{tempUnit.toUpperCase()}
            </span>
          </h2>
          <p className="text-xs text-editorial-muted font-sans mt-1">Status Condition: <b className="text-editorial-ink">{activeData.condition}</b></p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-editorial-muted uppercase tracking-wider bg-editorial-bg border border-editorial-border px-3.5 py-2">
          <RefreshCw className={`h-3.5 w-3.5 text-editorial-accent ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Updating atmospheric sensor..." : "Real-time weather query active"}
        </div>
      </div>

      {/* Dynamic Climate Advisories & Comfort Index Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="weather-advisories-bento">
        {/* Left: Atmospheric Comfort Index Gauge */}
        <div className={`rounded-none border p-6 flex flex-col justify-between ${comfortInfo.color}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-85">Biometeorological Metric</span>
              <span className="text-[10px] uppercase font-bold tracking-widest border border-current px-2 py-0.5 rounded-none">
                {comfortInfo.rating}
              </span>
            </div>
            <h3 className="text-xl font-light font-serif italic mt-3 leading-none text-editorial-ink">
              {comfortInfo.label}
            </h3>
            <p className="text-xs mt-2 font-sans leading-relaxed text-editorial-muted">
              {comfortInfo.desc}
            </p>
          </div>
          <div className="mt-6 border-t border-current/25 pt-4 flex items-center justify-between font-mono text-[9px] uppercase font-bold opacity-80">
            <span>Air Comfort Calibration Engine</span>
            <span>Ratio Temp={activeData.temp}°C / RH={activeData.humidity}%</span>
          </div>
        </div>

        {/* Right: Sensor Advisories Alerts */}
        <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase block border-b border-editorial-ink pb-2 mb-3">
              Meteorological Sensor Alerts
            </span>
            {activeAlerts.map((alert, idx) => {
              const isWarning = alert.type === "warning";
              return (
                <div key={idx} className="flex gap-3 mt-2.5 items-start">
                  <div className={`h-2 w-2 shrink-0 rounded-full mt-1.5 ${isWarning ? "bg-amber-600 animate-pulse" : "bg-emerald-500"}`} />
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold uppercase tracking-wide ${isWarning ? "text-amber-850" : "text-emerald-850"}`}>
                      {alert.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-editorial-muted font-sans">
                      {alert.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-3 border-t border-editorial-border/60 text-[9px] text-editorial-muted tracking-wider uppercase font-bold font-mono text-right select-none">
            Updates in real-time interval triggers
          </div>
        </div>
      </div>

      {/* Core Deck Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Absolute Temp",
            value: `${convertTemp(activeData.temp)}°${tempUnit.toUpperCase()}`,
            subtitle: "Thermodynamic heat output",
            icon: Sun,
            meta: `relative stability`,
          },
          {
            title: "Relative Dust & Humidity",
            value: `${activeData.humidity}%`,
            subtitle: "Atmospheric saturation level",
            icon: Droplets,
            meta: "high moisture level",
          },
          {
            title: "Barometric Pressure",
            value: `${activeData.pressure} hPa`,
            subtitle: "Pressure value in standard hPa",
            icon: Compass,
            meta: "stable baric level",
          },
          {
            title: "Wind Velocity",
            value: `${activeData.windSpeed} m/s`,
            subtitle: "Anemometer force reading",
            icon: Wind,
            meta: "sub-breeze flow",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={`stat-weather-${i}`}
              className="relative bg-white p-6 rounded-none border border-editorial-border transition-all duration-300 hover:border-editorial-ink flex flex-col justify-between min-h-[160px] group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase">{stat.title}</p>
                  <h4 className="mt-2 text-3xl font-light font-serif italic text-editorial-ink leading-none">
                    {stat.value}
                  </h4>
                </div>
                <div className="p-2 border border-editorial-border text-editorial-accent bg-transparent group-hover:bg-editorial-ink group-hover:text-white transition-all">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-editorial-border pt-4">
                <span className="text-xs font-mono text-editorial-muted">{stat.subtitle}</span>
                <span className="text-[9px] font-bold tracking-wider text-editorial-muted uppercase border border-editorial-border px-2 py-0.5 bg-editorial-bg select-none">
                  {stat.meta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Graphical Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-8 flex flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-editorial-ink pb-3 mb-6">
            <div>
              <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
                <Sun className="h-4 w-4 text-editorial-accent" />
                Atmospheric Forecast Streams — {activeData.name}
              </h3>
              <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Chronological temperature forecasts</p>
            </div>
          </div>

          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047FF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0047FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
                <XAxis
                  dataKey="dayName"
                  tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#717171", fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-none bg-editorial-ink p-3 text-xs text-white border border-editorial-border font-sans">
                          <p className="text-gray-400 text-[10px] font-mono leading-none">{data.dayName}</p>
                          <p className="font-bold text-white mt-1 text-sm font-serif italic">
                            Temp: {data.temp}°{tempUnit.toUpperCase()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#0047FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weatherGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moisture saturation Bar Panel */}
        <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-4 flex flex-col justify-between">
          <div className="border-b border-editorial-ink pb-3 mb-4">
            <h3 className="text-base font-bold font-serif text-editorial-ink">Air saturation levels</h3>
            <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Average relative moisture percentages</p>
          </div>

          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DE" />
                <XAxis
                  dataKey="dayName"
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
                          <p className="text-[10px] text-gray-400 font-mono leading-none">{data.dayName}</p>
                          <p className="font-bold text-white mt-1 text-xs font-serif italic">Humidity: {data.humidity}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="humidity" fill="#0047FF" maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
