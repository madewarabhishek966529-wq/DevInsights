import {
  DeveloperOverview, RepositorySummary, LanguageAnalytics,
  ContributionData, ActivityAnalytics, PortfolioAuditResult,
  SmartInsight, DeveloperComparison, SnapshotResponse,
  UserPreferenceResponse, RepositoryDetailExtended,
  CommitDetailItem, PullRequestDetailItem, IssueDetailItem,
  ContributorDetailItem, ReleaseDetailItem, BranchDetailItem,
  RepositoryComparisonResponse, BookmarkItem
} from '../types/developer';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // not JSON
    }
    throw new ApiError(errorDetail, res.status);
  }
  return res.json() as Promise<T>;
}

export const devApi = {
  async getOverview(username: string): Promise<DeveloperOverview> {
    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/overview`);
    return handleResponse<DeveloperOverview>(res);
  },

  async getRepositories(
    username: string,
    params?: { sort?: string; order?: string; language?: string; include_forks?: boolean; limit?: number }
  ): Promise<RepositorySummary[]> {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.language) searchParams.set('language', params.language);
    if (params?.include_forks !== undefined) searchParams.set('include_forks', String(params.include_forks));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/repositories?${searchParams.toString()}`);
    return handleResponse<RepositorySummary[]>(res);
  },

  async getLanguages(username: string): Promise<LanguageAnalytics> {
    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/languages`);
    return handleResponse<LanguageAnalytics>(res);
  },

  async getActivity(username: string): Promise<ActivityAnalytics> {
    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/activity`);
    return handleResponse<ActivityAnalytics>(res);
  },

  async getContributions(username: string, year?: number): Promise<ContributionData> {
    const url = year 
      ? `${API_BASE}/developers/${encodeURIComponent(username)}/contributions?year=${year}`
      : `${API_BASE}/developers/${encodeURIComponent(username)}/contributions`;
    const res = await fetch(url);
    return handleResponse<ContributionData>(res);
  },

  async getPortfolioAudit(username: string): Promise<PortfolioAuditResult> {
    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/portfolio-audit`);
    return handleResponse<PortfolioAuditResult>(res);
  },

  async getInsights(username: string): Promise<SmartInsight[]> {
    const res = await fetch(`${API_BASE}/developers/${encodeURIComponent(username)}/insights`);
    return handleResponse<SmartInsight[]>(res);
  },

  async getRepoHealth(owner: string, repo: string) {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/health`);
    return handleResponse<any>(res);
  },

  async getRepositoryExtended(owner: string, repo: string): Promise<RepositoryDetailExtended> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    return handleResponse<RepositoryDetailExtended>(res);
  },

  async getRepositoryCommits(owner: string, repo: string, perPage: number = 20): Promise<CommitDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`);
    return handleResponse<CommitDetailItem[]>(res);
  },

  async getRepositoryPulls(owner: string, repo: string, state: string = 'all'): Promise<PullRequestDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${state}`);
    return handleResponse<PullRequestDetailItem[]>(res);
  },

  async getRepositoryIssues(owner: string, repo: string, state: string = 'all'): Promise<IssueDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=${state}`);
    return handleResponse<IssueDetailItem[]>(res);
  },

  async getRepositoryContributors(owner: string, repo: string): Promise<ContributorDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`);
    return handleResponse<ContributorDetailItem[]>(res);
  },

  async getRepositoryReleases(owner: string, repo: string): Promise<ReleaseDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`);
    return handleResponse<ReleaseDetailItem[]>(res);
  },

  async getRepositoryBranches(owner: string, repo: string): Promise<BranchDetailItem[]> {
    const res = await fetch(`${API_BASE}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`);
    return handleResponse<BranchDetailItem[]>(res);
  },

  async searchRepositories(query: string, sort: string = 'stars', order: string = 'desc'): Promise<any> {
    const res = await fetch(`${API_BASE}/repositories/search?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}`);
    return handleResponse<any>(res);
  },

  async compareDevelopers(usernames: string[]): Promise<DeveloperComparison> {
    const res = await fetch(`${API_BASE}/developers/compare?usernames=${encodeURIComponent(usernames.join(','))}`);
    return handleResponse<DeveloperComparison>(res);
  },

  async compareRepositories(repos: string[]): Promise<RepositoryComparisonResponse> {
    const res = await fetch(`${API_BASE}/repositories/compare?repos=${encodeURIComponent(repos.join(','))}`);
    return handleResponse<RepositoryComparisonResponse>(res);
  },

  async getBookmarks(itemType?: string): Promise<BookmarkItem[]> {
    const url = itemType ? `${API_BASE}/bookmarks?item_type=${encodeURIComponent(itemType)}` : `${API_BASE}/bookmarks`;
    const res = await fetch(url);
    return handleResponse<BookmarkItem[]>(res);
  },

  async createBookmark(item: { item_type: 'user' | 'repo'; identifier: string; title: string; subtitle?: string; avatar_url?: string }): Promise<BookmarkItem> {
    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse<BookmarkItem>(res);
  },

  async deleteBookmark(bookmarkId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/bookmarks/${bookmarkId}`, { method: 'DELETE' });
    return handleResponse<any>(res);
  },

  async deleteBookmarkByIdentifier(itemType: 'user' | 'repo', identifier: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bookmarks/remove/${itemType}/${encodeURIComponent(identifier)}`, { method: 'DELETE' });
    return handleResponse<any>(res);
  },

  async getSnapshots(username: string): Promise<SnapshotResponse[]> {
    const res = await fetch(`${API_BASE}/snapshots/${encodeURIComponent(username)}`);
    return handleResponse<SnapshotResponse[]>(res);
  },

  async createSnapshot(username: string, note?: string): Promise<SnapshotResponse> {
    const res = await fetch(`${API_BASE}/snapshots/${encodeURIComponent(username)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, note })
    });
    return handleResponse<SnapshotResponse>(res);
  },

  async getPreferences(userKey: string = 'default'): Promise<UserPreferenceResponse> {
    const res = await fetch(`${API_BASE}/preferences?user_key=${encodeURIComponent(userKey)}`);
    return handleResponse<UserPreferenceResponse>(res);
  },

  async updatePreferences(body: any, userKey: string = 'default'): Promise<UserPreferenceResponse> {
    const res = await fetch(`${API_BASE}/preferences?user_key=${encodeURIComponent(userKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<UserPreferenceResponse>(res);
  },

  async exportReport(payload: { username: string; format: 'csv' | 'json'; include_repos: boolean; include_languages: boolean; include_activity: boolean }): Promise<Blob> {
    const res = await fetch(`${API_BASE}/reports/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new ApiError('Failed to generate export report', res.status);
    }
    return res.blob();
  }
};
