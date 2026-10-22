import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { devApi } from '../services/api';
import { DeveloperComparison, DeveloperOverview } from '../types/developer';
import { Navbar } from '../components/Navbar';
import { 
  GitCompare, Search, Plus, X, Star, GitFork, 
  Users, FolderGit2, Code2, AlertCircle, Info, 
  ExternalLink, BarChart3 
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
  const [usernames, setUsernames] = useState<string[]>(['torvalds', 'gaearon']);
  const [newUsername, setNewUsername] = useState<string>('');
  const [comparison, setComparison] = useState<DeveloperComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async (users: string[]) => {
    if (users.length < 2) return;
    try {
      setLoading(true);
      setError(null);
      const data = await devApi.compareDevelopers(users);
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare developers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(usernames);
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim().toLowerCase();
    if (trimmed && !usernames.includes(trimmed)) {
      if (usernames.length >= 4) {
        alert('You can compare a maximum of 4 developers at once.');
        return;
      }
      const updated = [...usernames, trimmed];
      setUsernames(updated);
      setNewUsername('');
      fetchComparison(updated);
    }
  };

  const handleRemoveUser = (userToRemove: string) => {
    if (usernames.length <= 2) {
      alert('At least 2 developers are required for side-by-side comparison.');
      return;
    }
    const updated = usernames.filter((u) => u !== userToRemove);
    setUsernames(updated);
    fetchComparison(updated);
  };

  // Prepare chart data comparing stars and repos
  const chartData = comparison?.developers.map((dev) => ({
    name: dev.username,
    Stars: dev.total_stars,
    Repositories: dev.public_repos,
    Followers: dev.followers
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
                Developer Comparison Suite
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Side-by-side benchmarking of public repositories, stars, and language distribution
            </p>
          </div>

          {/* Add Developer Search Form */}
          <form onSubmit={handleAddUser} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Add username..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>
            <button
              type="submit"
              disabled={usernames.length >= 4}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* User Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Currently comparing:</span>
          {usernames.map((u) => (
            <span
              key={u}
              className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-900 border border-slate-800 text-indigo-300 flex items-center gap-2 shadow-sm"
            >
              @{u}
              {usernames.length > 2 && (
                <button
                  onClick={() => handleRemoveUser(u)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Fetching comparative developer data...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : comparison ? (
          <>
            {/* Developer Profiles Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparison.developers.map((dev) => (
                <div
                  key={dev.username}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src={dev.avatar_url}
                        alt={dev.username}
                        className="w-12 h-12 rounded-xl border border-slate-700 object-cover"
                      />
                      <div className="truncate">
                        <h3 className="font-bold text-white text-sm truncate">
                          {dev.name || dev.username}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 truncate">@{dev.username}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 min-h-[32px]">
                      {dev.bio || 'No public bio listed.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Primary Language:</span>
                    <span className="font-semibold text-sky-400">{dev.primary_language || 'N/A'}</span>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/dashboard/${dev.username}`}
                      className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-center block text-slate-300 hover:text-white transition-colors"
                    >
                      View Deep Analytics
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Metrics Matrix Table */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md overflow-x-auto">
              <h3 className="text-sm font-bold text-white tracking-tight mb-4">
                Comparative Metrics Matrix
              </h3>

              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
                    {comparison.developers.map((d) => (
                      <th key={d.username} className="py-3 px-4 font-semibold">
                        @{d.username}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {comparison.metrics_matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-slate-200">
                        {row.metric}
                      </td>
                      {comparison.developers.map((d) => (
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
                Visual Ratio Comparison (Stars vs Repositories)
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
                {comparison.shared_languages.length === 0 ? (
                  <span className="text-slate-500 italic">No common languages across default branches</span>
                ) : (
                  comparison.shared_languages.map((lang) => (
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
              <span>{comparison.disclaimer}</span>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};
