import React, { useState, useMemo } from 'react';
import { RepositorySummary } from '../types/developer';
import { RepositoryHealthModal } from './RepositoryHealthModal';
import { 
  FolderGit2, Search, Star, GitFork, AlertCircle, 
  Clock, ShieldCheck, ExternalLink, ArrowUpDown, 
  ChevronLeft, ChevronRight, Filter, Archive, GitBranch 
} from 'lucide-react';

interface RepositoryExplorerProps {
  repositories: RepositorySummary[];
}

export const RepositoryExplorer: React.FC<RepositoryExplorerProps> = ({ repositories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [includeForks, setIncludeForks] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'size' | 'name'>('stars');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inspectRepo, setInspectRepo] = useState<RepositorySummary | null>(null);

  const itemsPerPage = 8;

  // Extract unique languages for filter
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repositories]);

  // Filter & Sort Logic
  const filteredRepos = useMemo(() => {
    return repositories
      .filter((r) => {
        const matchesSearch = 
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLang = selectedLanguage === 'all' || (r.language && r.language.toLowerCase() === selectedLanguage.toLowerCase());
        const matchesFork = includeForks ? true : !r.is_fork;
        return matchesSearch && matchesLang && matchesFork;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (sortBy === 'forks') return b.forks_count - a.forks_count;
        if (sortBy === 'size') return b.size_kb - a.size_kb;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [repositories, searchTerm, selectedLanguage, includeForks, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage) || 1;
  const paginatedRepos = filteredRepos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getHealthBadge = (score?: number | null) => {
    if (score === undefined || score === null) return null;
    let badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score < 50) badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    else if (score < 75) badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

    return (
      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${badgeClass}`}>
        Health {score}
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Repository Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Displaying {filteredRepos.length} of {repositories.length} public repositories
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter repositories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors w-40 sm:w-48"
            />
          </div>

          {/* Language Select */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Sort By Select */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none"
            >
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Recent Update</option>
              <option value="size">Size</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Include Forks Toggle */}
          <button
            onClick={() => setIncludeForks(!includeForks)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              includeForks
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Forks</span>
          </button>
        </div>
      </div>

      {/* Repositories Cards Grid */}
      <div className="mt-6">
        {paginatedRepos.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-slate-950/40 border border-slate-800/60">
            <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No repositories match your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search keyword or language filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 group-hover:underline"
                      >
                        {repo.name}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>

                      {repo.is_fork && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 flex items-center gap-1">
                          <GitFork className="w-2.5 h-2.5" /> Fork
                        </span>
                      )}

                      {repo.is_archived && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Archive className="w-2.5 h-2.5" /> Archived
                        </span>
                      )}
                    </div>

                    {getHealthBadge(repo.health_score)}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[32px]">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                {/* Repository Metadata & Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-slate-300 font-medium text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        {repo.language}
                      </span>
                    )}

                    <span className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {repo.stargazers_count}
                    </span>

                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-slate-400" />
                      {repo.forks_count}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectRepo(repo)}
                      className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:text-sky-400 transition-colors flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      <span>Health</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drill-down Health Diagnostics Modal */}
      {inspectRepo && (
        <RepositoryHealthModal
          repoName={inspectRepo.name}
          fullName={inspectRepo.full_name}
          onClose={() => setInspectRepo(null)}
        />
      )}
    </div>
  );
};
