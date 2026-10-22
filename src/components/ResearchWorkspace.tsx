import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import type { ResearchProject } from '../types/research.ts';
import { evaluateSourceQuality } from '../lib/sourceQuality.ts';

interface ResearchWorkspaceProps {
  project: ResearchProject;
  onViewResults: () => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({ project, onViewResults }) => {
  const { progress, config, sources, status } = project;
  const isCompleted = status === 'completed';

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Live Multi-Stage Research Execution</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Depth: <strong className="text-white capitalize">{config.depth}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Region: <strong className="text-white">{config.region}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Sources Discovered: <strong className="text-cyan-400">{progress.discoveredSourceCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Problems Isolated: <strong className="text-emerald-400">{progress.identifiedProblemCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <button
                onClick={onViewResults}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Open Full Research Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800 text-xs text-indigo-300">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Synthesizing Real Evidence...</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
            <span>Overall Pipeline Progress</span>
            <span className="text-indigo-400 font-mono">{progress.percentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Research Stages (Col 4) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 h-fit shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Research Pipeline Stages</span>
          </h3>

          <div className="space-y-3">
            {progress.stages.map((stage, idx) => {
              const isCurrent = stage.id === progress.currentStageId && stage.status === 'in_progress';
              const isDone = stage.status === 'completed';

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border transition duration-150 flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-600/70 shadow-sm'
                      : isDone
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      : 'bg-slate-950/20 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold leading-tight flex items-center justify-between">
                      <span className={isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-400'}>
                        {idx + 1}. {stage.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug truncate">
                      {stage.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live Research Activity Stream (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col shadow-lg min-h-[420px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Live Analytical Activity Log</span>
          </h3>

          <div className="flex-1 bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 font-mono text-xs overflow-y-auto max-h-[500px] space-y-2.5">
            {progress.recentLogs.map((log, index) => {
              let tagColor = 'text-slate-400';
              if (log.level === 'success') tagColor = 'text-emerald-400 font-semibold';
              if (log.level === 'evidence') tagColor = 'text-cyan-400 font-semibold';
              if (log.level === 'warn') tagColor = 'text-amber-400 font-semibold';

              return (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[10px] text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`text-[11px] ${tagColor}`}>{log.message}</span>
                </div>
              );
            })}
            {!isCompleted && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 pt-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cross-referencing claims and synthesizing failure models...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sources Being Discovered (Col 3) */}
        <div className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 h-fit shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Sources</span>
            </span>
            <span className="text-xs text-indigo-400 font-mono font-bold">
              {sources.length} indexed
            </span>
          </h3>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {sources.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Querying initial citation graphs...
              </div>
            ) : (
              sources.map((src) => {
                const quality = evaluateSourceQuality(src);
                return (
                  <div
                    key={src.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${quality.badgeColor}`}>
                        {src.sourceType.toUpperCase().replace('_', ' ')}
                      </span>
                      {src.crossCheckCount > 0 && (
                        <span className="text-[9px] text-cyan-400 font-mono font-semibold">
                          +{src.crossCheckCount} cross-checks
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-2 leading-tight">
                      {src.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {src.publisher} &bull; {src.publishDate}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
