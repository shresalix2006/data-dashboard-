import { Star, GitFork, AlertCircle, Eye } from "lucide-react";
import { GitHubRepo } from "../types";

interface MetricCardsProps {
  repo: GitHubRepo;
}

function formatNumber(num: number | undefined | null): string {
  const n = num ?? 0;
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + "M";
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "k";
  }
  return n.toLocaleString();
}

function formatBytesToKb(kb: number | undefined | null): string {
  const k = kb ?? 0;
  if (k >= 1024 * 1024) {
    return (k / (1024 * 1024)).toFixed(1) + " GB";
  }
  if (k >= 1024) {
    return (k / 1024).toFixed(1) + " MB";
  }
  return k.toLocaleString() + " KB";
}

export function MetricCards({ repo }: MetricCardsProps) {
  const metrics = [
    {
      id: "metric-stars",
      title: "Stars",
      value: formatNumber(repo.stargazers_count),
      subtitle: `${(repo.stargazers_count ?? 0).toLocaleString()} stars total`,
      icon: Star,
      description: "organic reach",
    },
    {
      id: "metric-forks",
      title: "Forks",
      value: formatNumber(repo.forks_count),
      subtitle: `${(repo.forks_count ?? 0).toLocaleString()} forks made`,
      icon: GitFork,
      description: "code derivatives",
    },
    {
      id: "metric-issues",
      title: "Open Issues",
      value: formatNumber(repo.open_issues_count),
      subtitle: `${(repo.open_issues_count ?? 0).toLocaleString()} active items`,
      icon: AlertCircle,
      description: "development items",
    },
    {
      id: "metric-watchers",
      title: "Watchers",
      value: formatNumber(repo.watchers_count),
      subtitle: `Repo size: ${formatBytesToKb(repo.size)}`,
      icon: Eye,
      description: "subscribers",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" id="repo-metric-cards-container">
      {metrics.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="relative bg-white p-6 rounded-none border border-editorial-border transition-all duration-300 hover:border-editorial-ink group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-editorial-muted uppercase">{card.title}</p>
                <h4 className="mt-2 text-4xl font-light font-serif italic text-editorial-ink group-hover:text-editorial-accent transition-colors leading-none">
                  {card.value}
                </h4>
              </div>
              <div className="p-2.5 rounded-full border border-editorial-border text-editorial-accent bg-transparent shrink-0 group-hover:bg-editorial-ink group-hover:text-white transition-all duration-300">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-editorial-border pt-4">
              <span className="text-xs font-mono text-editorial-muted">{card.subtitle}</span>
              <span className="text-[9px] font-bold tracking-wider text-editorial-muted uppercase border border-editorial-border px-2 py-0.5 bg-editorial-bg select-none">
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
