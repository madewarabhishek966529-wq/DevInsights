import React, { useState } from 'react';
import { SnapshotResponse } from '../types/developer';
import { devApi } from '../services/api';
import { 
  TrendingUp, Camera, Calendar, Star, GitFork, 
  Users, FolderGit2, ShieldCheck, CheckCircle2, Plus 
} from 'lucide-react';

interface GrowthTimelineViewProps {
  username: string;
  snapshots: SnapshotResponse[];
  onSnapshotCreated: (newSnapshot: SnapshotResponse) => void;
}

export const GrowthTimelineView: React.FC<GrowthTimelineViewProps> = ({
  username,
  snapshots,
  onSnapshotCreated
}) => {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [snapshotNote, setSnapshotNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      const newSnap = await devApi.createSnapshot(username, snapshotNote || undefined);
      onSnapshotCreated(newSnap);
      setSnapshotNote('');
      setShowNoteInput(false);
      setSuccessMsg('Snapshot captured and saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Developer Growth Timeline & Milestones
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical metric snapshots captured across time for tracking portfolio progression
          </p>
        </div>

        {/* Capture Snapshot Button */}
        <div className="flex items-center gap-2">
          {showNoteInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional milestone note..."
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-50"
              >
                {isCapturing ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNoteInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Snapshot</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Snapshots Timeline List */}
      <div className="mt-6">
        {snapshots.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-slate-950/40 border border-slate-800/60">
            <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No snapshots recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click &quot;Capture Snapshot&quot; above to record your current metrics. As you return over weeks or months, you can visualize your progression.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {snapshots.map((snap, idx) => {
              const prev = idx < snapshots.length - 1 ? snapshots[idx + 1] : null;
              const starDelta = prev ? snap.total_stars - prev.total_stars : null;
              const repoDelta = prev ? snap.public_repos - prev.public_repos : null;

              return (
                <div key={snap.id} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-slate-950 ring-4 ring-slate-900 group-hover:scale-125 transition-transform" />

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-white">{snap.captured_at}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            Latest
                          </span>
                        )}
                      </div>
                      {snap.note && (
                        <span className="text-xs text-slate-300 italic font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          &quot;{snap.note}&quot;
                        </span>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" /> Stars
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="font-bold text-white">{snap.total_stars}</span>
                          {starDelta !== null && starDelta !== 0 && (
                            <span className={`text-[10px] font-bold ${starDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {starDelta > 0 ? `+${starDelta}` : starDelta}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3 text-sky-400" /> Repos
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="font-bold text-white">{snap.public_repos}</span>
                          {repoDelta !== null && repoDelta !== 0 && (
                            <span className={`text-[10px] font-bold ${repoDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {repoDelta > 0 ? `+${repoDelta}` : repoDelta}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-400" /> Followers
                        </span>
                        <span className="font-bold text-white block mt-0.5">{snap.followers}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Audit Score
                        </span>
                        <span className="font-bold text-white block mt-0.5">{snap.audit_score}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
