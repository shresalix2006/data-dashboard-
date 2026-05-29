import { Users, ExternalLink } from "lucide-react";
import { GitHubContributor } from "../types";

interface ContributorsCardProps {
  contributors: GitHubContributor[];
}

export function ContributorsCard({ contributors }: ContributorsCardProps) {
  if (contributors.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[220px]" id="empty-contributors-panel">
        <Users className="h-10 w-10 text-gray-300 stroke-[1.5] mb-2" />
        <p className="text-gray-500 font-medium text-sm">No contributors logged</p>
        <p className="text-gray-400 text-xs mt-1">This repository might be private or a bare init state.</p>
      </div>
    );
  }

  // Slice down to top 8 authors
  const topContributors = contributors.slice(0, 8);

  return (
    <div className="rounded-none border border-editorial-border bg-white p-6 flex flex-col" id="contributors-card">
      <div className="flex items-baseline justify-between border-b border-editorial-ink pb-3">
        <div>
          <h3 className="text-base font-bold font-serif text-editorial-ink flex items-center gap-2">
            <Users className="h-4 w-4 text-editorial-accent" />
            Top Repository Authors
          </h3>
          <p className="text-[10px] font-bold tracking-wider text-editorial-muted uppercase mt-0.5">Top contributors listed by commit volume</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="contributors-gird-container">
        {topContributors.map((user) => (
          <a
            key={user.id}
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="flex items-center gap-3.5 p-4 rounded-none border border-editorial-border bg-editorial-bg/30 hover:bg-editorial-ink hover:text-white hover:border-editorial-ink transition-all duration-300 group"
          >
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-10 w-10 rounded-none border border-editorial-border object-cover shrink-0 select-none group-hover:scale-105 group-hover:border-white/30 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-editorial-ink group-hover:text-white transition-colors flex items-center gap-1.5 truncate">
                {user.login}
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
              </span>
              <span className="text-[10px] text-editorial-muted group-hover:text-neutral-300 mt-0.5 font-medium block font-mono">
                {(user.contributions ?? 0).toLocaleString()} commits
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
