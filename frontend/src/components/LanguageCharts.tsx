import React, { useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { LanguageAnalytics } from '../types/developer';
import { PieChart as PieIcon, Info, Code2, BarChart2 } from 'lucide-react';

interface LanguageChartsProps {
  data: LanguageAnalytics;
}

export const LanguageCharts: React.FC<LanguageChartsProps> = ({ data }) => {
  const [activeView, setActiveView] = useState<'donut' | 'bars'>('donut');
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const chartData = data.languages.map((l) => ({
    name: l.name,
    value: l.bytes,
    percentage: l.percentage,
    repoCount: l.repo_count,
    color: l.color
  }));

  const filteredLanguages = selectedLang
    ? data.languages.filter((l) => l.name === selectedLang)
    : data.languages;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Programming Language Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing {data.total_repos_analyzed} repositories ({formatBytes(data.total_bytes)} of code)
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('donut')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'donut'
                ? 'bg-sky-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Distribution</span>
          </button>
          <button
            onClick={() => setActiveView('bars')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'bars'
                ? 'bg-sky-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Comparison</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Interactive Chart */}
        <div className="lg:col-span-6 h-64 sm:h-72 flex items-center justify-center relative">
          {data.languages.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No programming languages detected.</p>
          ) : activeView === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#0f172a"
                      strokeWidth={2}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => setSelectedLang(selectedLang === entry.name ? null : entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs">
                          <p className="font-bold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                            {d.name}
                          </p>
                          <p className="text-slate-300 mt-1">
                            {d.percentage}% ({formatBytes(d.value)})
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            Used in {d.repoCount} {d.repoCount === 1 ? 'repository' : 'repositories'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tickFormatter={(v) => `${(v / (1024 * 1024)).toFixed(1)}M`} stroke="#64748b" textAnchor="end" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} textAnchor="end" />
                <Tooltip
                  formatter={(val: any) => [formatBytes(Number(val)), 'Byte Volume']}
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.slice(0, 8).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Central Label inside Donut */}
          {activeView === 'donut' && data.languages.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Top Language</span>
              <span className="text-base font-bold text-white mt-0.5">
                {selectedLang || data.languages[0].name}
              </span>
              <span className="text-xs text-sky-400 font-semibold">
                {selectedLang 
                  ? `${data.languages.find(l => l.name === selectedLang)?.percentage}%`
                  : `${data.languages[0].percentage}%`}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Breakdown List */}
        <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {data.languages.map((lang) => {
            const isSelected = selectedLang === lang.name;
            return (
              <div
                key={lang.name}
                onClick={() => setSelectedLang(isSelected ? null : lang.name)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: lang.color }} 
                    />
                    <span className="font-semibold text-white">{lang.name}</span>
                    <span className="text-[11px] text-slate-500">
                      ({lang.repo_count} {lang.repo_count === 1 ? 'repo' : 'repos'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">{formatBytes(lang.bytes)}</span>
                    <span className="font-bold text-slate-200">{lang.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
};
