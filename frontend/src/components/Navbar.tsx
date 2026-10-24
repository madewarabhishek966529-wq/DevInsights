import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Search, Sun, Moon, GitCompare, Camera, 
  Download, Settings2, Bookmark, Trash2, ExternalLink,
  Users, FolderGit2, X
} from 'lucide-react';
import { devApi } from '../services/api';
import { BookmarkItem } from '../types/developer';

interface NavbarProps {
  currentUsername?: string;
  theme: string;
  onToggleTheme: () => void;
  onOpenSnapshot?: () => void;
  onOpenExport?: () => void;
  onOpenCustomize?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUsername,
  theme,
  onToggleTheme,
  onOpenSnapshot,
  onOpenExport,
  onOpenCustomize
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().replace(/^@/, '');
    if (clean) {
      navigate(`/dashboard/${encodeURIComponent(clean)}`);
      setSearchInput('');
    }
  };

  const loadBookmarks = async () => {
    try {
      setLoadingBookmarks(true);
      const items = await devApi.getBookmarks();
      setBookmarks(items);
    } catch {
      // ignore
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleToggleBookmarks = () => {
    if (!showBookmarks) {
      loadBookmarks();
    }
    setShowBookmarks(!showBookmarks);
  };

  const handleRemoveBookmark = async (e: React.MouseEvent, bm: BookmarkItem) => {
    e.stopPropagation();
    try {
      if (bm.id) {
        await devApi.deleteBookmark(bm.id);
      } else {
        await devApi.deleteBookmarkByIdentifier(bm.item_type, bm.identifier);
      }
      setBookmarks(prev => prev.filter(b => b.id !== bm.id && b.identifier !== bm.identifier));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setShowBookmarks(false);
      }
    };
    if (showBookmarks) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBookmarks]);

  const userBookmarks = bookmarks.filter(b => b.item_type === 'user');
  const repoBookmarks = bookmarks.filter(b => b.item_type === 'repo');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
              DevInsights
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 hidden sm:inline tracking-wider uppercase font-medium">
              Developer Analytics
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search GitHub username (e.g. torvalds, gaearon)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-12 py-1.5 text-sm rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              ↵
            </kbd>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentUsername && (
            <>
              {/* Snapshot Button */}
              {onOpenSnapshot && (
                <button
                  onClick={onOpenSnapshot}
                  title="Capture snapshot for Growth Timeline"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Snapshot</span>
                </button>
              )}

              {/* Export Button */}
              {onOpenExport && (
                <button
                  onClick={onOpenExport}
                  title="Export CSV/JSON & PDF Report"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}

              {/* Customize Widgets Button */}
              {onOpenCustomize && (
                <button
                  onClick={onOpenCustomize}
                  title="Customize dashboard layout and widgets"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Bookmarks Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleToggleBookmarks}
              title="Saved Profiles & Repositories"
              className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                showBookmarks
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {showBookmarks && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 p-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Bookmarks</span>
                  </div>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2 space-y-3">
                  {loadingBookmarks ? (
                    <div className="py-6 text-center text-slate-400">Loading saved items...</div>
                  ) : bookmarks.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 italic">
                      No bookmarks saved yet. Use the Bookmark buttons on profiles or repositories for instant access.
                    </div>
                  ) : (
                    <>
                      {userBookmarks.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-400" /> Developers ({userBookmarks.length})
                          </span>
                          <div className="space-y-1">
                            {userBookmarks.map((b) => (
                              <div
                                key={b.identifier}
                                onClick={() => {
                                  navigate(`/dashboard/${b.identifier}`);
                                  setShowBookmarks(false);
                                }}
                                className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {b.avatar_url ? (
                                    <img src={b.avatar_url} alt={b.identifier} className="w-6 h-6 rounded-full flex-shrink-0" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                      {b.identifier[0].toUpperCase()}
                                    </div>
                                  )}
                                  <div className="overflow-hidden">
                                    <p className="text-white font-medium truncate">@{b.identifier}</p>
                                    {b.title && <p className="text-[10px] text-slate-400 truncate">{b.title}</p>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveBookmark(e, b)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                                  title="Remove bookmark"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {repoBookmarks.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                            <FolderGit2 className="w-3 h-3 text-emerald-400" /> Repositories ({repoBookmarks.length})
                          </span>
                          <div className="space-y-1">
                            {repoBookmarks.map((b) => (
                              <div
                                key={b.identifier}
                                className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between transition-colors"
                              >
                                <a
                                  href={`https://github.com/${b.identifier}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 overflow-hidden text-slate-200 hover:text-sky-400"
                                >
                                  <span className="font-mono text-xs truncate">{b.identifier}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-500" />
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveBookmark(e, b)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded ml-2"
                                  title="Remove bookmark"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compare Page Link */}
          <Link
            to="/compare"
            title="Compare Developers & Repositories side-by-side"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Compare</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
