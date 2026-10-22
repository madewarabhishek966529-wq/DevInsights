import React from 'react';
import { SmartInsight } from '../types/developer';
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle2, Lightbulb } from 'lucide-react';

interface SmartInsightsPanelProps {
  insights: SmartInsight[];
}

export const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ insights }) => {
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
              Deterministic Smart Insights
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated pattern detection derived directly from code repositories and activity metrics
            </p>
          </div>
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
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

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
