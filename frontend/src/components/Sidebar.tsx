import React from 'react';
import { 
  LayoutDashboard, Calendar, PieChart, FolderGit2, 
  Activity, ShieldCheck, Award, Sparkles, TrendingUp,
  GitCompare, ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  githubUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  githubUrl
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'heatmap', label: 'Activity Calendar', icon: Calendar },
    { id: 'languages', label: 'Languages', icon: PieChart },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'activity', label: 'Commit Activity', icon: Activity },
    { id: 'audit', label: 'Portfolio Audit', icon: ShieldCheck },
    { id: 'insights', label: 'Smart Insights', icon: Sparkles },
    { id: 'timeline', label: 'Growth Timeline', icon: TrendingUp },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] z-30 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2">
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer link to GitHub */}
      {githubUrl && (
        <div className="p-3 border-t border-slate-800/80">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {!isCollapsed && <span>View on GitHub</span>}
          </a>
        </div>
      )}
    </aside>
  );
};
