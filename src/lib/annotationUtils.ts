import type { EvidenceFlag, FindingAnnotation, UserRole } from '../types/research.ts';

/**
 * Check whether a user role has permission to create, edit, or resolve annotations.
 * Per specification: 'Manager', 'Admin', and 'Owner' roles can annotate & flag.
 * 'Researcher' or unauthenticated users have read-only access.
 */
export function canUserAnnotate(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return role === 'Owner' || role === 'Admin' || role === 'Manager';
}

export interface EvidenceFlagMeta {
  flag: EvidenceFlag;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
  iconName: 'check' | 'alert' | 'eye' | 'flame' | 'compass';
}

export const EVIDENCE_FLAG_METAS: Record<EvidenceFlag, EvidenceFlagMeta> = {
  verified: {
    flag: 'verified',
    label: 'Verified Evidence',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    dotClass: 'bg-emerald-400',
    description: 'Corroborated by independent, authoritative scientific or official sources.',
    iconName: 'check',
  },
  conflicting: {
    flag: 'conflicting',
    label: 'Conflicting Evidence',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    dotClass: 'bg-amber-400',
    description: 'Divergent findings or contested metrics identified across datasets.',
    iconName: 'alert',
  },
  needs_review: {
    flag: 'needs_review',
    label: 'Needs Manager Review',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    dotClass: 'bg-blue-400',
    description: 'Flagged for managerial evaluation or deeper source investigation.',
    iconName: 'eye',
  },
  critical_insight: {
    flag: 'critical_insight',
    label: 'Critical Finding',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    dotClass: 'bg-rose-400',
    description: 'High-severity systemic failure mode or pivotal breakthrough insight.',
    iconName: 'flame',
  },
  methodology_gap: {
    flag: 'methodology_gap',
    label: 'Methodology Gap',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    dotClass: 'bg-purple-400',
    description: 'Sample size constraint, simulation limit, or protocol boundary observed.',
    iconName: 'compass',
  },
};

export function getEvidenceFlagMeta(flag: EvidenceFlag): EvidenceFlagMeta {
  return EVIDENCE_FLAG_METAS[flag] || EVIDENCE_FLAG_METAS.needs_review;
}

/**
 * Filter annotations by search query, flag, and resolution state
 */
export function filterAnnotations(
  annotations: FindingAnnotation[],
  options: {
    flag?: EvidenceFlag | 'all';
    status?: 'all' | 'active' | 'resolved';
    query?: string;
    targetId?: string;
  }
): FindingAnnotation[] {
  return annotations.filter((ann) => {
    if (options.flag && options.flag !== 'all' && ann.flag !== options.flag) {
      return false;
    }
    if (options.status === 'active' && ann.resolved) {
      return false;
    }
    if (options.status === 'resolved' && !ann.resolved) {
      return false;
    }
    if (options.targetId && ann.targetId !== options.targetId) {
      return false;
    }
    if (options.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      const matchComment = ann.comment.toLowerCase().includes(q);
      const matchHighlight = ann.highlightedText ? ann.highlightedText.toLowerCase().includes(q) : false;
      const matchAuthor = ann.author.name.toLowerCase().includes(q) || ann.author.username.toLowerCase().includes(q);
      const matchTitle = ann.targetTitle ? ann.targetTitle.toLowerCase().includes(q) : false;
      if (!matchComment && !matchHighlight && !matchAuthor && !matchTitle) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Group annotations by target ID for quick badge mapping on findings
 */
export function groupAnnotationsByTarget(
  annotations: FindingAnnotation[]
): Record<string, FindingAnnotation[]> {
  const map: Record<string, FindingAnnotation[]> = {};
  for (const ann of annotations) {
    if (!map[ann.targetId]) {
      map[ann.targetId] = [];
    }
    map[ann.targetId].push(ann);
  }
  return map;
}
