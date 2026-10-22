import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck2,
  TrendingUp,
  Download,
  Terminal,
  Search,
  Globe2,
  Activity,
  Play,
  KeyRound,
  FileDown,
} from 'lucide-react';
import type { UserSession } from '../types/research.ts';

interface LandingPageProps {
  session: UserSession | null;
  onStartResearch: () => void;
  onExploreBenchmark: () => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onDownloadAppArchive: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  session,
  onStartResearch,
  onExploreBenchmark,
  onOpenLogin,
  onOpenSettings,
  onDownloadAppArchive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance dynamic cyber matrix / terminal particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const columns = Math.floor(width / 24);
    const drops: number[] = Array(columns).fill(1);
    const chars = '010101XYZΩΔΨΣ01RESEARCH_VERIFY_CROSS_INDEX_AI_NEXUS';

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#06b6d4';
      ctx.font = '11px "JetBrains Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillStyle = i % 3 === 0 ? 'rgba(99, 102, 241, 0.65)' : 'rgba(6, 182, 212, 0.45)';
        ctx.fillText(text, i * 24, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Background Cybernetic / Tech Canvas Stream */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Subtle radial glow layers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Top announcement bar */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md text-xs text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">v2.4 Autonomous Engine Active</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">WWW Deep Cross-Corroboration</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-400 font-mono">Gemini + GPT-4o + Claude</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            From Complex Problems to <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Verified Scientific Truth
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The autonomous research intelligence platform designed for researchers, analysts, and decision-makers.
            Scrapes the entire World Wide Web, eliminates misinformation through independent multi-source corroboration,
            and delivers exhaustive problem-solving strategies, trend analytics, and publication-ready DOCX & PDF exports.
          </p>

          {/* User Status / Welcome */}
          {session ? (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-xs text-slate-300 backdrop-blur-md">
              <span className="font-mono text-indigo-400">AUTHENTICATED ROLE:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                {session.role}
              </span>
              <span>Welcome back, <strong className="text-white">{session.name}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 backdrop-blur-md">
              <span>Not logged in. You can research as Guest, or sign in as Owner / Admin for unrestricted permissions.</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartResearch}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/35 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Start Researching</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onExploreBenchmark}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-base backdrop-blur-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Explore Benchmark Case</span>
            </button>

            <button
              onClick={onDownloadAppArchive}
              title="Download entire application codebase and files as .ZIP"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 font-semibold text-base backdrop-blur-md transition-all cursor-pointer"
            >
              <FileDown className="w-5 h-5 text-indigo-400" />
              <span>Download App Files (.zip)</span>
            </button>
          </div>
        </div>

        {/* Live Network & Analytics Ticker */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">1.84M+</span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-cyan-500" />
              WWW Sources Indexed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">99.4%</span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Cross-Check Accuracy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">3 Models</span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Smart Multi-Model Router
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">&lt; 15ms</span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              Pipeline Telemetry
            </span>
          </div>
        </div>

        {/* Feature Architectural Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: WWW Corroboration */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 backdrop-blur-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Full-Web Cross Corroboration</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Searches across verified articles, blogs, research whitepapers, and official portals. If an empirical claim cannot be independently confirmed across multiple diverse sources, it is marked as uncorroborated.
            </p>
          </div>

          {/* Card 2: Trend Analytics & Graphs */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 backdrop-blur-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Analytics & Trend Graphs</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Interactive high-precision charts: 12-month citation velocity, cross-source reliability matrices, problem severity vs. feasibility quad-charts, and truth certainty consensus breakdowns.
            </p>
          </div>

          {/* Card 3: Multi-Model AI Router */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 backdrop-blur-md transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Autonomous Multi-Model Routing</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Connect your Gemini, ChatGPT, Claude, and Perplexity keys. The engine autonomously assigns tasks to the ideal model architecture based on reasoning complexity and source density.
            </p>
          </div>
        </div>

        {/* Bottom CTA / Super User & Owner Access */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Role-Based Access Control (RBAC)</h4>
              <p className="text-xs text-slate-400">
                Owner, Admin, Moderator, and Manager roles with live login audit tracking, Google OAuth, and custom permission delegations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!session ? (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={onStartResearch}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Go to Workspace
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              Configure API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
