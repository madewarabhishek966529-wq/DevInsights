import React, { useEffect, useState } from 'react';
import { HealthScoreBreakdown } from '../types/developer';
import { devApi } from '../services/api';
import { 
  X, ShieldCheck, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, ExternalLink, Activity 
} from 'lucide-react';

interface RepositoryHealthModalProps {
  repoName: string;
  fullName: string;
  onClose: () => void;
}

export const RepositoryHealthModal: React.FC<RepositoryHealthModalProps> = ({
  repoName,
  fullName,
  onClose
}) => {
  const [healthData, setHealthData] = useState<HealthScoreBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const [owner, repo] = fullName.split('/');
        const data = await devApi.getRepoHealth(owner, repo);
        setHealthData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to calculate repository health.');
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, [fullName]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'B':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'C':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Repository Health Diagnostics
              </h2>
              <p className="text-xs text-slate-400">{fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 mt-3">Evaluating repository health indicators...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          ) : healthData ? (
            <>
              {/* Score Hero Banner */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Overall Health Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white">
                      {healthData.overall_score}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl border text-xl font-bold ${getGradeColor(healthData.grade)}`}>
                  Grade {healthData.grade}
                </div>
              </div>

              {/* Subscores Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Diagnostic Breakdown
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Maintenance Freshness</span>
                      <span className="font-bold">{healthData.maintenance_score} / 30</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(healthData.maintenance_score / 30) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Documentation Coverage</span>
                      <span className="font-bold">{healthData.documentation_score} / 25</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(healthData.documentation_score / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Issue & PR Health</span>
                      <span className="font-bold">{healthData.issue_score} / 20</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(healthData.issue_score / 20) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Community Adoption</span>
                      <span className="font-bold">{healthData.community_score} / 15</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(healthData.community_score / 15) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons & Signals */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detected Signals
                </h4>
                <div className="space-y-1.5">
                  {healthData.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {healthData.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Improvements
                  </h4>
                  <div className="space-y-1.5">
                    {healthData.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                {healthData.disclaimer}
              </p>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
