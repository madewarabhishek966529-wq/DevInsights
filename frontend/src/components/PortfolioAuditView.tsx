import React, { useState } from 'react';
import { PortfolioAuditResult } from '../types/developer';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, 
  ListChecks, Info, Sparkles, Filter 
} from 'lucide-react';

interface PortfolioAuditViewProps {
  audit: PortfolioAuditResult;
}

export const PortfolioAuditView: React.FC<PortfolioAuditViewProps> = ({ audit }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = ['all', 'Profile', 'Documentation', 'Repository Quality', 'Licensing'];

  const filteredFindings = audit.findings.filter((f) => {
    const matchCat = filterCategory === 'all' || f.category === filterCategory;
    const matchStat = filterStatus === 'all' || f.status === filterStatus;
    return matchCat && matchStat;
  });

  const getGradeBadge = (grade: string) => {
    let style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (['C', 'D', 'F'].includes(grade)) {
      style = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else if (grade === 'B') {
      style = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
    return (
      <span className={`px-3 py-1 rounded-xl text-lg font-extrabold border ${style}`}>
        Grade {grade}
      </span>
    );
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              GitHub Profile & Portfolio Audit
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recruiter readability, documentation consistency, and portfolio presentation analysis
          </p>
        </div>

        {getGradeBadge(audit.grade)}
      </div>

      {/* Hero Scorecard & Subscores */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Score */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{audit.overall_score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${audit.overall_score}%` }} />
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Profile Bio & Links
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-sky-400">{audit.completeness_score}</span>
            <span className="text-xs text-slate-500">/ 30 pts</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(audit.completeness_score / 30) * 100}%` }} />
          </div>
        </div>

        {/* Repository Hygiene */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Repo Description & Tags
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-indigo-400">{audit.repository_hygiene_score}</span>
            <span className="text-xs text-slate-500">/ 40 pts</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(audit.repository_hygiene_score / 40) * 100}%` }} />
          </div>
        </div>

        {/* Licensing */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Licensing Coverage
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-400">{audit.licensing_score}</span>
            <span className="text-xs text-slate-500">/ 30 pts</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(audit.licensing_score / 30) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Findings & Action Items */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Categorized Findings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Audit Findings ({filteredFindings.length})
            </h3>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {getStatusIcon(finding.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{finding.title}</span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {finding.category}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{finding.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prioritized Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            Recruiter Optimization Checklist
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {audit.action_items.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                No outstanding recommendations! Your profile meets all high-priority presentation standards.
              </div>
            ) : (
              audit.action_items.map((item, idx) => {
                const isHigh = item.priority === 'High';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs flex items-start gap-2.5"
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
                        isHigh
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <p className="text-slate-200 leading-snug">{item.task}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <span>{audit.disclaimer}</span>
      </div>
    </div>
  );
};
