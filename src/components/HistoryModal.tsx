import React from 'react';
import { X, Clock, ArrowRight, Trash2, Download, FileText, Layers } from 'lucide-react';
import type { ResearchProject } from '../types/research.ts';
import { formatRegionLabel, formatTimeRangeLabel } from '../lib/countries.ts';

interface HistoryModalProps {
  history: ResearchProject[];
  currentProjectId?: string;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Research Project History</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No research projects saved yet. Initiate a research query to begin.
            </div>
          ) : (
            history.map((project) => {
              const isCurrent = project.id === currentProjectId;
              return (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-600/70 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {project.config.depth}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-sm truncate">{project.title}</h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{project.problems?.length || 0} Problems</span>
                      <span>&bull;</span>
                      <span>{project.sources?.length || 0} Sources</span>
                      <span>&bull;</span>
                      <span>{formatRegionLabel(project.config.region, project.config.customRegion)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 transition shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete project"
                      aria-label="Delete project"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
