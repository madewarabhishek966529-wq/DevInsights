import React, { useEffect, useState } from 'react';
import { RepositoryDetailExtended } from '../types/developer';
import { devApi } from '../services/api';
import {
  X, ExternalLink, GitCommit, GitPullRequest, AlertCircle,
  Users, Tag, GitBranch, Star, GitFork, ShieldCheck,
  Bookmark, BookmarkCheck, Calendar, HardDrive, CheckCircle2,
  Clock, AlertTriangle
} from 'lucide-react';

interface RepositoryDetailModalProps {
  fullName: string; // e.g. "torvalds/linux"
  onClose: () => void;
}

export const RepositoryDetailModal: React.FC<RepositoryDetailModalProps> = ({
  fullName,
  onClose
}) => {
  const [data, setData] = useState<RepositoryDetailExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'pulls' | 'issues' | 'contributors' | 'releases' | 'branches'>('overview');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [savingBookmark, setSavingBookmark] = useState<boolean>(false);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        setLoading(true);
        setError(null);
        const parts = fullName.split('/');
        if (parts.length !== 2) {
          throw new Error(`Invalid repository identifier: ${fullName}`);
        }
        const [owner, repo] = parts;
        const res = await devApi.getRepositoryExtended(owner, repo);
        setData(res);

        // Check bookmark status
        try {
          const bookmarks = await devApi.getBookmarks('repo');
          const exists = bookmarks.some(b => b.identifier.toLowerCase() === fullName.toLowerCase());
          setIsBookmarked(exists);
        } catch {
          // ignore bookmark check error
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load repository details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, [fullName]);

  const toggleBookmark = async () => {
    if (!data || savingBookmark) return;
    try {
      setSavingBookmark(true);
      if (isBookmarked) {
        await devApi.deleteBookmarkByIdentifier('repo', data.full_name);
        setIsBookmarked(false);
      } else {
        await devApi.createBookmark({
          item_type: 'repo',
          identifier: data.full_name,
          title: data.name,
          subtitle: `${data.language || 'Unknown'} • ★ ${data.stargazers_count.toLocaleString()}`,
          avatar_url: undefined
        });
        setIsBookmarked(true);
      }
    } catch (err: any) {
      console.error('Bookmark toggle failed', err);
    } finally {
      setSavingBookmark(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {fullName}
                </h2>
                <a
                  href={`https://github.com/${fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Open on GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time GitHub repository inspection & sub-resource telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleBookmark}
              disabled={savingBookmark || loading || !!error}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Repo</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {data && !loading && (
          <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('commits')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'commits'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commits ({data.recent_commits.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pulls')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pulls'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Pull Requests ({data.recent_pulls.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'issues'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Issues ({data.recent_issues.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('contributors')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'contributors'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contributors ({data.contributors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('releases')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'releases'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Releases ({data.releases.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'branches'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Branches ({data.branches.length})</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Fetching real repository data from GitHub REST API...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Unable to Load Repository</p>
                <p className="mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>Stars</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {data.stargazers_count.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <GitFork className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Forks</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {data.forks_count.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Open Issues</span>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {data.open_issues_count.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Health Score</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-400 mt-1">
                        {data.health_score}/100
                      </p>
                    </div>
                  </div>

                  {/* Description & Metadata */}
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      About Project
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {data.description || 'No description provided for this repository.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/60 text-slate-400">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span>Size: <strong className="text-slate-200">{Math.round(data.size_kb / 1024 * 10) / 10} MB</strong> ({data.size_kb.toLocaleString()} KB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                        <span>Default Branch: <strong className="text-slate-200">{data.default_branch}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Created: <strong className="text-slate-200">{data.created_at.slice(0, 10)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Last Push: <strong className="text-slate-200">{(data.pushed_at || data.updated_at).slice(0, 10)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Languages Breakdown */}
                  {Object.keys(data.languages_breakdown).length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Language Composition (Bytes)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(data.languages_breakdown).map(([lang, bytes]) => (
                          <span
                            key={lang}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-mono"
                          >
                            {lang}: <strong className="text-white">{(bytes / 1024).toFixed(0)} KB</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COMMITS */}
              {activeTab === 'commits' && (
                <div className="space-y-2">
                  {data.recent_commits.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No recent commits found or repository is empty.
                    </div>
                  ) : (
                    data.recent_commits.map((c) => (
                      <div
                        key={c.sha}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="text-slate-200 font-medium leading-snug">{c.message}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-indigo-400 font-medium">{c.author_name}</span>
                            <span>•</span>
                            <span>{c.author_date.slice(0, 10)}</span>
                          </div>
                        </div>
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-800 text-indigo-300 hover:text-white flex items-center gap-1 flex-shrink-0"
                        >
                          <span>{c.sha}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: PULL REQUESTS */}
              {activeTab === 'pulls' && (
                <div className="space-y-2">
                  {data.recent_pulls.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No pull requests recorded for this repository.
                    </div>
                  ) : (
                    data.recent_pulls.map((pr) => (
                      <div
                        key={pr.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              pr.state === 'open' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {pr.state}
                            </span>
                            <span className="font-mono text-slate-400">#{pr.number}</span>
                            <p className="text-slate-200 font-medium">{pr.title}</p>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Created {pr.created_at.slice(0, 10)} by {pr.user_login}
                          </p>
                        </div>
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: ISSUES */}
              {activeTab === 'issues' && (
                <div className="space-y-2">
                  {data.recent_issues.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No open or recent issues detected.
                    </div>
                  ) : (
                    data.recent_issues.map((i) => (
                      <div
                        key={i.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              i.state === 'open' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              {i.state}
                            </span>
                            <span className="font-mono text-slate-400">#{i.number}</span>
                            <p className="text-slate-200 font-medium">{i.title}</p>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Created {i.created_at.slice(0, 10)} • {i.comments_count} comment(s)
                          </p>
                        </div>
                        <a
                          href={i.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: CONTRIBUTORS */}
              {activeTab === 'contributors' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {data.contributors.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
                      Contributor data unavailable or rate limited.
                    </div>
                  ) : (
                    data.contributors.map((c) => (
                      <a
                        key={c.login}
                        href={c.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 text-xs hover:border-indigo-500/50 transition-colors"
                      >
                        <img
                          src={c.avatar_url}
                          alt={c.login}
                          className="w-9 h-9 rounded-full border border-slate-700"
                        />
                        <div className="overflow-hidden">
                          <p className="text-slate-200 font-semibold truncate">{c.login}</p>
                          <p className="text-[11px] text-slate-400">{c.contributions.toLocaleString()} commit(s)</p>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: RELEASES */}
              {activeTab === 'releases' && (
                <div className="space-y-2">
                  {data.releases.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No published releases or tags found for this repository.
                    </div>
                  ) : (
                    data.releases.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-bold text-white">{r.name || r.tag_name}</span>
                            <span className="font-mono text-slate-400 text-[11px]">({r.tag_name})</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Published: {r.published_at ? r.published_at.slice(0, 10) : 'Draft / Untagged'}
                          </p>
                        </div>
                        <a
                          href={r.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 7: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.branches.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
                      No branches found.
                    </div>
                  ) : (
                    data.branches.map((b) => (
                      <div
                        key={b.name}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-slate-200">{b.name}</span>
                          {b.protected && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Protected
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                          {b.commit_sha}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Methodology & Scope Disclaimer */}
              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 italic">
                {data.disclaimer}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
