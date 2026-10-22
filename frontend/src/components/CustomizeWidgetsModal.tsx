import React, { useState } from 'react';
import { X, Settings2, Eye, EyeOff, LayoutTemplate, Check } from 'lucide-react';
import { devApi } from '../services/api';

interface CustomizeWidgetsModalProps {
  visibleWidgets: string[];
  layoutMode: string;
  onUpdatePreferences: (visibleWidgets: string[], layoutMode: string) => void;
  onClose: () => void;
}

export const CustomizeWidgetsModal: React.FC<CustomizeWidgetsModalProps> = ({
  visibleWidgets: initialVisible,
  layoutMode: initialLayout,
  onUpdatePreferences,
  onClose
}) => {
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(initialVisible);
  const [layoutMode, setLayoutMode] = useState<string>(initialLayout);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const availableWidgets = [
    { id: 'metrics', label: 'Key Overview Metrics Cards' },
    { id: 'heatmap', label: 'GitHub Activity Heatmap Calendar' },
    { id: 'languages', label: 'Programming Language Distribution' },
    { id: 'repositories', label: 'Repository Explorer & Health Badges' },
    { id: 'activity', label: 'Commit Distribution & Recent Events' },
    { id: 'audit', label: 'Recruiter Portfolio Audit' },
    { id: 'insights', label: 'Deterministic Smart Insights' },
    { id: 'timeline', label: 'Growth Timeline & Milestones' }
  ];

  const toggleWidget = (id: string) => {
    if (visibleWidgets.includes(id)) {
      if (visibleWidgets.length <= 1) return; // Keep at least one
      setVisibleWidgets(visibleWidgets.filter((w) => w !== id));
    } else {
      setVisibleWidgets([...visibleWidgets, id]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await devApi.updatePreferences({
        visible_widgets: visibleWidgets,
        layout_mode: layoutMode
      });
      onUpdatePreferences(visibleWidgets, layoutMode);
      onClose();
    } catch (err) {
      console.error(err);
      onUpdatePreferences(visibleWidgets, layoutMode);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Personalize Dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Layout density mode */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Dashboard Density
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLayoutMode('comfort')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  layoutMode === 'comfort'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <p className="text-xs">Comfort</p>
                  <p className="text-[10px] text-slate-500">Spacious with generous padding</p>
                </div>
                {layoutMode === 'comfort' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                onClick={() => setLayoutMode('compact')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  layoutMode === 'compact'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <p className="text-xs">Compact</p>
                  <p className="text-[10px] text-slate-500">High-density overview</p>
                </div>
                {layoutMode === 'compact' && <Check className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </div>

          {/* Toggle Widgets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Active Dashboard Modules
            </label>
            <div className="space-y-2">
              {availableWidgets.map((w) => {
                const isVisible = visibleWidgets.includes(w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isVisible
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-medium">{w.label}</span>
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {isSaving ? 'Saving...' : 'Apply & Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
