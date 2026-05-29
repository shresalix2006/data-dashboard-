import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { useGithubStats } from "./hooks/useGithubStats";
import { QuerySelector } from "./components/QuerySelector";
import { MetricCards } from "./components/MetricCards";
import { LanguageBreakdownCard } from "./components/LanguageBreakdownCard";
import { CommitActivityChart } from "./components/CommitActivityChart";
import { TimeAnalysisChart } from "./components/TimeAnalysisChart";
import { ContributorsCard } from "./components/ContributorsCard";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { CryptoDashboard } from "./components/CryptoDashboard";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { CustomDataDashboard } from "./components/CustomDataDashboard";
import { 
  GitPullRequest, 
  BookOpen, 
  Globe, 
  Hash, 
  ShieldAlert, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  GitBranch,
  Coins,
  CloudRain,
  FileText,
  BarChart2
} from "lucide-react";

function RibbonCountdown({ 
  resetTime, 
  onResetComplete 
}: { 
  resetTime: number; 
  onResetComplete: () => void; 
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const computeSecondsLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, resetTime - now);
    };

    setSecondsLeft(computeSecondsLeft());

    const interval = setInterval(() => {
      const left = computeSecondsLeft();
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        onResetComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime, onResetComplete]);

  if (secondsLeft === null || secondsLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 uppercase font-bold animate-pulse">
        Reconnecting...
      </span>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 uppercase font-bold animate-pulse">
      Auto-reconnecting live in {formattedTime}
    </span>
  );
}

function GitHubRateLimitCountdown({ 
  resetTime, 
  onResetComplete 
}: { 
  resetTime: number; 
  onResetComplete: () => void; 
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const computeSecondsLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, resetTime - now);
    };

    setSecondsLeft(computeSecondsLeft());

    const interval = setInterval(() => {
      const left = computeSecondsLeft();
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        onResetComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime, onResetComplete]);

  if (secondsLeft === null) {
    return (
      <div className="text-center font-mono text-xs text-editorial-muted py-12 animate-pulse">
        CALCULATING TARGET RESET TIME WINDOW...
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const resetDate = new Date(resetTime * 1000);
  const resetTimeString = resetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="rounded-none border border-editorial-border bg-white p-12 max-w-2xl mx-auto mt-8 text-center space-y-6 animate-fadeIn" id="rate-limit-countdown-box">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 rounded-none mb-5">
          <ShieldAlert className="h-8 w-8 stroke-[1.25]" />
        </div>
        <h3 className="text-sm font-bold tracking-widest text-editorial-ink uppercase">
          GitHub REST API Rate Limit Active
        </h3>
        <p className="text-xs text-editorial-muted max-w-md mt-2.5 font-sans leading-relaxed">
          The public GitHub API rate channel is currently exhausted (60 requests/hour IP cap hit). 
          This high-fidelity interface will automatically reload and show real-time metrics in:
        </p>
      </div>

      <div className="py-8 bg-editorial-bg border border-editorial-border flex flex-col items-center justify-center select-none">
        <span className="font-mono text-5xl font-extrabold tracking-tight text-editorial-ink tabular-nums">
          {formattedTime}
        </span>
        <span className="text-[9px] tracking-widest uppercase font-bold text-editorial-muted mt-2.5 block">
          Remaining Until Reset Window (Approx. {resetTimeString})
        </span>
      </div>

      <div className="space-y-4 pt-3">
        <p className="text-[11px] text-editorial-muted leading-relaxed max-w-sm mx-auto">
          Need immediate tracking data? Provide a clean, unexpired <strong className="font-semibold text-editorial-ink">Personal Access Token (PAT)</strong> inside the key panel above to instantly bypass this cap.
        </p>
        <button
          onClick={onResetComplete}
          className="inline-flex items-center gap-1.5 rounded-none bg-editorial-ink hover:bg-black text-[10px] font-bold uppercase tracking-wider text-white px-5 py-3 transition-colors duration-350"
        >
          Check API Status Now
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { mutate } = useSWRConfig();
  const [activeTab, setActiveTab] = useState<"github" | "crypto" | "weather" | "custom">("github");
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [personalToken, setPersonalToken] = useState("");

  const triggerRevalidateAll = () => {
    mutate(() => true);
  };

  // Load saved token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("github_analytics_token");
    if (saved) {
      setPersonalToken(saved);
    }
  }, []);

  const handleQueryChange = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
  };

  const handleTokenChange = (token: string) => {
    setPersonalToken(token);
    if (token) {
      localStorage.setItem("github_analytics_token", token);
    } else {
      localStorage.removeItem("github_analytics_token");
    }
  };

  const { data, isLoading, error } = useGithubStats(owner, repo, personalToken);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg pb-20 text-editorial-ink antialiased font-sans" id="app-root-frame">
      {/* 1. Header Section */}
      <header className="sticky top-0 z-50 border-b border-editorial-border bg-white/95 backdrop-blur-md" id="app-main-navbar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-none bg-editorial-ink text-white">
                <BarChart2 className="h-5 w-5 stroke-[2.5]" id="app-brand-icon" />
              </div>
              <div>
                <h1 className="text-base font-bold font-serif tracking-tight text-editorial-ink leading-none">
                  Data Analytica
                </h1>
                <span className="text-[9px] uppercase tracking-widest font-bold text-editorial-muted mt-1.5 block">
                  Enterprise-grade Editorial Telemetry & Insights
                </span>
              </div>
            </div>

            {/* Quick provider details */}
            <div className="hidden sm:flex items-center gap-1.5 bg-editorial-bg border border-editorial-border rounded-none px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold font-mono text-editorial-muted">
              <span className="h-1.5 w-1.5 bg-editorial-accent" />
              Multi-Source Data Engine
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Stage */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8" id="dashboard-host-scaffold">
        
        {/* Core Tab Switcher Hub */}
        <div className="border border-editorial-border bg-white p-2 flex flex-col sm:flex-row gap-1 items-stretch sm:items-center justify-between rounded-none">
          <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase px-3 py-2 sm:py-0 select-none">
            Active Data Stream:
          </span>
          <div className="grid grid-cols-2 md:flex md:items-center gap-1">
            {[
              { id: "github", label: "GitHub Codebase", icon: GitPullRequest },
              { id: "crypto", label: "Crypto Market", icon: Coins },
              { id: "weather", label: "Weather Forecast", icon: CloudRain },
              { id: "custom", label: "Custom Payload", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none transition-all border ${
                    isActive
                      ? "bg-editorial-ink text-white border-editorial-ink"
                      : "bg-white text-editorial-ink border-transparent hover:border-editorial-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic State tab conditional rendering boards */}
        {activeTab === "github" ? (
          <div className="space-y-8" id="github-analytics-module">
            {/* Repository selector search interface */}
            <QuerySelector
              currentOwner={owner}
              currentRepo={repo}
              onQueryChange={handleQueryChange}
              isLoading={isLoading}
              onTokenChange={handleTokenChange}
              savedToken={personalToken}
            />

            {isLoading ? (
              <SkeletonLoader />
            ) : error ? (
              (error as any).isRateLimit ? (
                <GitHubRateLimitCountdown
                  resetTime={(error as any).resetTime || (Math.floor(Date.now() / 1000) + 3600)}
                  onResetComplete={() => {
                    window.location.reload();
                  }}
                />
              ) : (
                /* Error feedback panel with instructions and actions */
                <div className="rounded-none border border-rose-350 bg-white p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-8" id="error-alert-boundary">
                  <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100">
                    <ShieldAlert className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-editorial-ink">Query Encountered an Issue</h3>
                  <p className="text-xs text-editorial-muted font-sans mt-2 max-w-md leading-relaxed">
                    {error.message || "Failed to fetch repository analytics. This may be due to a strict GitHub REST API rate-limit of 60 requests/hour or invalid credentials."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => handleQueryChange("facebook", "react")}
                      className="inline-flex items-center gap-1.5 rounded-none bg-editorial-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-editorial-accent"
                    >
                      Reset suggestions
                    </button>
                    {personalToken === "" && (
                      <div className="text-[10px] text-editorial-muted py-2 tracking-wider uppercase font-bold block px-1">
                        Or provide a safe PAT credentials key.
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : data ? (
              /* Fully Loaded high-fidelity dashboard modules */
              <div className="space-y-8" id="loaded-dashboard-layout">
                
                {/* Simulated Data / Cache Fallback Info Ribbon */}
                {((data.repo as any).__is_simulated || (data.repo as any).__is_cached_fallback) && (
                  <div className="rounded-none border-l-4 border-amber-600 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn border" id="simulated-telemetry-ribbon">
                    <div className="flex items-start gap-4">
                      <div className="h-9 w-9 bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-700 rounded-none">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-editorial-ink uppercase tracking-wider">
                            GitHub API Rate Limit Triggered ({ (data.repo as any).__is_cached_fallback ? "Historical Cache Enabled" : "Offline Sandbox Active" })
                          </h4>
                          {(data.repo as any).__rate_limit_reset && (
                            <RibbonCountdown 
                              resetTime={(data.repo as any).__rate_limit_reset} 
                              onResetComplete={triggerRevalidateAll}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-editorial-muted leading-relaxed font-sans">
                          The shared workspace public GitHub API rate channel is exhausted. Showing high-fidelity analytics backup for <strong className="font-semibold">@{owner}/{repo}</strong>. Real-time live tracking will automatically connect once the limit is reset/countdown finishes, or you can supply an unexpired PAT token above to instantly bypass the cap.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Repository Info Title Ribbon */}
                <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-editorial-ink transition-all duration-300" id="repo-information-banner">
                  <div className="flex items-start gap-5">
                    <img
                      src={data.repo.owner.avatar_url}
                      alt={data.repo.owner.login}
                      className="h-16 w-16 rounded-none object-cover border border-editorial-border shrink-0 select-none bg-editorial-bg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-muted hover:text-editorial-ink transition-colors">
                          {data.repo.owner.login}
                        </span>
                        <span className="text-editorial-border font-light text-xs mx-1">/</span>
                        <span className="text-sm font-bold text-editorial-ink flex items-center gap-1.5">
                          {data.repo.name}
                          {data.repo.fork && (
                            <span className="text-[9px] font-bold tracking-widest uppercase text-editorial-muted bg-editorial-bg border border-editorial-border rounded-none px-1.5 py-0.5 ml-1">
                              forked
                            </span>
                          )}
                        </span>
                      </div>
                      <h2 className="text-xl font-light font-serif italic text-editorial-ink line-clamp-2 max-w-3xl leading-relaxed">
                        {data.repo.description || "No project description specified."}
                      </h2>
                      <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono text-editorial-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-editorial-muted" />
                          Created {formatDate(data.repo.created_at)}
                        </span>
                        <span className="h-1 w-1 bg-editorial-border rounded-full" />
                        <span>Last Pushed {formatDate(data.repo.pushed_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* URL/License redirects right column */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center" id="repo-outbound-pills">
                    <a
                      href={data.repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-none border border-editorial-border bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-editorial-ink hover:bg-editorial-ink hover:text-white hover:border-editorial-ink transition-all shadow-none"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-editorial-muted" />
                      GitHub Code
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {data.repo.homepage && (
                      <a
                        href={data.repo.homepage.startsWith("http") ? data.repo.homepage : `https://${data.repo.homepage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-none border border-editorial-border bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-editorial-accent hover:border-editorial-accent hover:bg-editorial-accent/5 transition-all shadow-none"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Topic tags (if any) to look professional */}
                {data.repo.id && (
                  <div className="flex flex-wrap gap-2" id="topic-tags-grid">
                    {((data.repo as any).topics || ["ecosystem", "open-source", "analytics"]).map((topic: string) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1 rounded-none bg-editorial-bg px-2.5 py-1 text-[10px] font-mono font-bold text-editorial-ink border border-editorial-border"
                      >
                        <Hash className="h-3 w-3 text-editorial-muted opacity-60" />
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metric Analytics Cards Row */}
                <MetricCards repo={data.repo} />

                {/* Core Visualization Bento-Grid Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" id="dashboard-charts-bento-grid">
                  
                  {/* Left Column: Code Makeup (Pie Chart) */}
                  <div className="lg:col-span-4 flex flex-col justify-stretch">
                    <LanguageBreakdownCard languages={data.languages} />
                  </div>

                  {/* Right Column: Commit Velocity Stream (Line/Area Chart) */}
                  <div className="lg:col-span-8 flex flex-col justify-stretch">
                    <CommitActivityChart commitTrend={data.commitTrend} />
                  </div>
                </div>

                {/* Supplementary Productivity Peaks: Day & Hours Breakdown (Bar Chart) */}
                <TimeAnalysisChart
                  dayOfWeekActivity={data.dayOfWeekActivity}
                  hourActivity={data.hourActivity}
                />

                {/* Principal Repository Authors Grid */}
                <ContributorsCard contributors={data.contributors} />
              </div>
            ) : (
              /* Suggestive Initial State empty message */
              <div className="rounded-none border border-editorial-border bg-white p-12 text-center" id="empty-initial-state">
                <GitBranch className="mx-auto h-12 text-editorial-muted stroke-[1.5]" />
                <h3 className="mt-4 text-base font-bold font-serif text-editorial-ink">Search for a Repository</h3>
                <p className="mt-2 text-xs uppercase tracking-wider font-bold text-editorial-muted max-w-sm mx-auto">
                  Input owner and repository title inside the path selector above to begin detailed analytical crawls.
                </p>
              </div>
            )}
          </div>
        ) : activeTab === "crypto" ? (
          <CryptoDashboard />
        ) : activeTab === "weather" ? (
          <WeatherDashboard />
        ) : (
          <CustomDataDashboard />
        )}
      </main>

      {/* 3. Global Footer Banner */}
      <footer className="mt-20 border-t border-editorial-border bg-white py-8" id="app-global-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-editorial-muted">
            Data Analytica • Styled with Premium Swiss Editorial Aesthetics
          </p>
          <p className="text-[10px] font-mono text-editorial-muted">
            Client Safe • Local Token Auth Proxy
          </p>
        </div>
      </footer>
    </div>
  );
}
