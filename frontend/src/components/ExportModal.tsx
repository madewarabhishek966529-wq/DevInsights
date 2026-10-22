import React, { useState } from 'react';
import { devApi } from '../services/api';
import { X, Download, FileText, CheckCircle2, Printer, Share2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  username: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ username, onClose }) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [includeRepos, setIncludeRepos] = useState<boolean>(true);
  const [includeLanguages, setIncludeLanguages] = useState<boolean>(true);
  const [includeActivity, setIncludeActivity] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleExport = async () => {
    if (format === 'pdf') {
      window.print();
      onClose();
      return;
    }

    try {
      setIsExporting(true);
      const blob = await devApi.exportReport({
        username,
        format,
        include_repos: includeRepos,
        include_languages: includeLanguages,
        include_activity: includeActivity
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devinsights_${username}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch {
        // ignore
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Export Developer Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  format === 'csv'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">CSV Spreadsheet</span>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  format === 'json'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">JSON Analytics</span>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  format === 'pdf'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span className="text-xs">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Included Sections Checkboxes */}
          {format !== 'pdf' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Included Data Modules
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRepos}
                    onChange={(e) => setIncludeRepos(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span>Public Repositories Table (Stars, Forks, Health Score)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLanguages}
                    onChange={(e) => setIncludeLanguages(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span>Programming Language Distribution</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeActivity}
                    onChange={(e) => setIncludeActivity(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
                  />
                  <span>Commit & Activity Distribution Summaries</span>
                </label>
              </div>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Share2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="truncate">Share live profile: {window.location.href}</span>
            </div>
            <button
              onClick={handleCopyShare}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">Includes timestamp and GitHub attribution.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : format === 'pdf' ? 'Print / Save PDF' : 'Download Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
