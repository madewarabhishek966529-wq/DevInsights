import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, Search, ArrowRight, ShieldCheck, Flame, 
  Code2, Sparkles, TrendingUp, GitCompare
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const sampleUsers = [
    { username: 'torvalds', label: 'Linus Torvalds', desc: 'Linux & Git Creator' },
    { username: 'shadcn', label: 'shadcn', desc: 'Creator of shadcn/ui' },
    { username: 'gaearon', label: 'Dan Abramov', desc: 'React & Redux Contributor' },
    { username: 'sindresorhus', label: 'Sindre Sorhus', desc: 'Prolific OSS Author' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/dashboard/${encodeURIComponent(username.trim())}`);
    }
  };

  const handleSelectSample = (user: string) => {
    navigate(`/dashboard/${encodeURIComponent(user)}`);
  };

  const features = [
    {
      icon: Flame,
      title: 'GitHub-Style Activity Heatmap',
      description: 'Explore 365-day commit frequencies, streaks, and seasonal coding rhythms with interactive cell inspection.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: Code2,
      title: 'Programming Language Intelligence',
      description: 'Analyze precise byte-level code composition across repositories without confusing byte size with coding hours.',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'Repository Health Diagnostics',
      description: 'Transparent 0-100 algorithmic score evaluating maintenance freshness, open-source licensing, and documentation.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: Sparkles,
      title: 'Deterministic Smart Insights',
      description: 'Identifies stagnant codebases, flagship project concentrations, and weekend habits without paid AI dependencies.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Growth Milestones & Snapshots',
      description: 'Save milestone snapshots into SQLite to track star acceleration, follower growth, and portfolio hygiene over time.',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
    },
    {
      icon: GitCompare,
      title: 'Developer Comparison Suite',
      description: 'Benchmark public GitHub profiles side-by-side using normalized parameters and shared language detection.',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    }
  ];

  const techStack = [
    { name: 'FastAPI', role: 'Python 3.12 Backend & Async Services' },
    { name: 'React 19 & Vite', role: 'Performant Client Architecture' },
    { name: 'Tailwind CSS', role: 'Sleek Developer Aesthetic' },
    { name: 'Pandas', role: 'Time-Series & Language Aggregation' },
    { name: 'Recharts', role: 'Interactive Visualizations' },
    { name: 'SQLite', role: 'Local Persistence & Snapshot Store' }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/20 via-indigo-500/15 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">DevInsights v1.0</span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-300">Understand Your Code. Visualize Your Growth.</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Developer Activity Analytics &{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Visualization Platform
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Turn public GitHub repositories and commit timelines into actionable developer intelligence. Discover coding trends, audit portfolio completeness, and track engineering growth.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 max-w-xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter GitHub username (e.g. torvalds, gaearon)..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-36 py-4 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 shadow-xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Samples */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Or test sample profile:</span>
              {sampleUsers.map((u) => (
                <button
                  key={u.username}
                  onClick={() => handleSelectSample(u.username)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/50 hover:bg-slate-800 transition-all font-mono text-[11px]"
                >
                  @{u.username}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deep Analytical Capabilities
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Architected with mathematical rigor. Derived purely from official GitHub APIs and event stream models without fabricated numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-800/80 bg-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Production-Ready Stack
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Engineering Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              FastAPI async backend paired with React 19, Pandas analytics, and a local SQLite database for zero-config deployment.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {techStack.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center flex flex-col justify-center"
              >
                <span className="font-bold text-xs text-white block">{t.name}</span>
                <span className="text-[10px] text-slate-400 mt-1">{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 sm:px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white">DevInsights</span>
            <span>—</span>
            <span>Understand Your Code. Visualize Your Growth.</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Public API</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
