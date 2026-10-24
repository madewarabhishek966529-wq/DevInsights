import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devApi, ApiError } from '../services/api';
import { 
  DeveloperOverview, RepositorySummary, LanguageAnalytics,
  ContributionData, ActivityAnalytics as ActivityType, 
  PortfolioAuditResult, SmartInsight, SnapshotResponse 
} from '../types/developer';

import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MetricCard } from '../components/MetricCard';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { LanguageCharts } from '../components/LanguageCharts';
import { ActivityAnalytics } from '../components/ActivityAnalytics';
import { RepositoryExplorer } from '../components/RepositoryExplorer';
import { PortfolioAuditView } from '../components/PortfolioAuditView';
import { SmartInsightsPanel } from '../components/SmartInsightsPanel';
import { GrowthTimelineView } from '../components/GrowthTimelineView';
import { ExportModal } from '../components/ExportModal';
import { CustomizeWidgetsModal } from '../components/CustomizeWidgetsModal';

import { 
  Star, GitFork, FolderGit2, Users, Code2, 
  ShieldCheck, MapPin, Building, Globe, 
  ExternalLink, RefreshCw, AlertCircle, Sparkles, 
  Calendar, CheckCircle, Info, Bookmark, BookmarkCheck
} from 'lucide-react';

interface DashboardPageProps {
  theme: string;
  onToggleTheme: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ theme, onToggleTheme }) => {
  const { username = 'torvalds' } = useParams<{ username: string }>();
  const cleanUsername = (username ? username.trim().replace(/^@/, '') : '') || 'torvalds';
  const navigate = useNavigate();

  // Data states
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [languages, setLanguages] = useState<LanguageAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityType | null>(null);
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [audit, setAudit] = useState<PortfolioAuditResult | null>(null);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotResponse[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'year' | '6m' | '30d'>('all');
  const [selectedHeatmapYear, setSelectedHeatmapYear] = useState<number>(new Date().getFullYear());
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [savingBookmark, setSavingBookmark] = useState<boolean>(false);

  // Modal dialog states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);

  // Preference states
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([
    'metrics', 'heatmap', 'languages', 'activity', 'repositories', 'audit', 'insights', 'timeline'
  ]);
  const [layoutMode, setLayoutMode] = useState<string>('comfort');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!cleanUsername) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Fetch overview, repos, languages, activity, heatmap, audit, insights, and snapshots concurrently
      const [
        overviewRes,
        reposRes,
        langRes,
        actRes,
        contribRes,
        auditRes,
        insightsRes,
        snapshotsRes,
        prefRes
      ] = await Promise.allSettled([
        devApi.getOverview(cleanUsername),
        devApi.getRepositories(cleanUsername),
        devApi.getLanguages(cleanUsername),
        devApi.getActivity(cleanUsername),
        devApi.getContributions(cleanUsername, selectedHeatmapYear),
        devApi.getPortfolioAudit(cleanUsername),
        devApi.getInsights(cleanUsername),
        devApi.getSnapshots(cleanUsername),
        devApi.getPreferences()
      ]);

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value);
      } else {
        const reason: any = overviewRes.reason;
        throw new Error(reason?.message || `Developer '${cleanUsername}' could not be found.`);
      }

      if (reposRes.status === 'fulfilled') setRepositories(reposRes.value);
      if (langRes.status === 'fulfilled') setLanguages(langRes.value);
      if (actRes.status === 'fulfilled') setActivity(actRes.value);
      if (contribRes.status === 'fulfilled') setContributions(contribRes.value);
      if (auditRes.status === 'fulfilled') setAudit(auditRes.value);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
      if (snapshotsRes.status === 'fulfilled') setSnapshots(snapshotsRes.value);
      if (prefRes.status === 'fulfilled') {
        setVisibleWidgets(prefRes.value.visible_widgets);
        setLayoutMode(prefRes.value.layout_mode);
      }

      // Check bookmark status
      try {
        const bookmarks = await devApi.getBookmarks('user');
        setIsBookmarked(bookmarks.some(b => b.identifier.toLowerCase() === cleanUsername.toLowerCase()));
      } catch {
        // ignore
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while loading developer activity data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cleanUsername, selectedHeatmapYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedHeatmapYear(year);
  };

  const handleSnapshotCreated = (newSnap: SnapshotResponse) => {
    setSnapshots([newSnap, ...snapshots]);
  };

  const handleUpdatePreferences = (widgets: string[], mode: string) => {
    setVisibleWidgets(widgets);
    setLayoutMode(mode);
  };

  const toggleProfileBookmark = async () => {
    if (!overview || savingBookmark) return;
    try {
      setSavingBookmark(true);
      if (isBookmarked) {
        await devApi.deleteBookmarkByIdentifier('user', cleanUsername);
        setIsBookmarked(false);
      } else {
        await devApi.createBookmark({
          item_type: 'user',
          identifier: cleanUsername,
          title: overview.name || overview.username,
          subtitle: overview.bio || undefined,
          avatar_url: overview.avatar_url
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setSavingBookmark(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        currentUsername={cleanUsername}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenSnapshot={() => {
          const el = document.getElementById('timeline');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenExport={() => setShowExportModal(true)}
        onOpenCustomize={() => setShowCustomizeModal(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sticky Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          githubUrl={overview?.html_url}
        />

        {/* Main Content Dashboard Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8">
          {loading ? (
            /* Loading State Skeleton */
            <div className="space-y-6 animate-pulse">
              <div className="h-40 rounded-2xl bg-slate-900 border border-slate-800" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-900 border border-slate-800" />
                ))}
              </div>
              <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800" />
              <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800" />
            </div>
          ) : error ? (
            /* Error State Banner */
            <div className="py-20 text-center max-w-lg mx-auto px-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Unable to Load Developer
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {error === 'Not Found' || error?.includes('404')
                  ? `GitHub profile for '${cleanUsername}' could not be found. Please check for spelling errors or try a sample profile.`
                  : error}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                >
                  Return to Search
                </button>
                <button
                  onClick={() => navigate('/dashboard/torvalds')}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-all"
                >
                  Try @torvalds
                </button>
                <button
                  onClick={() => loadData(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-xs font-semibold text-white hover:bg-sky-400 transition-all shadow-md shadow-sky-500/20"
                >
                  Retry Request
                </button>
              </div>
            </div>
          ) : overview ? (
            <>
              {/* Profile Overview Header Card */}
              <div
                id="overview"
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-md relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Avatar & User Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={overview.avatar_url}
                      alt={overview.username}
                      className="w-20 h-20 rounded-2xl border-2 border-slate-700/80 shadow-md object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                          {overview.name || overview.username}
                        </h1>
                        <span className="text-sm font-mono text-slate-400">
                          @{overview.username}
                        </span>
                        {overview.is_hireable && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available for hire
                          </span>
                        )}
                      </div>

                      {overview.bio && (
                        <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                          {overview.bio}
                        </p>
                      )}

                      {/* Meta Information Tags */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        {overview.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {overview.location}
                          </span>
                        )}
                        {overview.company && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-500" />
                            {overview.company}
                          </span>
                        )}
                        {overview.blog && (
                          <a
                            href={overview.blog.startsWith('http') ? overview.blog : `https://${overview.blog}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sky-400 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            {overview.blog.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {overview.twitter_username && (
                          <a
                            href={`https://twitter.com/${overview.twitter_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sky-400 hover:underline"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            @{overview.twitter_username}
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Calendar className="w-3 h-3" /> Joined {new Date(overview.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Controls */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 self-stretch md:self-auto justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleProfileBookmark}
                        disabled={savingBookmark}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
                          isBookmarked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                        }`}
                        title="Save developer to Bookmarks"
                      >
                        {isBookmarked ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                      </button>

                      <a
                        href={overview.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="View profile on GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Date-Range Filter Selector */}
                    <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      {(['all', 'year', '6m', '30d'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setDateFilter(period)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                            dateFilter === period
                              ? 'bg-sky-500 text-white font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {period === 'all' ? 'All Time' : period === 'year' ? '1 Year' : period === '6m' ? '6 Mos' : '30 Days'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Honest Public Data Disclaimer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>{overview.data_disclaimer}</span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              {visibleWidgets.includes('metrics') && (
                <div className={`grid gap-4 ${layoutMode === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  <MetricCard
                    title="Total Stars Earned"
                    value={overview.total_stars}
                    subtitle="Across all public repositories"
                    icon={Star}
                    accentColor="amber"
                    badge="Community Validation"
                    badgeType="highlight"
                  />
                  <MetricCard
                    title="Total Forks Received"
                    value={overview.total_forks}
                    subtitle="External collaboration & reuse"
                    icon={GitFork}
                    accentColor="sky"
                    badge="Code Reuse"
                  />
                  <MetricCard
                    title="Public Repositories"
                    value={overview.public_repos}
                    subtitle="Authored & open projects"
                    icon={FolderGit2}
                    accentColor="emerald"
                  />
                  <MetricCard
                    title="GitHub Followers"
                    value={overview.followers}
                    subtitle={`${overview.following} following`}
                    icon={Users}
                    accentColor="indigo"
                  />
                  <MetricCard
                    title="Primary Language"
                    value={overview.primary_language || 'Various'}
                    subtitle="Top code composition"
                    icon={Code2}
                    accentColor="sky"
                  />
                  <MetricCard
                    title="Portfolio Audit"
                    value={audit ? `${audit.overall_score}/100` : 'Evaluating'}
                    subtitle={audit ? `Grade ${audit.grade}` : 'Calculating signals'}
                    icon={ShieldCheck}
                    accentColor="violet"
                    badge={audit ? `Grade ${audit.grade}` : undefined}
                    badgeType="positive"
                  />
                </div>
              )}

              {/* Activity Heatmap Calendar */}
              {visibleWidgets.includes('heatmap') && contributions && (
                <div id="heatmap">
                  <ContributionHeatmap
                    data={contributions}
                    selectedYear={selectedHeatmapYear}
                    onYearChange={handleYearChange}
                  />
                </div>
              )}

              {/* Programming Languages Breakdown */}
              {visibleWidgets.includes('languages') && languages && (
                <div id="languages">
                  <LanguageCharts data={languages} />
                </div>
              )}

              {/* Commit & Activity Distribution */}
              {visibleWidgets.includes('activity') && activity && (
                <div id="activity">
                  <ActivityAnalytics data={activity} />
                </div>
              )}

              {/* Repository Explorer & Health */}
              {visibleWidgets.includes('repositories') && (
                <div id="repositories">
                  <RepositoryExplorer repositories={repositories} />
                </div>
              )}

              {/* Portfolio Recruiter Audit */}
              {visibleWidgets.includes('audit') && audit && (
                <div id="audit">
                  <PortfolioAuditView audit={audit} />
                </div>
              )}

              {/* Deterministic Smart Insights */}
              {visibleWidgets.includes('insights') && (
                <div id="insights">
                  <SmartInsightsPanel insights={insights} />
                </div>
              )}

              {/* Growth Timeline & Snapshots */}
              {visibleWidgets.includes('timeline') && (
                <div id="timeline">
                  <GrowthTimelineView
                    username={username}
                    snapshots={snapshots}
                    onSnapshotCreated={handleSnapshotCreated}
                  />
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportModal
          username={username}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Customize Widgets Modal */}
      {showCustomizeModal && (
        <CustomizeWidgetsModal
          visibleWidgets={visibleWidgets}
          layoutMode={layoutMode}
          onUpdatePreferences={handleUpdatePreferences}
          onClose={() => setShowCustomizeModal(false)}
        />
      )}
    </div>
  );
};
