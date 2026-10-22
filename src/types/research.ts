/**
 * ResearchForge AI — Core Type Definitions
 * From Real-World Problems to Evidence-Based Innovation
 */

export type ResearchDepth = 'quick' | 'standard' | 'deep' | 'advanced';

export type TimeRangeOption = 'last_30_days' | 'last_6_months' | 'last_year' | 'last_5_years' | 'custom';

export type SourceType =
  | 'academic'
  | 'government'
  | 'official_advisory'
  | 'industry_report'
  | 'reputable_news'
  | 'social_media'
  | 'web'
  | 'article'
  | 'blog'
  | 'verified_post'
  | 'official_website';

export type ClaimVerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY SUPPORTED'
  | 'CONFLICTING EVIDENCE'
  | 'INSUFFICIENT EVIDENCE';

export type GapClassification =
  | 'completely_unsolved'
  | 'partially_solved'
  | 'poorly_solved'
  | 'difficult_to_deploy'
  | 'environment_specific'
  | 'emerging_immature';

export interface ResearchAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'file';
  size: number;
  previewUrl?: string;
  mimeType: string;
  dataBase64?: string;
  description?: string;
}

export interface ResearchConfig {
  topic: string;
  depth: ResearchDepth;
  timeRange: TimeRangeOption;
  customTimeRange?: string; // e.g. "2024 - 2026"
  region: string; // 'Global' or country name or 'custom'
  customRegion?: string; // specific custom countries e.g. "United States, Germany"
  industryDomain?: string;
  targetPopulation?: string;
  sourceTypes: SourceType[];
  enablePromptInjectionDefense: boolean;
  attachments?: ResearchAttachment[];
  customOpenAIApiKey?: string;
}

export interface SourceMainPoint {
  id: string;
  sourceId: string;
  sourceTitle: string;
  publisher: string;
  sourceType: SourceType;
  keyTakeaway: string;
  verifiedFindings: string[];
  credibilitySignals: string[];
}

export interface ResearchSource {
  id: string;
  title: string;
  publisher: string;
  publishDate: string;
  author?: string;
  url: string;
  sourceType: SourceType;
  reliabilityIndicator: string; // e.g. "Peer-Reviewed Academic", "Government Standards (NIST/CISA)"
  isOfficial: boolean;
  crossCheckCount: number;
  corroborationSummary?: string;
  primaryOrSecondary: 'primary' | 'secondary' | 'signal';
  excerpt?: string;
  mainTakeaways?: string[];
}

export interface ClaimVerification {
  id: string;
  claim: string;
  status: ClaimVerificationStatus;
  evidenceSummary: string;
  supportingSourceIds: string[];
  conflictingSourceIds?: string[];
  neutralDisagreementSummary?: string;
}

export interface ExistingSolution {
  id: string;
  name: string;
  type: string; // e.g. "Hardware Security Keys (FIDO2/WebAuthn)"
  howItWorks: string;
  whoUsesIt: string;
  addressedProblem: string;
  evidenceOfExistence: string;
  sourceIds: string[];
  limitations: {
    technical?: string;
    cost?: string;
    scalability?: string;
    usability?: string;
    adoptionBarriers?: string;
    privacy?: string;
    securityWeakness?: string;
    infrastructureDependency?: string;
    humanFactor?: string;
  };
  failurePoint: {
    conditionWorks: string;
    conditionFails: string;
    detailedExplanation: string;
  };
}

export interface ProblemSolvingStrategy {
  problemId: string;
  problemTitle: string;
  immediateMitigations: string[]; // 0 - 30 days
  midTermEngineering: string[]; // 1 - 6 months
  longTermArchitectural: string[]; // 6 - 24+ months
  stakeholderActionPlan: Array<{
    stakeholder: 'Consumers' | 'Enterprise Architects' | 'Hardware/Software Vendors' | 'Regulators & Standards Bodies';
    action: string;
    priority: 'Critical' | 'High' | 'Medium';
    expectedImpact: string;
  }>;
}

export interface UnsolvedGap {
  id: string;
  title: string;
  description: string;
  classification: GapClassification;
  whyItStillExists: string;
  evidenceBasis: string;
  supportingSourceIds: string[];
}

export interface InnovationConcept {
  id: string;
  ideaName: string;
  problemAddressed: string;
  coreConcept: string;
  mechanismOfAction: string;
  improvementAdvantage: string;
  targetedLimitation: string;
  requiredTechnologies: string[];
  potentialUsers: string[];
  implementationChallenges: string[];
  risks: string[];
  experimentalValidationNeeds: string[];
  feasibilityCheck: {
    isTechnicallyPlausible: boolean;
    plausibilityRationale: string;
    differentiators: string;
    similarExistingSolutions: string[];
    criticalAssumptions: string[];
  };
  disclaimer: 'AI-generated innovation concept — not established or clinically/operationally validated';
}

export interface TechnicalTerm {
  term: string;
  beginnerDefinition: string;
  technicalDefinition: string;
  whyItMatters: string;
  realWorldExample: string;
  relatedConcepts: string[];
}

export interface GeneratedVisual {
  id: string;
  title: string;
  type: 'infographic' | 'diagram' | 'architecture' | 'threat_vector';
  description: string;
  svgContent: string;
  tags: string[];
}

export interface VideoScene {
  sceneNumber: number;
  timestamp: string;
  title: string;
  durationSeconds: number;
  visualDescription: string;
  narrationScript: string;
  keyTakeaway: string;
  highlightedData: string;
}

export interface GeneratedVideoSimulation {
  id: string;
  title: string;
  totalDurationSeconds: number;
  format: '16:9 4K Presentation Simulation';
  summaryScript: string;
  scenes: VideoScene[];
  audioVoiceRecommendation: string;
}

export interface ProblemReport {
  id: string;
  shortTitle: string;
  oneSentenceSummary: string;
  category: string;
  evidenceLevel: 'High' | 'Moderate' | 'Emerging';
  evidenceCount: number;
  affectedSystems: string[];
  
  // Section A: Problem Overview
  overview: {
    whatIsIt: string;
    rootCauses: string[];
    mechanismOfOccurrence: string;
    whyItMatters: string;
  };

  // Section B: Real-World Impact
  realWorldImpact: {
    whoIsAffected: string[];
    systemsAffected: string[];
    consequences: string[];
    keyStatistics: Array<{
      stat: string;
      sourceId: string;
      context: string;
    }>;
  };

  // Section C & D: Existing Solutions & Limitations
  existingSolutions: ExistingSolution[];

  // Section E & F: Failure Points & Unsolved Gaps
  unsolvedGaps: UnsolvedGap[];

  // Section G: Improvement Opportunities
  improvementOpportunities: string[];

  // Section H: Innovation Concepts
  innovationConcepts: InnovationConcept[];

  // Section I: Technical Terms
  technicalTerms: TechnicalTerm[];

  // Problem Solving Strategies (Multi-Horizon Plan)
  solvingStrategy?: ProblemSolvingStrategy;

  // Supporting source IDs
  sourceIds: string[];
}

export interface CrossProblemPattern {
  id: string;
  patternName: string;
  description: string;
  affectedProblemIds: string[];
  systemicFailureMode: string;
  implicationForInnovators: string;
}

export interface ResearchStageInfo {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  detail?: string;
  timestamp?: string;
}

export interface ResearchJobProgress {
  currentStageId: string;
  percentage: number;
  stages: ResearchStageInfo[];
  recentLogs: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'success' | 'warn' | 'evidence';
  }>;
  discoveredSourceCount: number;
  identifiedProblemCount: number;
}

export interface ResearchProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  config: ResearchConfig;
  status: 'idle' | 'running' | 'completed' | 'error';
  errorMessage?: string;
  progress: ResearchJobProgress;
  
  // Synthesized outputs
  executiveSummary?: string;
  scopeAreas?: string[];
  articleHighlights: SourceMainPoint[]; // Key points of verified articles/sources highlighted first
  problems: ProblemReport[];
  problemStrategies: ProblemSolvingStrategy[]; // Comprehensive solving strategy matrix
  crossProblemPatterns: CrossProblemPattern[];
  claims: ClaimVerification[];
  sources: ResearchSource[];
  globalTechnicalGlossary: TechnicalTerm[];
  allInnovationConcepts: InnovationConcept[];
  generatedVisuals: GeneratedVisual[]; // Visuals generation
  videoSimulation?: GeneratedVideoSimulation; // Video generation & simulation
  metadata: {
    completedAt?: string;
    totalSourcesAnalyzed: number;
    corroboratedClaimsRatio: string;
    regionsCovered: string[];
    timeframe: string;
    sourcesByType: Record<string, number>;
  };
}

export type UserRole = 'Owner' | 'Admin' | 'Moderator' | 'Manager' | 'Researcher';

export interface UserPermissions {
  canRunDeepResearch: boolean;
  canGenerateVisuals: boolean;
  canExportDocuments: boolean;
  canManageUsers: boolean;
  canConfigureApiKeys: boolean;
  canViewAuditLogs: boolean;
  canModerateContent: boolean;
  canApprovePermissions: boolean;
}

export interface LoginAuditLog {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  method: 'credentials' | 'google' | 'email_otp';
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface ApiKeysConfig {
  geminiApiKey?: string;
  openAiApiKey?: string;
  claudeApiKey?: string;
  perplexityApiKey?: string;
  selectedModelMode: 'auto' | 'gemini-flash' | 'gemini-pro' | 'gpt-4o' | 'claude-3-5-sonnet';
}

export interface UserSession {
  token: string;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  expiresAt: number;
  loginMethod?: 'credentials' | 'google' | 'email_otp';
  googleAccessToken?: string;
}

export interface UserProgressOverview {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  loginMethod?: 'credentials' | 'google' | 'email_otp';
  createdAt: string;
  lastActive?: string;
  status: 'online' | 'idle' | 'offline';
  totalResearchJobs: number;
  activeJob?: {
    id: string;
    title: string;
    stage: string;
    percentage: number;
    status: string;
  };
  completedProjectsCount: number;
  totalAnnotationsCount: number;
  flagBreakdown: Record<string, number>;
}

export interface GoogleDriveSaveResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  savedAt: string;
  format: string;
}

export type EvidenceFlag =
  | 'verified'              // Verified by authoritative source
  | 'conflicting'           // Conflicting evidence identified
  | 'needs_review'          // Flagged for peer/management review
  | 'critical_insight'      // High priority/critical finding
  | 'methodology_gap';      // Sampling or methodology limitation

export type AnnotationTargetType =
  | 'finding'               // Problem report or finding
  | 'claim'                 // Claim verification
  | 'highlight'             // Article / Source highlight
  | 'solution'              // Existing solution & failure point
  | 'gap'                   // Research gap
  | 'concept'               // Innovation concept
  | 'custom_text';          // Arbitrary highlighted text

export interface FindingAnnotation {
  id: string;
  researchId: string;
  targetType: AnnotationTargetType;
  targetId: string;
  targetTitle?: string;
  highlightedText?: string;
  comment: string;
  flag: EvidenceFlag;
  author: {
    userId: string;
    username: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt?: string;
  resolved: boolean;
  resolvedBy?: {
    username: string;
    role: UserRole;
    timestamp: string;
  };
}
