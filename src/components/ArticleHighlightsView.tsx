import React from 'react';
import { BookOpen, CheckCircle, ExternalLink, ShieldCheck, Newspaper, Globe, Sparkles } from 'lucide-react';
import type { SourceMainPoint, ResearchSource, FindingAnnotation } from '../types/research.ts';
import { evaluateSourceQuality } from '../lib/sourceQuality.ts';
import { AnnotationBadge } from './AnnotationBadge.tsx';

interface ArticleHighlightsViewProps {
  highlights: SourceMainPoint[];
  sources: ResearchSource[];
  annotations?: FindingAnnotation[];
  canAnnotate?: boolean;
  onOpenAnnotations?: (targetId: string, targetTitle?: string, startNew?: boolean) => void;
}

export const ArticleHighlightsView: React.FC<ArticleHighlightsViewProps> = ({
  highlights,
  sources,
  annotations = [],
  canAnnotate = false,
  onOpenAnnotations,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Priority Verification Stage</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Verified Articles & Source Key Takeaways
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Before problem decomposition, the research engine synthesizes the core empirical findings, documented statistics, and credibility signals directly from peer-reviewed articles, engineering blogs, government directives, and verified publications.
        </p>
      </div>

      {/* Grid of Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {highlights.map((hl) => {
          const matchedSource = sources.find((s) => s.id === hl.sourceId);

          return (
            <div
              key={hl.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {hl.sourceType.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                    {hl.publisher}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3 leading-snug">
                  {hl.sourceTitle}
                </h3>

                {/* Key Takeaway Box */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                  <strong className="text-cyan-400 block mb-1">Core Takeaway:</strong>
                  {hl.keyTakeaway}
                </div>

                {/* Verified Empirical Findings */}
                <div className="mt-3">
                  <strong className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
                    Verified Empirical Findings:
                  </strong>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {hl.verifiedFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Annotation Badge & Actions */}
                {onOpenAnnotations && (
                  <AnnotationBadge
                    targetId={hl.id}
                    targetTitle={`Article: ${hl.sourceTitle}`}
                    targetType="highlight"
                    annotations={annotations}
                    canAnnotate={canAnnotate}
                    onOpenAnnotations={onOpenAnnotations}
                  />
                )}
              </div>

              {/* Credibility Signals & Link */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {hl.credibilitySignals.map((sig, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium"
                    >
                      {sig}
                    </span>
                  ))}
                </div>

                {matchedSource?.url && (
                  <a
                    href={matchedSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>View Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
