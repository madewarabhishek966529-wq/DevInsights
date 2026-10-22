import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'positive' | 'neutral' | 'highlight';
  accentColor?: 'sky' | 'indigo' | 'emerald' | 'amber' | 'violet';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  accentColor = 'sky'
}) => {
  const colorMap = {
    sky: 'from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/20',
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20'
  };

  const badgeStyles = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    highlight: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all"
    >
      {/* Background Accent Subtle Glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorMap[accentColor]} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner ${colorMap[accentColor].split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 relative z-10 flex items-center">
          <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        </div>
      )}
    </motion.div>
  );
};
