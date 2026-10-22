import React from 'react';
import { AlertCircle, ArrowRight, Layers, ShieldCheck, Flame } from 'lucide-react';
import type { ProblemReport, FindingAnnotation } from '../types/research.ts';
import { AnnotationBadge } from './AnnotationBadge.tsx';

interface ProblemCardProps {
  problem: ProblemReport;
  index: number;
  onSelect: () => void;
  annotations?: FindingAnnotation[];
  canAnnotate?: boolean;
  onOpenAnnotations?: (targetId: string, targetTitle?: string, startNew?: boolean) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  index,
  onSelect,
  annotations = [],
  canAnnotate = false,
  onOpenAnnotations,
}) => {
  const failurePoint = problem.existingSolutions[0]?.failurePoint;

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-600/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xl flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
            Problem #{index + 1}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                problem.evidenceLevel === 'High'
                  ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-700/60 text-amber-300'
              }`}
            >
              {problem.evidenceLevel} Evidence ({problem.evidenceCount} sources)
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {problem.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
          {problem.shortTitle}
        </h3>

        {/* One-sentence summary */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
          {problem.oneSentenceSummary}
        </p>

        {/* Failure Point Teaser */}
        {failurePoint && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-rose-900/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Critical Solution Failure Point:</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Works under <span className="text-emerald-300 font-medium">"{failurePoint.conditionWorks}"</span>, but fails when{' '}
              <span className="text-rose-300 font-semibold underline decoration-rose-500/50">
                "{failurePoint.conditionFails}"
              </span>
              .
            </p>
          </div>
        )}

        {/* Affected Systems Chips */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
            Affected Systems:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {problem.affectedSystems.map((sys, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300"
              >
                {sys}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Flags & Annotation Badge */}
        {onOpenAnnotations && (
          <AnnotationBadge
            targetId={problem.id}
            targetTitle={`Problem: ${problem.shortTitle}`}
            targetType="finding"
            annotations={annotations}
            canAnnotate={canAnnotate}
            onOpenAnnotations={onOpenAnnotations}
          />
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-2">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>{problem.innovationConcepts.length} Innovation Concepts</span>
        </div>

        <button
          onClick={onSelect}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition duration-150 shadow-md shadow-indigo-600/20"
        >
          <span>Analyze Problem</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
