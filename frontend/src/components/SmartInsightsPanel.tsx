import React, { useState } from 'react';
import { SmartInsight } from '../types/developer';
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, ChevronDown, ChevronUp, ShieldCheck, Calculator, Clock, AlertCircle } from 'lucide-react';

interface SmartInsightsPanelProps {
  insights: SmartInsight[];
}

export const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ insights }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getSeverityBadge = (severity: 'positive' | 'info' | 'warning') => {
    switch (severity) {
      case 'positive':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          cardStyle: 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40',
          badgeText: 'Positive Trend',
          badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          cardStyle: 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
          badgeText: 'Actionable Warning',
          badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'info':
      default:
        return {
          icon: <Lightbulb className="w-4 h-4 text-sky-400" />,
          cardStyle: 'bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40',
          badgeText: 'Pattern Observation',
          badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Deterministic Insights Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, algorithmic observations with complete mathematical audit trails and data limitations
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zero Fabricated Claims</span>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
            Insufficient activity data to extract meaningful analytical patterns.
          </div>
        ) : (
          insights.map((insight) => {
            const config = getSeverityBadge(insight.severity);
            const isExpanded = expandedId === insight.id;

            return (
              <div
                key={insight.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${config.cardStyle}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${config.badgeStyle}`}>
                      {config.icon}
                      {config.badgeText}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(insight.id)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Audit' : 'Audit Trail'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Audit Trail Breakdown (5 mandatory audit fields) */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5 bg-slate-950/60 p-3 rounded-lg text-xs">
                    {insight.observation && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">Observation</span>
                        <p className="text-slate-200">{insight.observation}</p>
                      </div>
                    )}

                    {insight.supporting_metrics && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">Supporting Metrics</span>
                        <p className="text-indigo-300 font-mono text-[11px]">{insight.supporting_metrics}</p>
                      </div>
                    )}

                    {insight.calculation_method && (
                      <div>
                        <span className="text-slate-400 font-semibold flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5">
                          <Calculator className="w-3 h-3 text-emerald-400" />
                          Calculation Method
                        </span>
                        <p className="text-slate-300 font-mono text-[11px] bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                          {insight.calculation_method}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {insight.period_analyzed && (
                        <div>
                          <span className="text-slate-400 font-semibold flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5">
                            <Clock className="w-3 h-3 text-sky-400" />
                            Period Analyzed
                          </span>
                          <p className="text-slate-300 text-[11px]">{insight.period_analyzed}</p>
                        </div>
                      )}

                      {insight.data_limitations && (
                        <div>
                          <span className="text-amber-400/90 font-semibold flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            Data Limitations
                          </span>
                          <p className="text-slate-400 text-[11px] leading-tight">{insight.data_limitations}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Source Citation */}
                <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source Signal:</span>
                  <span className="font-mono text-slate-400 truncate max-w-[200px]">
                    {insight.metric_source}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
