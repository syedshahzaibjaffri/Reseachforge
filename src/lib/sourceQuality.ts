import type { ResearchSource, SourceType } from '../types/research.ts';

/**
 * Source Quality and Evaluation System
 *
 * Rules:
 * 1. Do NOT display arbitrary numerical "trust scores" as objective truth.
 * 2. Present objective descriptive classifications (Academic, Government, Official, Industry, News, Social Signal).
 * 3. Quantify corroboration ("Cross-checked by X independent sources").
 * 4. Never treat single social media posts as verified factual evidence.
 */

export interface SourceQualityEvaluation {
  sourceTypeLabel: string;
  badgeColor: string; // Tailwind class
  corroborationBadge: string;
  reliabilityNote: string;
  isPrimaryEvidence: boolean;
  canStandAloneAsProof: boolean;
}

export function evaluateSourceQuality(source: ResearchSource): SourceQualityEvaluation {
  let sourceTypeLabel = 'Web Source';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let canStandAloneAsProof = false;
  let isPrimaryEvidence = source.primaryOrSecondary === 'primary';

  switch (source.sourceType) {
    case 'academic':
      sourceTypeLabel = 'Peer-Reviewed Academic Source';
      badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      canStandAloneAsProof = true;
      break;
    case 'government':
    case 'official_advisory':
      sourceTypeLabel = 'Official / Government Authority';
      badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      canStandAloneAsProof = true;
      break;
    case 'industry_report':
      sourceTypeLabel = 'Industry Benchmark Report';
      badgeColor = 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      canStandAloneAsProof = source.crossCheckCount >= 1;
      break;
    case 'reputable_news':
      sourceTypeLabel = 'Reputable Investigative News';
      badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      canStandAloneAsProof = source.crossCheckCount >= 2;
      break;
    case 'social_media':
      sourceTypeLabel = 'Social Media Real-Time Signal (Unverified)';
      badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      canStandAloneAsProof = false;
      isPrimaryEvidence = false;
      break;
    default:
      sourceTypeLabel = 'General Web / Technical Documentation';
      badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
      canStandAloneAsProof = source.crossCheckCount >= 2;
  }

  const crossCount = Math.max(0, source.crossCheckCount || 0);
  const corroborationBadge =
    crossCount > 0
      ? `Cross-checked by ${crossCount} additional source${crossCount > 1 ? 's' : ''}`
      : 'Single source citation — corroboration recommended';

  let reliabilityNote = source.reliabilityIndicator || sourceTypeLabel;
  if (source.sourceType === 'social_media') {
    reliabilityNote = 'Treated as real-time observational signal; requires corroboration with primary reports.';
  }

  return {
    sourceTypeLabel,
    badgeColor,
    corroborationBadge,
    reliabilityNote,
    isPrimaryEvidence,
    canStandAloneAsProof,
  };
}

/**
 * Returns human-readable label for source category
 */
export function getSourceTypeDisplayName(type: SourceType): string {
  switch (type) {
    case 'academic':
      return 'Academic / Peer-Reviewed';
    case 'government':
      return 'Government / Regulatory';
    case 'official_advisory':
      return 'Official Security Advisory';
    case 'industry_report':
      return 'Industry Benchmark';
    case 'reputable_news':
      return 'Reputable Journalism';
    case 'social_media':
      return 'Social Media Signal';
    case 'web':
      return 'Web & Standards';
    default:
      return type;
  }
}
