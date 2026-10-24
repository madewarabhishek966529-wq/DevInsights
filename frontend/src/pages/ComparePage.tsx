import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { devApi } from '../services/api';
import { DeveloperComparison, RepositoryComparisonResponse } from '../types/developer';
import { Navbar } from '../components/Navbar';
import { 
  GitCompare, Search, Plus, X, Star, GitFork, 
  Users, FolderGit2, Code2, AlertCircle, Info, 
  ExternalLink, BarChart3, ShieldCheck, GitPullRequest,
  GitCommit, Clock, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';

interface ComparePageProps {
  theme: string;
  onToggleTheme: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ theme, onToggleTheme }) => {
  const [compareMode, setCompareMode] = useState<'developer' | 'repository'>('developer');

  // Developer mode state
  const [usernames, setUsernames] = useState<string[]>(['torvalds', 'gaearon']);
  const [newUsername, setNewUsername] = useState<string>('');
  const [devComparison, setDevComparison] = useState<DeveloperComparison | null>(null);
  const [devLoading, setDevLoading] = useState<boolean>(true);
  const [devError, setDevError] = useState<string | null>(null);

  // Repository mode state
  const [repos, setRepos] = useState<string[]>(['facebook/react', 'vuejs/vue']);
  const [newRepo, setNewRepo] = useState<string>('');
  const [repoComparison, setRepoComparison] = useState<RepositoryComparisonResponse | null>(null);
  const [repoLoading, setRepoLoading] = useState<boolean>(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const fetchDevComparison = async (users: string[]) => {
    if (users.length < 2) return;
    try {
      setDevLoading(true);
      setDevError(null);
      const data = await devApi.compareDevelopers(users);
      setDevComparison(data);
    } catch (err: any) {
      setDevError(err.message || 'Failed to compare developers.');
    } finally {
      setDevLoading(false);
    }
  };

  const fetchRepoComparison = async (repoList: string[]) => {
    if (repoList.length < 2) return;
    try {
      setRepoLoading(true);
      setRepoError(null);
      const data = await devApi.compareRepositories(repoList);
      setRepoComparison(data);
    } catch (err: any) {
      setRepoError(err.message || 'Failed to compare repositories.');
    } finally {
      setRepoLoading(false);
    }
  };

  useEffect(() => {
    fetchDevComparison(usernames);
  }, []);

  useEffect(() => {
    if (compareMode === 'repository' && !repoComparison && !repoLoading) {
      fetchRepoComparison(repos);
    }
  }, [compareMode]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim().toLowerCase().replace(/^@/, '');
    if (trimmed && !usernames.includes(trimmed)) {
      if (usernames.length >= 4) {
        alert('You can compare a maximum of 4 developers at once.');
        return;
      }
      const updated = [...usernames, trimmed];
      setUsernames(updated);
      setNewUsername('');
      fetchDevComparison(updated);
    }
  };

  const handleRemoveUser = (userToRemove: string) => {
    if (usernames.length <= 2) {
      alert('At least 2 developers are required for side-by-side comparison.');
      return;
    }
    const updated = usernames.filter((u) => u !== userToRemove);
    setUsernames(updated);
    fetchDevComparison(updated);
  };

  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRepo.trim();
    if (trimmed && !repos.includes(trimmed)) {
      if (!trimmed.includes('/')) {
        alert("Please format as 'owner/repo', e.g. 'torvalds/linux'.");
        return;
      }
      if (repos.length >= 4) {
        alert('You can compare a maximum of 4 repositories at once.');
        return;
      }
      const updated = [...repos, trimmed];
      setRepos(updated);
      setNewRepo('');
      fetchRepoComparison(updated);
    }
  };

  const handleRemoveRepo = (repoToRemove: string) => {
    if (repos.length <= 2) {
      alert('At least 2 repositories are required for side-by-side comparison.');
      return;
    }
    const updated = repos.filter((r) => r !== repoToRemove);
    setRepos(updated);
    fetchRepoComparison(updated);
  };

  // Prepare chart data for devs
  const devChartData = devComparison?.developers.map((dev) => ({
    name: dev.username,
    Stars: dev.total_stars,
    Repositories: dev.public_repos,
    Followers: dev.followers
  })) || [];

  // Prepare chart data for repos
  const repoChartData = repoComparison?.repositories.map((r) => ({
    name: r.name,
    Stars: r.stars,
    Forks: r.forks,
    'Open Issues': r.open_issues,
    'Recent Commits': r.recent_commit_count
  })) || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Comparison Suite
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Side-by-side benchmarking of public developers or open-source repositories using live GitHub API metrics
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setCompareMode('developer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                compareMode === 'developer'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Developers</span>
            </button>
            <button
              onClick={() => setCompareMode('repository')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                compareMode === 'repository'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Repositories</span>
            </button>
          </div>
        </div>

        {/* -------------------- DEVELOPER COMPARISON MODE -------------------- */}
        {compareMode === 'developer' && (
          <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Active Developers:</span>
                {usernames.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    @{u}
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(u)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddUser} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Add username..."
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                  />
                </div>
                <button
                  type="submit"
                  disabled={devLoading || !newUsername.trim() || usernames.length >= 4}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {devLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Fetching developer profiles and aggregating metrics...</p>
              </div>
            ) : devError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{devError}</span>
              </div>
            ) : devComparison ? (
              <>
                {/* Developer Profiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {devComparison.developers.map((dev) => (
                    <div
                      key={dev.username}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={dev.avatar_url}
                            alt={dev.username}
                            className="w-12 h-12 rounded-full border border-slate-700 shadow-sm"
                          />
                          <div className="overflow-hidden">
                            <h2 className="text-sm font-bold text-white truncate">
                              {dev.name || dev.username}
                            </h2>
                            <p className="text-xs text-indigo-400 font-medium">
                              @{dev.username}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                          {dev.bio || 'No public bio provided.'}
                        </p>

                        <div className="space-y-2 py-3 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400" /> Total Stars
                            </span>
                            <span className="font-bold text-white font-mono">
                              {dev.total_stars.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" /> Repositories
                            </span>
                            <span className="font-bold text-white font-mono">
                              {dev.public_repos}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-400" /> Followers
                            </span>
                            <span className="font-bold text-white font-mono">
                              {dev.followers.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <Link
                          to={`/dashboard/${dev.username}`}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View Analytics →
                        </Link>
                        <a
                          href={dev.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metrics Matrix Table */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg overflow-x-auto">
                  <h3 className="text-sm font-bold text-white tracking-tight mb-4">
                    Comparative Metrics Matrix
                  </h3>
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
                        {devComparison.developers.map((d) => (
                          <th key={d.username} className="py-3 px-4 font-semibold">
                            @{d.username}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {devComparison.metrics_matrix.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-slate-200">
                            {row.metric}
                          </td>
                          {devComparison.developers.map((d) => (
                            <td key={d.username} className="py-3 px-4 font-bold text-white">
                              {typeof row[d.username] === 'number'
                                ? row[d.username].toLocaleString()
                                : row[d.username] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Visual Bar Comparison Chart */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white tracking-tight mb-4">
                    Visual Ratio Comparison (Stars vs Repositories vs Followers)
                  </h3>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={devChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Stars" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Repositories" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Followers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Shared Technologies */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 font-medium">Shared Programming Languages:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {devComparison.shared_languages.length === 0 ? (
                      <span className="text-slate-500 italic">No common languages across default branches</span>
                    ) : (
                      devComparison.shared_languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-sky-400 font-semibold"
                        >
                          {lang}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-400">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{devComparison.disclaimer}</span>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* -------------------- REPOSITORY COMPARISON MODE -------------------- */}
        {compareMode === 'repository' && (
          <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Active Repositories:</span>
                {repos.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => handleRemoveRepo(r)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddRepo} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="owner/repo (e.g. torvalds/linux)"
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
                  />
                </div>
                <button
                  type="submit"
                  disabled={repoLoading || !newRepo.trim() || repos.length >= 4}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Repo</span>
                </button>
              </form>
            </div>

            {repoLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Fetching repository telemetries, commits, and PRs...</p>
              </div>
            ) : repoError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{repoError}</span>
              </div>
            ) : repoComparison ? (
              <>
                {/* Repositories Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {repoComparison.repositories.map((repo) => (
                    <div
                      key={repo.full_name}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                            {repo.language || 'Multi-stack'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            Health {repo.health_score}
                          </span>
                        </div>

                        <h2 className="text-sm font-bold text-white tracking-tight break-all">
                          {repo.full_name}
                        </h2>

                        <div className="space-y-2 py-3 mt-3 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400" /> Stars
                            </span>
                            <span className="font-bold text-white font-mono">
                              {repo.stars.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <GitFork className="w-3.5 h-3.5 text-indigo-400" /> Forks
                            </span>
                            <span className="font-bold text-white font-mono">
                              {repo.forks.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Open Issues
                            </span>
                            <span className="font-bold text-white font-mono">
                              {repo.open_issues.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <GitCommit className="w-3.5 h-3.5 text-sky-400" /> Recent Commits
                            </span>
                            <span className="font-bold text-white font-mono">
                              {repo.recent_commit_count} sampled
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" /> Last Push
                            </span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {(repo.pushed_at || repo.updated_at).slice(0, 10)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <a
                          href={`https://github.com/${repo.full_name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <span>Open Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Repository Metrics Matrix Table */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg overflow-x-auto">
                  <h3 className="text-sm font-bold text-white tracking-tight mb-4">
                    Repository Telemetry Matrix
                  </h3>
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
                        {repoComparison.repositories.map((r) => (
                          <th key={r.name} className="py-3 px-4 font-semibold">
                            {r.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {repoComparison.metrics_matrix.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-slate-200">
                            {row.metric}
                          </td>
                          {repoComparison.repositories.map((r) => (
                            <td key={r.name} className="py-3 px-4 font-bold text-white">
                              {typeof row[r.name] === 'number'
                                ? row[r.name].toLocaleString()
                                : row[r.name] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Repository Comparison Visual Chart */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white tracking-tight mb-4">
                    Visual Metric Comparison (Stars, Forks, Open Issues, Commits)
                  </h3>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={repoChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090d16',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="Stars" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Forks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Open Issues" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Recent Commits" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scope & Data Limitations Disclaimer */}
                <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-400">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{repoComparison.disclaimer}</span>
                </div>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};
