import React, { useState, useEffect, useCallback } from 'react';
import type { ResearchConfig, ResearchProject, UserSession } from './types/research.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { ResearchInput } from './components/ResearchInput.tsx';
import { ResearchWorkspace } from './components/ResearchWorkspace.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { UserManagementModal } from './components/UserManagementModal.tsx';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing');
  const [workspaceSubView, setWorkspaceSubView] = useState<'input' | 'progress' | 'results'>('input');
  const [currentProject, setCurrentProject] = useState<ResearchProject | null>(null);
  const [history, setHistory] = useState<ResearchProject[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Authentication State
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('rf_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showUserManagement, setShowUserManagement] = useState<boolean>(false);

  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // PWA install prompt support
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Fetch History
  const fetchHistory = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      const res = await fetch('/api/history', { headers });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn('Could not fetch history from API:', err);
    }
  }, [session?.token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle URL query parameters (e.g. ?sample=1 or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('sample') === '1') {
      handleLoadSample();
    }
  }, []);

  // Poll active research job
  useEffect(() => {
    if (!currentProject || currentProject.status !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/research/${currentProject.id}`);
        if (res.ok) {
          const updated: ResearchProject = await res.json();
          setCurrentProject(updated);

          if (updated.status === 'completed' || updated.status === 'error') {
            clearInterval(interval);
            fetchHistory();
          }
        }
      } catch (err) {
        console.error('Error polling research job status:', err);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [currentProject?.id, currentProject?.status, fetchHistory]);

  // Handle Logout
  const handleLogout = async () => {
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('rf_session');
    setSession(null);
  };

  // Download App Source Archive (.zip) - "Give app file"
  const handleDownloadAppArchive = () => {
    window.location.href = '/api/export-app-archive';
  };

  // Start Research
  const handleStartResearch = async (config: ResearchConfig) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start research');
      }

      const data = await res.json();
      setCurrentProject(data.project);
      setCurrentView('workspace');
      setWorkspaceSubView('progress');
      fetchHistory();
    } catch (err: any) {
      console.error('Failed to initiate research:', err);
      alert(err.message || 'Error initiating research. Please check inputs.');
    } finally {
      setIsStarting(false);
    }
  };

  // Load Benchmark Case Study
  const handleLoadSample = async () => {
    try {
      const res = await fetch('/api/research/sample');
      if (res.ok) {
        const sample: ResearchProject = await res.json();
        setCurrentProject(sample);
        setCurrentView('workspace');
        setWorkspaceSubView('results');
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to load sample project:', err);
    }
  };

  // Open Project from History
  const handleSelectHistoryProject = (id: string) => {
    const target = history.find((h) => h.id === id);
    if (target) {
      setCurrentProject(target);
      setCurrentView('workspace');
      setWorkspaceSubView(target.status === 'completed' ? 'results' : 'progress');
      setShowHistory(false);
    }
  };

  // Delete Project from History
  const handleDeleteHistoryProject = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (session?.token) headers['Authorization'] = `Bearer ${session.token}`;
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setHistory((prev) => prev.filter((p) => p.id !== id));
        if (currentProject?.id === id) {
          setCurrentProject(null);
          setWorkspaceSubView('input');
        }
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        session={session}
        currentView={currentView}
        onNavigateView={(v) => setCurrentView(v)}
        onToggleTheme={toggleTheme}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        onNewResearch={() => {
          setCurrentView('workspace');
          setWorkspaceSubView('input');
        }}
        onLoadSample={handleLoadSample}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onOpenUserManagement={() => setShowUserManagement(true)}
        onDownloadAppArchive={handleDownloadAppArchive}
        historyCount={history.length}
        canInstall={Boolean(installPrompt)}
        onInstall={handleInstallApp}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' ? (
          <LandingPage
            session={session}
            onStartResearch={() => {
              setCurrentView('workspace');
              setWorkspaceSubView('input');
            }}
            onExploreBenchmark={handleLoadSample}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenSettings={() => setShowSettings(true)}
            onDownloadAppArchive={handleDownloadAppArchive}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {workspaceSubView === 'input' && (
              <ResearchInput
                onStartResearch={handleStartResearch}
                isLoading={isStarting}
              />
            )}

            {workspaceSubView === 'progress' && currentProject && (
              <ResearchWorkspace
                project={currentProject}
                onViewResults={() => setWorkspaceSubView('results')}
              />
            )}

            {workspaceSubView === 'results' && currentProject && (
              <ResultsView
                project={currentProject}
                session={session}
                onNewResearch={() => {
                  setCurrentView('workspace');
                  setWorkspaceSubView('input');
                }}
                onOpenExport={() => setShowExport(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(newSession) => {
            setSession(newSession);
            setShowLoginModal(false);
          }}
        />
      )}

      {/* RBAC Account Management Modal (Owner, Admin, Moderator, Manager) */}
      {showUserManagement && session && (
        <UserManagementModal
          session={session}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          history={history}
          currentProjectId={currentProject?.id}
          onSelectProject={handleSelectHistoryProject}
          onDeleteProject={handleDeleteHistoryProject}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Export Modal */}
      {showExport && currentProject && (
        <ExportModal
          project={currentProject}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Settings Modal (API Keys, Multi-Model Router, Source Code Archive) */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onDownloadAppArchive={handleDownloadAppArchive}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-4 text-center text-xs text-slate-400 mt-auto bg-slate-950/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ResearchForge AI</span>
            <span>&bull;</span>
            <span>Autonomous Multi-Source Research Intelligence & Verification</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Zero Hallucination Policy</span>
            <span>&bull;</span>
            <span>Prompt Injection Hardened</span>
            <span>&bull;</span>
            <button
              onClick={handleDownloadAppArchive}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
            >
              Download App Package (.zip)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
