import React from 'react';
import { MessageSquare, Plus, ShieldCheck, AlertCircle, Eye, Flame, Compass } from 'lucide-react';
import type { FindingAnnotation, EvidenceFlag } from '../types/research.ts';
import { getEvidenceFlagMeta } from '../lib/annotationUtils.ts';

interface AnnotationBadgeProps {
  targetId: string;
  targetTitle?: string;
  targetType?: string;
  annotations: FindingAnnotation[];
  canAnnotate: boolean;
  onOpenAnnotations: (targetId: string, targetTitle?: string, startNew?: boolean) => void;
}

export const AnnotationBadge: React.FC<AnnotationBadgeProps> = ({
  targetId,
  targetTitle,
  annotations,
  canAnnotate,
  onOpenAnnotations,
}) => {
  const itemAnnotations = annotations.filter((a) => a.targetId === targetId);
  const activeAnnotations = itemAnnotations.filter((a) => !a.resolved);

  const getIcon = (flag: EvidenceFlag) => {
    switch (flag) {
      case 'verified':
        return <ShieldCheck className="w-3 h-3 text-emerald-400" />;
      case 'conflicting':
        return <AlertCircle className="w-3 h-3 text-amber-400" />;
      case 'needs_review':
        return <Eye className="w-3 h-3 text-blue-400" />;
      case 'critical_insight':
        return <Flame className="w-3 h-3 text-rose-400" />;
      case 'methodology_gap':
        return <Compass className="w-3 h-3 text-purple-400" />;
      default:
        return <MessageSquare className="w-3 h-3 text-slate-400" />;
    }
  };

  // Unique flags present on this finding
  const flags = Array.from(new Set(itemAnnotations.map((a) => a.flag)));

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
      {itemAnnotations.length > 0 ? (
        <button
          type="button"
          onClick={() => onOpenAnnotations(targetId, targetTitle, false)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950/80 border border-slate-700/80 hover:border-indigo-500/80 text-slate-200 transition-all cursor-pointer shadow-sm group"
          title="Click to view shared comments and evidence flags"
        >
          <div className="flex items-center -space-x-1">
            {flags.slice(0, 3).map((f) => (
              <span key={f} className="inline-block">
                {getIcon(f)}
              </span>
            ))}
          </div>
          <span className="font-semibold text-slate-300 group-hover:text-white">
            {itemAnnotations.length} {itemAnnotations.length === 1 ? 'Annotation' : 'Annotations'}
          </span>
          {activeAnnotations.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {activeAnnotations.length} active
            </span>
          )}
          {flags.map((flag) => {
            const meta = getEvidenceFlagMeta(flag);
            return (
              <span
                key={flag}
                className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${meta.badgeClass}`}
              >
                {meta.label}
              </span>
            );
          })}
        </button>
      ) : null}

      {/* Button to add an annotation (visible or contextual) */}
      <button
        type="button"
        onClick={() => onOpenAnnotations(targetId, targetTitle, true)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
          itemAnnotations.length === 0
            ? 'bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            : 'bg-indigo-950/40 border border-indigo-800/40 hover:border-indigo-600/70 text-indigo-300'
        }`}
        title={canAnnotate ? 'Add shared comment or evidence flag' : 'Sign in as Manager or Admin to annotate'}
      >
        <Plus className="w-3 h-3" />
        <span>{itemAnnotations.length === 0 ? 'Add Evidence Flag / Note' : 'Add Note'}</span>
        {!canAnnotate && (
          <span className="text-[10px] text-slate-500">(Admin/Mgr)</span>
        )}
      </button>
    </div>
  );
};
