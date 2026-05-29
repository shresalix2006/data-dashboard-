export interface GitHubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  size: number;
}

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface GitHubCommitDetail {
  author: GitHubCommitAuthor;
  message: string;
}

export interface GitHubCommit {
  sha: string;
  commit: GitHubCommitDetail;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface LanguageStat {
  name: string;
  value: number; // bytes of code
  percentage: number;
  color: string;
}

export interface CommitTrendPoint {
  dateString: string; // "YYYY-MM-DD" or formatted date
  count: number;
}

export interface DayOfWeekPoint {
  dayName: string; // "Monday", etc.
  count: number;
}

export interface HourOfDayPoint {
  hourString: string; // "14:00" etc.
  count: number;
}
