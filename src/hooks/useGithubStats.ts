import useSWR from "swr";
import { useMemo } from "react";
import {
  GitHubRepo,
  GitHubCommit,
  GitHubContributor,
  LanguageStat,
  CommitTrendPoint,
  DayOfWeekPoint,
  HourOfDayPoint,
} from "../types";

// Standard GitHub language primary colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  "C#": "#178600",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Shell: "#89e051",
  C: "#555555",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  Vue: "#41b883",
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || "#8b949e";
}

export function useGithubStats(owner: string, name: string, token?: string) {
  // Construct fetcher that includes optional client-defined safety token
  const fetcher = async (url: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers["x-github-token"] = token;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      const errorObj = new Error(errRes.error || `Failed to fetch API: ${response.status}`) as any;
      errorObj.isRateLimit = !!errRes.isRateLimit;
      errorObj.resetTime = errRes.resetTime;
      errorObj.limit = errRes.limit;
      throw errorObj;
    }
    return response.json();
  };

  const isQueryValid = owner.trim() !== "" && name.trim() !== "";

  // Set up parallel SWR hooks with 60 second state revalidation, matching standard dashboards
  const {
    data: repoData,
    error: repoError,
    isValidating: repoValidating,
  } = useSWR<GitHubRepo>(
    isQueryValid ? [`/api/github/repo?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`, token] : null,
    ([url]) => fetcher(url),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  const {
    data: languagesData,
    error: languagesError,
    isValidating: languagesValidating,
  } = useSWR<Record<string, number>>(
    isQueryValid ? [`/api/github/languages?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`, token] : null,
    ([url]) => fetcher(url),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  const {
    data: commitsData,
    error: commitsError,
    isValidating: commitsValidating,
  } = useSWR<GitHubCommit[]>(
    isQueryValid ? [`/api/github/commits?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`, token] : null,
    ([url]) => fetcher(url),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  const {
    data: contributorsData,
    error: contributorsError,
    isValidating: contributorsValidating,
  } = useSWR<GitHubContributor[]>(
    isQueryValid ? [`/api/github/contributors?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`, token] : null,
    ([url]) => fetcher(url),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  // Compute loading states
  const isLoading = isQueryValid && !repoData && !repoError;
  const isAnyValidating = repoValidating || languagesValidating || commitsValidating || contributorsValidating;
  const anyError = repoError || languagesError || commitsError || contributorsError;

  // Derive charts details elegantly using useMemo
  const formattedStats = useMemo(() => {
    if (!repoData) return null;

    // 1. Process Language breakdowns
    const languages: LanguageStat[] = [];
    if (languagesData) {
      const filteredLanguages = Object.entries(languagesData).filter(([lang]) => !lang.startsWith("__"));
      const totalBytes = filteredLanguages.reduce((sum, [_, val]) => sum + val, 0);
      if (totalBytes > 0) {
        filteredLanguages.forEach(([lang, bytes]) => {
          languages.push({
            name: lang,
            value: bytes,
            percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(1)),
            color: getLanguageColor(lang),
          });
        });
        // Sort highest first
        languages.sort((a, b) => b.value - a.value);
      }
    }

    // 2. Process Commits activity trends over time (Timeseries)
    const commitTrend: CommitTrendPoint[] = [];
    const commitsByDayOfWeek: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };
    const commitsByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      commitsByHour[i] = 0;
    }

    if (commitsData && Array.isArray(commitsData)) {
      // Temporary bucket for daily counts
      const dailyBuckets: Record<string, number> = {};

      commitsData.forEach((item) => {
        if (!item.commit || !item.commit.author || !item.commit.author.date) return;
        const dateObj = new Date(item.commit.author.date);
        
        // Populate Timeseries (key: YYYY-MM-DD)
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        dailyBuckets[dateStr] = (dailyBuckets[dateStr] || 0) + 1;

        // Populate Day of Week
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[dateObj.getDay()];
        commitsByDayOfWeek[dayName] = (commitsByDayOfWeek[dayName] || 0) + 1;

        // Populate hour
        const hour = dateObj.getHours();
        commitsByHour[hour] = (commitsByHour[hour] || 0) + 1;
      });

      // Format Timeseries chronological sorted list
      Object.entries(dailyBuckets).forEach(([dateString, count]) => {
        commitTrend.push({ dateString, count });
      });
      commitTrend.sort((a, b) => a.dateString.localeCompare(b.dateString));
    }

    // Convert Day of week counts to ordered list
    const dayNamesOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayOfWeekActivity: DayOfWeekPoint[] = dayNamesOrder.map((dayName) => ({
      dayName,
      count: commitsByDayOfWeek[dayName],
    }));

    // Convert Hour counts
    const hourActivity: HourOfDayPoint[] = Object.entries(commitsByHour).map(([hour, count]) => {
      const hrNum = parseInt(hour, 10);
      const ampm = hrNum >= 12 ? "PM" : "AM";
      const displayHr = hrNum % 12 === 0 ? 12 : hrNum % 12;
      return {
        hourString: `${displayHr} ${ampm}`,
        count,
      };
    });

    return {
      repo: repoData,
      languages,
      commitTrend,
      dayOfWeekActivity,
      hourActivity,
      contributors: contributorsData || [],
    };
  }, [repoData, languagesData, commitsData, contributorsData]);

  return {
    data: formattedStats,
    isLoading,
    isValidating: isAnyValidating,
    error: anyError,
  };
}
