import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { ActivityAnalytics as ActivityType } from '../types/developer';
import { Activity, Clock, CalendarDays, GitCommit, GitPullRequest, AlertCircle, Info } from 'lucide-react';

interface ActivityAnalyticsProps {
  data: ActivityType;
}

export const ActivityAnalytics: React.FC<ActivityAnalyticsProps> = ({ data }) => {
  const [chartMode, setChartMode] = useState<'dow' | 'hourly'>('dow');

  const dowData = Object.entries(data.by_day_of_week).map(([day, count]) => ({
    label: day,
    count
  }));

  const hourlyData = Object.entries(data.by_hour).map(([hour, count]) => ({
    label: `${hour}:00`,
    count
  }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Commit & Event Activity Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Temporal distribution across {data.total_recent_events} recorded public events
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setChartMode('dow')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              chartMode === 'dow'
                ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Day of Week</span>
          </button>
          <button
            onClick={() => setChartMode('hourly')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              chartMode === 'hourly'
                ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hour of Day (UTC)</span>
          </button>
        </div>
      </div>

      {/* Main Charts and Summary Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Distribution Chart */}
        <div className="lg:col-span-7">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartMode === 'dow' ? dowData : hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="label" 
                  stroke="#64748b" 
                  fontSize={11} 
                  interval={chartMode === 'hourly' ? 2 : 0} 
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(val: any) => [val, 'Recorded Events']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={700}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar below chart */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400">Weekend Activity:</span>
              <span className="font-bold text-indigo-400">{data.weekend_percentage}%</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400">Weekday Activity:</span>
              <span className="font-bold text-sky-400">{(100 - data.weekend_percentage).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity Stream */}
        <div className="lg:col-span-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <GitCommit className="w-4 h-4 text-slate-400" />
            Recent Public Commit & Event Stream
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {data.recent_events.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3">No recent public commit events recorded.</p>
            ) : (
              data.recent_events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-indigo-400 truncate max-w-[160px]">
                      {ev.repo_name}
                    </span>
                    <span className="text-slate-400 text-[10px]">{ev.created_at}</span>
                  </div>
                  <p className="text-slate-200 line-clamp-2 font-mono text-[11px]">
                    {ev.message || ev.type}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
};
