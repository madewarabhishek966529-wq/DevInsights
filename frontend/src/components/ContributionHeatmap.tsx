import React, { useState } from 'react';
import { ContributionData, HeatmapDay } from '../types/developer';
import { Calendar, Flame, Trophy, Info, Sparkles } from 'lucide-react';

interface ContributionHeatmapProps {
  data: ContributionData;
  onYearChange?: (year: number) => void;
  selectedYear?: number;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  data,
  onYearChange,
  selectedYear
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Group days into weeks (columns)
  // Each week column contains up to 7 days (index 0=Sun, 1=Mon, ..., 6=Sat)
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  // Pad the first week if the first day is not Sunday (day_of_week > 0)
  if (data.days.length > 0) {
    const firstDow = data.days[0].day_of_week;
    for (let i = 0; i < firstDow; i++) {
      currentWeek.push({
        date: '',
        count: -1, // Empty padding cell
        level: -1,
        day_of_week: i
      });
    }
  }

  data.days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Month labels derivation
  const monthLabels: { name: string; index: number }[] = [];
  let lastMonth = '';
  weeks.forEach((w, idx) => {
    const validDay = w.find((d) => d.date);
    if (validDay && validDay.date) {
      const month = new Date(validDay.date).toLocaleDateString('en-US', { month: 'short' });
      if (month !== lastMonth) {
        monthLabels.push({ name: month, index: idx });
        lastMonth = month;
      }
    }
  });

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950 border-emerald-800/80 hover:bg-emerald-900';
      case 2:
        return 'bg-emerald-700 border-emerald-600 hover:bg-emerald-600';
      case 3:
        return 'bg-emerald-500 border-emerald-400 hover:bg-emerald-400 shadow-sm';
      case 4:
        return 'bg-emerald-400 border-emerald-300 hover:bg-emerald-300 shadow-sm shadow-emerald-400/40';
      default:
        return 'bg-slate-800/50 border-slate-800/80 hover:border-slate-600';
    }
  };

  const handleMouseEnter = (day: HeatmapDay, e: React.MouseEvent) => {
    if (day.count < 0) return;
    setHoveredDay(day);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md relative">
      {/* Header and KPI Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Activity Calendar
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {data.measurement_period}
          </p>
        </div>

        {/* Streaks & KPI Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-white">{data.total_contributions.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-bold text-amber-300">{data.current_streak} days</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
            <Trophy className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Longest:</span>
            <span className="font-bold text-sky-300">{data.longest_streak} days</span>
          </div>

          {/* Year selector pills */}
          {onYearChange && (
            <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => onYearChange(yr)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    (selectedYear || currentYear) === yr
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="mt-6 overflow-x-auto pb-3">
        <div className="min-w-[720px] select-none">
          {/* Month Header */}
          <div className="flex ml-8 mb-2 text-[11px] font-medium text-slate-400 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.index * 14}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Heatmap Matrix with Weekday Labels */}
          <div className="flex items-start">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[10px] font-medium text-slate-500 pr-2 h-[84px] leading-3">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (day.count < 0) {
                      return <div key={dIdx} className="w-[11px] h-[11px] opacity-0" />;
                    }
                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[11px] h-[11px] rounded-[2px] border heatmap-cell cursor-pointer transition-all ${getCellColor(
                          day.level
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend & Disclaimer */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span>{data.disclaimer}</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400">Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-800/50 border border-slate-800" title="0 activity" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-950 border border-emerald-800/80" title="1-2 activities" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-700 border border-emerald-600" title="3-5 activities" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500 border border-emerald-400" title="6-9 activities" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400 border border-emerald-300" title="10+ activities" />
          </div>
          <span className="text-[11px] text-slate-400">More</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-center"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <p className="text-xs font-semibold text-white">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
          </p>
          <p className="text-[10px] text-slate-400">
            {new Date(hoveredDay.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};
