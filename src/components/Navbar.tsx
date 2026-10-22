import React from 'react';
import {
  Sparkles,
  History,
  Settings,
  Sun,
  Moon,
  BookOpen,
  Laptop,
  Users,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Download,
  Home,
  FileCode,
} from 'lucide-react';
import type { UserSession } from '../types/research.ts';

interface NavbarProps {
  theme: 'dark' | 'light';
  session: UserSession | null;
  currentView: 'landing' | 'workspace';
  onNavigateView: (view: 'landing' | 'workspace') => void;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onNewResearch: () => void;
  onLoadSample: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenUserManagement: () => void;
  onDownloadAppArchive: () => void;
  historyCount: number;
  canInstall: boolean;
  onInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  session,
  currentView,
  onNavigateView,
  onToggleTheme,
  onOpenHistory,
  onOpenSettings,
  onNewResearch,
  onLoadSample,
  onOpenLogin,
  onLogout,
  onOpenUserManagement,
  onDownloadAppArchive,
  historyCount,
  canInstall,
  onInstall,
}) => {
  const isPrivileged = session?.role === 'Owner' || session?.role === 'Admin' || session?.role === 'Moderator' || session?.role === 'Manager';

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 border-slate-800/80 bg-slate-950/85 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ResearchForge<span className="text-indigo-400 font-mono text-sm ml-1 px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/60">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Autonomous Deep Intelligence & WWW Truth Verification
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* View switcher */}
          {currentView === 'landing' ? (
            <button
              onClick={() => onNavigateView('workspace')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateView('landing')}
              title="Return to Landing Page"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Landing</span>
            </button>
          )}

          {currentView === 'workspace' && (
            <button
              onClick={onNewResearch}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Search</span>
            </button>
          )}

          <button
            onClick={onLoadSample}
            title="Load benchmark case study: Cybersecurity Problems in Everyday Life"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Benchmark</span>
          </button>

          {/* Download App Bundle button ("Give app file") */}
          <button
            onClick={onDownloadAppArchive}
            title="Download complete application codebase package (.zip)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">App Files (.zip)</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {historyCount}
              </span>
            )}
          </button>

          {/* Privileged Account Management Access */}
          {isPrivileged && (
            <button
              onClick={onOpenUserManagement}
              title="Manage Team Roles, Permissions & Login Audits"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 shadow-sm transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">RBAC & Users</span>
            </button>
          )}

          {canInstall && (
            <button
              onClick={onInstall}
              title="Install progressive web app"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* User Session Badge & Logout/Login */}
          {session ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                title={`Logged in as ${session.name} (${session.role})`}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono"
              >
                {session.role === 'Owner' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
                <span className="truncate max-w-[100px] font-semibold text-white">
                  {session.username}
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    session.role === 'Owner'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : session.role === 'Admin'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {session.role.toUpperCase()}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Log out of account"
                className="p-2 rounded-lg border border-slate-800 hover:border-rose-900/60 bg-slate-900/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Configure Multi-Model API Keys, Routing & Settings"
            className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
