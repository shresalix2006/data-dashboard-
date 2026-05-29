import React, { useState, useEffect, useMemo } from "react";
import { Search, Key, ShieldAlert, CheckCircle2, RefreshCw, Sparkles, Code, GitBranch, Star, GitFork, ChevronRight, User, Users, MapPin, Building, Link, Calendar } from "lucide-react";

interface QuerySelectorProps {
  currentOwner: string;
  currentRepo: string;
  onQueryChange: (owner: string, name: string) => void;
  isLoading: boolean;
  onTokenChange: (token: string) => void;
  savedToken: string;
}

const PRESETS = [
  { label: "React", owner: "facebook", repo: "react" },
  { label: "Next.js", owner: "vercel", repo: "next.js" },
  { label: "Tailwind v4", owner: "tailwindlabs", repo: "tailwindcss" },
  { label: "Express", owner: "expressjs", repo: "express" },
  { label: "Vite", owner: "vitejs", repo: "vite" },
  { label: "Framer Motion", owner: "motiondivision", repo: "motion" },
];

export function QuerySelector({
  currentOwner,
  currentRepo,
  onQueryChange,
  isLoading,
  onTokenChange,
  savedToken,
}: QuerySelectorProps) {
  const [searchInput, setSearchInput] = useState(`${currentOwner}/${currentRepo}`);
  const [personalToken, setPersonalToken] = useState(savedToken);
  const [showTokenSection, setShowTokenSection] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [serverHasToken, setServerHasToken] = useState(false);

  // States to hold user/organisation repository listings and profile when just a username is submitted
  const [userRepos, setUserRepos] = useState<any[] | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [queriedUsername, setQueriedUsername] = useState("");

  // Aggregate user statistics based on fetched repos
  const profileAggregates = useMemo(() => {
    if (!userRepos) return null;
    let totalStars = 0;
    let totalForks = 0;
    const languagesMap: Record<string, number> = {};
    
    userRepos.forEach((repo: any) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([lang, count]) => ({ lang, count }));
      
    return {
      totalStars,
      totalForks,
      topLanguages,
    };
  }, [userRepos]);

  // Synchronize changes from state
  useEffect(() => {
    setSearchInput(`${currentOwner}/${currentRepo}`);
    setUserRepos(null);
    setUserProfile(null);
    setQueriedUsername("");
  }, [currentOwner, currentRepo]);

  // Read backend environmental GITHUB_TOKEN status on mount
  useEffect(() => {
    fetch("/api/github/token-status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasServerToken) {
          setServerHasToken(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setUserRepos(null);
    setQueriedUsername("");

    const term = searchInput.trim();
    if (!term) {
      setErrorText("Please enter a username or repository path.");
      return;
    }

    const segments = term.split("/");
    
    // User or Org search (no '/' or empty right-hand side)
    if (segments.length === 1 || !segments[1]) {
      const username = segments[0].trim();
      setFetchingRepos(true);
      setErrorText("");
      setUserProfile(null);
      setUserRepos(null);
      try {
        const headers: Record<string, string> = {};
        if (savedToken) {
          headers["x-github-token"] = savedToken;
        }
        
        // Fetch both profile details and repository listings in parallel
        const [profileRes, reposRes] = await Promise.all([
          fetch(`/api/github/user-profile?username=${encodeURIComponent(username)}`, { headers }),
          fetch(`/api/github/user-repos?username=${encodeURIComponent(username)}`, { headers })
        ]);
        
        if (!profileRes.ok) {
          const errRes = await profileRes.json().catch(() => ({}));
          throw new Error(errRes.error || `GitHub profile for @${username} not found.`);
        }
        if (!reposRes.ok) {
          const errRes = await reposRes.json().catch(() => ({}));
          throw new Error(errRes.error || `Failed to fetch repositories for @${username}.`);
        }
        
        const profile = await profileRes.json();
        const repos = await reposRes.json();
        
        if (Array.isArray(repos)) {
          setUserProfile(profile);
          setUserRepos(repos);
          setQueriedUsername(username);
        } else {
          throw new Error("Failed to load repositories roster");
        }
      } catch (err: any) {
        setErrorText(err.message || `Unable to fetch details for @${username}. Check if account is valid.`);
      } finally {
        setFetchingRepos(false);
      }
      return;
    }

    if (segments.length !== 2 || !segments[0] || !segments[1]) {
      setErrorText("Format must be 'owner/repository' (e.g. facebook/react) or 'username' (e.g. vercel)");
      return;
    }

    const cleanOwner = segments[0].trim();
    const cleanRepo = segments[1].trim();

    onQueryChange(cleanOwner, cleanRepo);
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setErrorText("");
    setUserRepos(null);
    setUserProfile(null);
    setQueriedUsername("");
    setSearchInput(`${preset.owner}/${preset.repo}`);
    onQueryChange(preset.owner, preset.repo);
  };

  const handleSaveToken = () => {
    onTokenChange(personalToken.trim());
    setShowTokenSection(false);
  };

  return (
    <div className="rounded-none border border-editorial-border bg-white p-6" id="query-selector-panel">
      {/* Target Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4.5 w-4.5 text-editorial-muted stroke-[2]" />
          </div>
          <input
            type="text"
            className={`w-full rounded-none border border-editorial-border bg-editorial-bg/30 py-3.5 pl-11 pr-4 text-sm font-semibold text-editorial-ink placeholder-editorial-muted outline-hidden transition-all focus:border-editorial-ink focus:bg-white focus:ring-0 ${
              errorText ? "border-rose-300 bg-rose-50/10 focus:border-rose-500" : ""
            }`}
            placeholder="Search username (e.g., vercel) or repo path (e.g., facebook/react)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading || fetchingRepos}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Submit Action search */}
          <button
            type="submit"
            disabled={isLoading || fetchingRepos}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-none bg-editorial-ink px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-editorial-accent active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading || fetchingRepos ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                Querying...
              </>
            ) : (
              <>
                <GitBranch className="h-3.5 w-3.5 stroke-[2.5]" />
                Analyze
              </>
            )}
          </button>

          {/* Token toggle button */}
          <button
            type="button"
            onClick={() => setShowTokenSection(!showTokenSection)}
            className={`px-4 py-3.5 rounded-none border transition-all flex items-center justify-center ${
              savedToken
                ? "bg-editorial-accent/10 text-editorial-accent border-editorial-accent/30 hover:bg-editorial-accent/20"
                : "bg-editorial-bg text-editorial-muted border-editorial-border hover:bg-editorial-ink hover:text-white hover:border-editorial-ink"
            }`}
            title="Configure Personal Access Token"
          >
            <Key className="h-4 w-4 stroke-[2]" />
          </button>
        </div>
      </form>

      {/* Input Format Error Message */}
      {errorText && (
        <p className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          {errorText}
        </p>
      )}

      {/* Dynamic user profile stats & repository listing (Displayed when username only search completes) */}
      {userRepos && userRepos.length > 0 && userProfile && (
        <div className="mt-6 border border-editorial-border bg-white p-6 rounded-none animate-fadeIn space-y-6" id="user-profile-and-repos-container">
          
          {/* Section 1: Developer Profile Card */}
          <div className="flex flex-col md:flex-row gap-6 p-4 bg-editorial-bg border border-editorial-border hover:border-editorial-ink transition duration-300">
            <img
              src={userProfile.avatar_url}
              alt={userProfile.login}
              className="h-20 w-20 rounded-none object-cover border border-editorial-border shrink-0 bg-white"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-bold text-editorial-ink leading-none">
                  {userProfile.name || userProfile.login}
                </span>
                <span className="text-xs font-mono font-bold text-editorial-accent hover:underline">
                  @{userProfile.login}
                </span>
                {userProfile.type && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-neutral-900 text-white font-mono leading-none ml-1">
                    {userProfile.type}
                  </span>
                )}
              </div>
              
              {userProfile.bio && (
                <p className="text-xs font-serif italic text-editorial-ink/90 leading-relaxed max-w-2xl">
                  "{userProfile.bio}"
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-mono font-bold text-editorial-muted pt-1">
                {userProfile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    {userProfile.company}
                  </span>
                )}
                {userProfile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {userProfile.location}
                  </span>
                )}
                {userProfile.blog && (
                  <a
                    href={userProfile.blog.startsWith("http") ? userProfile.blog : `https://${userProfile.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-1.5 hover:text-editorial-accent transition"
                  >
                    <Link className="h-3.5 w-3.5" />
                    {userProfile.blog}
                  </a>
                )}
                {userProfile.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(userProfile.created_at).toLocaleDateString([], { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Account Level Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Public Repos", value: userProfile.public_repos, desc: "On GitHub Profile" },
              { label: "Public Gists", value: userProfile.public_gists, desc: "Snippets published" },
              { label: "Followers", value: userProfile.followers, desc: "Connections" },
              { label: "Following", value: userProfile.following, desc: "Following" },
              { 
                label: "Retrieved Stars", 
                value: profileAggregates?.totalStars || 0, 
                desc: `Across latest ${userRepos.length} repos`,
                highlight: true 
              },
              { 
                label: "Retrieved Forks", 
                value: profileAggregates?.totalForks || 0, 
                desc: "Forks on these projects" 
              }
            ].map((stat) => (
              <div 
                key={stat.label} 
                className={`p-3.5 border ${
                  stat.highlight 
                    ? "border-editorial-ink bg-editorial-bg" 
                    : "border-editorial-border bg-white"
                } rounded-none flex flex-col justify-between`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted">
                  {stat.label}
                </div>
                <div className="text-xl font-bold font-mono text-editorial-ink mt-1">
                  {(stat.value ?? 0).toLocaleString()}
                </div>
                <div className="text-[9px] text-editorial-muted font-sans mt-1 line-clamp-1">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Technology Mix Breakdown */}
          {profileAggregates && profileAggregates.topLanguages.length > 0 && (
            <div className="border border-editorial-border bg-editorial-bg/30 p-4 rounded-none">
              <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase block mb-2.5">
                Primary Languages Roster:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {profileAggregates.topLanguages.map(({ lang, count }) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 rounded-none bg-white px-3 py-1.5 text-xs font-mono font-bold text-editorial-ink border border-editorial-border shadow-2xs hover:border-editorial-ink transition"
                  >
                    <Code className="h-3.5 w-3.5 text-editorial-accent" />
                    {lang}
                    <span className="text-[10px] font-light text-editorial-muted ml-1">
                      ({count} projects)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Repository Picker */}
          <div className="border-t border-editorial-border pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-editorial-ink" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-ink">
                  Select a repository to view deep code timeseries analytics:
                </h4>
              </div>
              <span className="text-[10px] font-mono text-editorial-muted font-bold uppercase bg-editorial-bg border border-editorial-border px-2 py-0.5">
                Listing {userRepos.length} Repos
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {userRepos.map((repo: any) => (
                <button
                  key={repo.id}
                  type="button"
                  onClick={() => {
                    onQueryChange(queriedUsername, repo.name);
                    setUserRepos(null);
                    setUserProfile(null);
                    setQueriedUsername("");
                  }}
                  className="text-left p-3.5 bg-white border border-editorial-border hover:border-editorial-ink transition group flex flex-col justify-between h-full hover:shadow-xs rounded-none"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-editorial-ink line-clamp-1 group-hover:text-editorial-accent transition-colors flex items-center gap-1">
                        {repo.name}
                      </span>
                      <ChevronRight className="h-3 w-3 text-editorial-muted group-hover:text-editorial-accent group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-[10px] text-editorial-muted font-sans line-clamp-2 mt-1 leading-snug h-7">
                      {repo.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px] uppercase font-mono font-bold border-t border-editorial-border/40 pt-2.5">
                    {repo.language ? (
                      <span className="flex items-center gap-1 text-editorial-ink leading-none">
                        <Code className="h-3 w-3 text-editorial-accent" />
                        {repo.language}
                      </span>
                    ) : (
                      <span className="text-editorial-muted font-light">Unknown lang</span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-editorial-muted shrink-0">
                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500/10" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1 text-editorial-muted shrink-0">
                        <GitFork className="h-2.5 w-2.5 text-editorial-muted" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Presets segment list */}
      <div className="mt-5 flex flex-wrap items-center gap-2" id="presets-segment-wrapper">
        <span className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase flex items-center gap-1 mr-2">
          <Sparkles className="h-3.5 w-3.5 text-editorial-accent shrink-0" />
          Suggestions:
        </span>
        {PRESETS.map((preset) => {
          const isActive = currentOwner === preset.owner && currentRepo === preset.repo;
          return (
            <button
              key={`${preset.owner}-${preset.repo}`}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs font-bold rounded-none border transition-all ${
                isActive
                  ? "bg-editorial-ink text-white border-editorial-ink"
                  : "bg-white text-editorial-ink border-editorial-border hover:border-editorial-ink"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Personal Access Token input section */}
      {showTokenSection && (
        <div className="mt-4 border-t border-dashed border-editorial-border pt-4" id="token-input-drawer">
          <div className="rounded-none border border-editorial-border bg-editorial-bg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1.5">
              <Key className="h-4 w-4 text-editorial-accent" />
              GitHub REST Rate Limits
            </h4>
            <p className="text-[11px] text-editorial-muted mt-2 leading-relaxed font-sans">
              GitHub allows 60 free queries per hour for unauthenticated callers. We have implemented local cache proxy layers to minimize consumption. 
              {serverHasToken ? (
                <span className="text-editorial-ink font-semibold block mt-2 flex items-center gap-1.5 border-t border-editorial-border/40 pt-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-editorial-accent" />
                  Shared server-side token is active (offers up to 5,000 queries per hour for all visitors).
                </span>
              ) : (
                <span className="block mt-2">
                  If you exceed 60 requests/hr, paste an optional Personal Access Token (PAT) below. It is stored in your local browser and used on proxied fetchers.
                </span>
              )}
            </p>

            <div className="mt-4 flex gap-2">
              <input
                type="password"
                className="flex-1 rounded-none border border-editorial-border bg-white px-3 py-2 text-xs font-mono text-editorial-ink placeholder-editorial-muted outline-hidden focus:border-editorial-ink"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={personalToken}
                onChange={(e) => setPersonalToken(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSaveToken}
                className="rounded-none bg-editorial-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-900 transition"
              >
                Apply Token
              </button>
              {savedToken && (
                <button
                  type="button"
                  onClick={() => {
                    setPersonalToken("");
                    onTokenChange("");
                    setShowTokenSection(false);
                  }}
                  className="rounded-none bg-white border border-editorial-border px-3 py-2 text-xs font-bold text-editorial-muted hover:border-editorial-ink/60 transition"
                >
                  Clear Status
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
