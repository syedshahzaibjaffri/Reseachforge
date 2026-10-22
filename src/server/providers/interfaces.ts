import type {
  ResearchConfig,
  ResearchSource,
  SourceType,
  ClaimVerification,
  ProblemReport,
  CrossProblemPattern,
  InnovationConcept,
  TechnicalTerm,
} from '../../types/research.ts';

export interface SearchQueryOptions {
  query: string;
  sourceType: SourceType;
  region?: string;
  timeRange?: string;
  limit?: number;
}

export interface ISearchProvider {
  name: string;
  search(options: SearchQueryOptions): Promise<ResearchSource[]>;
}

export interface IAcademicProvider {
  name: string;
  searchPapers(query: string, limit?: number): Promise<ResearchSource[]>;
}

export interface INewsProvider {
  name: string;
  searchNews(query: string, limit?: number): Promise<ResearchSource[]>;
}

export interface IGovernmentProvider {
  name: string;
  searchAdvisories(query: string, limit?: number): Promise<ResearchSource[]>;
}

export interface ISocialProvider {
  name: string;
  searchSignals(query: string, limit?: number): Promise<ResearchSource[]>;
}

export interface ISourceVerifier {
  verifyClaim(claim: string, sources: ResearchSource[]): Promise<ClaimVerification>;
}

export interface IAIOrchestrator {
  decomposeTopic(topic: string, config: ResearchConfig): Promise<string[]>;
  discoverProblems(topic: string, sources: ResearchSource[], config: ResearchConfig): Promise<ProblemReport[]>;
  synthesizeCrossPatterns(problems: ProblemReport[]): Promise<CrossProblemPattern[]>;
  generateGlobalGlossary(problems: ProblemReport[]): Promise<TechnicalTerm[]>;
}
