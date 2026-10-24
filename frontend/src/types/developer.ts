export interface DeveloperOverview {
  username: string;
  name?: string | null;
  avatar_url: string;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  blog?: string | null;
  twitter_username?: string | null;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  total_stars: number;
  total_forks: number;
  primary_language?: string | null;
  is_hireable?: boolean | null;
  measurement_period: string;
  data_disclaimer: string;
}

export interface RepositorySummary {
  id: number;
  name: string;
  full_name: string;
  description?: string | null;
  html_url: string;
  language?: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size_kb: number;
  created_at: string;
  updated_at: string;
  pushed_at?: string | null;
  is_fork: boolean;
  is_archived: boolean;
  license_name?: string | null;
  default_branch: string;
  topics: string[];
  health_score?: number | null;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  repo_count: number;
  color: string;
}

export interface LanguageAnalytics {
  languages: LanguageStat[];
  total_bytes: number;
  total_repos_analyzed: number;
  disclaimer: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
  day_of_week: number;
}

export interface ContributionData {
  total_contributions: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
  year: number;
  days: HeatmapDay[];
  measurement_period: string;
  disclaimer: string;
}

export interface CommitActivityEvent {
  id: string;
  type: string;
  repo_name: string;
  created_at: string;
  message?: string | null;
  author?: string | null;
  url?: string | null;
}

export interface ActivityAnalytics {
  by_day_of_week: Record<string, number>;
  by_hour: Record<string, number>;
  monthly_trend: Array<{ month: string; events: number }>;
  recent_events: CommitActivityEvent[];
  total_recent_events: number;
  weekend_percentage: number;
  disclaimer: string;
}

export interface HealthScoreBreakdown {
  repo_name: string;
  overall_score: number;
  grade: string;
  maintenance_score: number;
  documentation_score: number;
  issue_score: number;
  community_score: number;
  release_score: number;
  reasons: string[];
  suggestions: string[];
  disclaimer: string;
}

export interface PortfolioAuditFinding {
  id: string;
  category: string;
  status: 'pass' | 'warning' | 'fail';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface PortfolioAuditResult {
  username: string;
  overall_score: number;
  grade: string;
  completeness_score: number;
  repository_hygiene_score: number;
  licensing_score: number;
  findings: PortfolioAuditFinding[];
  action_items: Array<{ priority: string; task: string }>;
  disclaimer: string;
}

export interface SmartInsight {
  id: string;
  type: 'growth' | 'stagnation' | 'language_trend' | 'anomaly' | 'best_practice';
  severity: 'positive' | 'info' | 'warning';
  title: string;
  description: string;
  observation?: string | null;
  supporting_metrics?: string | null;
  calculation_method?: string | null;
  period_analyzed?: string | null;
  data_limitations?: string | null;
  metric_source: string;
}

export interface DeveloperComparison {
  developers: DeveloperOverview[];
  shared_languages: string[];
  metrics_matrix: Array<Record<string, any>>;
  disclaimer: string;
}

export interface CommitDetailItem {
  sha: string;
  author_name: string;
  author_date: string;
  message: string;
  html_url: string;
}

export interface PullRequestDetailItem {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  merged_at?: string | null;
  closed_at?: string | null;
  html_url: string;
  user_login?: string;
}

export interface IssueDetailItem {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at?: string | null;
  comments_count: number;
  html_url: string;
  user_login?: string;
}

export interface ContributorDetailItem {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface ReleaseDetailItem {
  id: number;
  tag_name: string;
  name?: string | null;
  published_at?: string | null;
  prerelease: boolean;
  html_url: string;
}

export interface BranchDetailItem {
  name: string;
  commit_sha: string;
  protected: boolean;
}

export interface RepositoryDetailExtended {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description?: string | null;
  html_url: string;
  language?: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  size_kb: number;
  default_branch: string;
  license_name?: string | null;
  created_at: string;
  updated_at: string;
  pushed_at?: string | null;
  topics: string[];
  health_score: number;
  languages_breakdown: Record<string, number>;
  recent_commits: CommitDetailItem[];
  recent_pulls: PullRequestDetailItem[];
  recent_issues: IssueDetailItem[];
  contributors: ContributorDetailItem[];
  releases: ReleaseDetailItem[];
  branches: BranchDetailItem[];
  disclaimer: string;
}

export interface RepositoryComparisonItem {
  name: string;
  full_name: string;
  stars: number;
  forks: number;
  open_issues: number;
  language?: string | null;
  health_score: number;
  size_kb: number;
  updated_at: string;
  pushed_at?: string | null;
  open_prs_count: number;
  closed_prs_count: number;
  recent_commit_count: number;
}

export interface RepositoryComparisonResponse {
  repositories: RepositoryComparisonItem[];
  metrics_matrix: Array<Record<string, any>>;
  disclaimer: string;
}

export interface BookmarkItem {
  id?: number | null;
  item_type: 'user' | 'repo';
  identifier: string;
  title: string;
  subtitle?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface SnapshotResponse {
  id: number;
  username: string;
  captured_at: string;
  followers: number;
  public_repos: number;
  total_stars: number;
  total_forks: number;
  health_score: number;
  audit_score: number;
  note?: string | null;
}

export interface UserPreferenceResponse {
  user_key: string;
  theme: string;
  layout_mode: string;
  visible_widgets: string[];
  widget_order: string[];
  pinned_developers: string[];
  updated_at: string;
}
