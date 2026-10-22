import type { ClaimVerification, ClaimVerificationStatus, ResearchSource } from '../types/research.ts';

/**
 * Claim Verification System
 * Evaluates claims based on supporting evidence, conflicting evidence, and source authority.
 */

export interface VerificationBadgeMeta {
  status: ClaimVerificationStatus;
  label: string;
  badgeStyle: string; // Tailwind styling
  description: string;
}

export function getVerificationMeta(status: ClaimVerificationStatus): VerificationBadgeMeta {
  switch (status) {
    case 'SUPPORTED':
      return {
        status,
        label: 'SUPPORTED BY EVIDENCE',
        badgeStyle: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80',
        description: 'Corroborated by multiple authoritative primary or academic sources with direct empirical support.',
      };
    case 'PARTIALLY SUPPORTED':
      return {
        status,
        label: 'PARTIALLY SUPPORTED',
        badgeStyle: 'bg-amber-950/80 text-amber-300 border border-amber-700/80',
        description: 'Supported under specific operational conditions, but generalizability or long-term data is limited.',
      };
    case 'CONFLICTING EVIDENCE':
      return {
        status,
        label: 'CONFLICTING EVIDENCE',
        badgeStyle: 'bg-rose-950/80 text-rose-300 border border-rose-700/80',
        description: 'Reputable studies report differing outcomes or methodologies. Sources disagree; presented neutrally without forced consensus.',
      };
    case 'INSUFFICIENT EVIDENCE':
      return {
        status,
        label: 'INSUFFICIENT RELIABLE EVIDENCE',
        badgeStyle: 'bg-slate-800 text-slate-300 border border-slate-600',
        description: 'Insufficient verifiable peer-reviewed or official evidence available. Not treated as verified fact.',
      };
  }
}

/**
 * Deterministically computes or verifies a claim status given sources and flags.
 */
export function evaluateClaimStatus(
  supportingSources: ResearchSource[],
  conflictingSources: ResearchSource[] = []
): { status: ClaimVerificationStatus; neutralSummary?: string } {
  if (conflictingSources.length > 0 && supportingSources.length > 0) {
    return {
      status: 'CONFLICTING EVIDENCE',
      neutralSummary: `Sources present divergent findings: ${supportingSources.length} source(s) support the claim while ${conflictingSources.length} report counter-evidence or divergent methodology.`,
    };
  }

  if (supportingSources.length === 0) {
    return {
      status: 'INSUFFICIENT EVIDENCE',
      neutralSummary: 'Insufficient reliable evidence found across indexed databases.',
    };
  }

  const hasAuthoritative = supportingSources.some(
    (s) => s.sourceType === 'academic' || s.sourceType === 'government' || s.sourceType === 'official_advisory'
  );

  const onlySocial = supportingSources.every((s) => s.sourceType === 'social_media');
  if (onlySocial) {
    return {
      status: 'INSUFFICIENT EVIDENCE',
      neutralSummary: 'Claim based solely on social-media signals without primary verification.',
    };
  }

  if (hasAuthoritative && supportingSources.length >= 2) {
    return {
      status: 'SUPPORTED',
    };
  }

  return {
    status: 'PARTIALLY SUPPORTED',
    neutralSummary: 'Supported by preliminary or singular source; further corroboration warranted.',
  };
}
