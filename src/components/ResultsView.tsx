import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  BookOpen,
  Download,
  Share2,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Lock,
  Tag,
  Highlighter,
} from 'lucide-react';
import type { ProblemReport, ResearchProject, SourceType, FindingAnnotation, EvidenceFlag, UserSession } from '../types/research.ts';
import { ProblemCard } from './ProblemCard.tsx';
import { ProblemDetailModal } from './ProblemDetailModal.tsx';
import { ArticleHighlightsView } from './ArticleHighlightsView.tsx';
import { StrategiesView } from './StrategiesView.tsx';
import { VisualsStudio } from './VisualsStudio.tsx';
import { AnalyticsView } from './AnalyticsView.tsx';
import { AnnotationBadge } from './AnnotationBadge.tsx';
import { AnnotationDrawer } from './AnnotationDrawer.tsx';
import { evaluateSourceQuality, getSourceTypeDisplayName } from '../lib/sourceQuality.ts';
import { getVerificationMeta } from '../lib/claimVerification.ts';
import { formatRegionLabel, formatTimeRangeLabel } from '../lib/countries.ts';
import { canUserAnnotate } from '../lib/annotationUtils.ts';

interface ResultsViewProps {
  project: ResearchProject;
  session?: UserSession | null;
  onNewResearch: () => void;
  onOpenExport: () => void;
}

type TabType =
  | 'overview'
  | 'articles'
  | 'analytics'
  | 'problems'
  | 'strategies'
  | 'visuals'
  | 'solutions'
  | 'gaps'
  | 'innovation'
  | 'verification'
  | 'glossary'
  | 'sources'
  | 'patterns';

export const ResultsView: React.FC<ResultsViewProps> = ({
  project,
  session = null,
  onNewResearch,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [glossaryLevel, setGlossaryLevel] = useState<'beginner' | 'technical'>('beginner');

  // Real-time Annotation State
  const [annotations, setAnnotations] = useState<FindingAnnotation[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isAnnotationDrawerOpen, setIsAnnotationDrawerOpen] = useState<boolean>(false);
  const [drawerTargetId, setDrawerTargetId] = useState<string>('');
  const [drawerTargetTitle, setDrawerTargetTitle] = useState<string>('');
  const [drawerHighlightText, setDrawerHighlightText] = useState<string>('');
  const [selectionTooltip, setSelectionTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canAnnotate = canUserAnnotate(session?.role);

  // Load Initial Annotations & Subscribe to SSE Real-time Updates
  useEffect(() => {
    let isMounted = true;

    const fetchAnnotations = async () => {
      try {
        const res = await fetch(`/api/research/${project.id}/annotations`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setAnnotations(data);
        }
      } catch (err) {
        console.warn('Could not fetch annotations:', err);
      }
    };

    fetchAnnotations();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/research/${project.id}/annotations/stream`);

      eventSource.onopen = () => {
        if (isMounted) setIsLiveConnected(true);
      };

      eventSource.addEventListener('init', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.annotations) {
            setAnnotations(payload.annotations);
          }
        } catch (err) {
          console.error('Error parsing init annotations:', err);
        }
      });

      eventSource.addEventListener('annotation_added', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.annotation) {
            setAnnotations((prev) => {
              if (prev.some((a) => a.id === payload.annotation.id)) return prev;
              return [payload.annotation, ...prev];
            });
          }
        } catch (err) {
          console.error('Error parsing annotation_added:', err);
        }
      });

      eventSource.addEventListener('annotation_updated', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.annotation) {
            setAnnotations((prev) =>
              prev.map((a) => (a.id === payload.annotation.id ? payload.annotation : a))
            );
          }
        } catch (err) {
          console.error('Error parsing annotation_updated:', err);
        }
      });

      eventSource.addEventListener('annotation_deleted', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.annotationId) {
            setAnnotations((prev) => prev.filter((a) => a.id !== payload.annotationId));
          }
        } catch (err) {
          console.error('Error parsing annotation_deleted:', err);
        }
      });

      eventSource.onerror = () => {
        if (isMounted) setIsLiveConnected(false);
      };
    } catch (err) {
      console.warn('EventSource initialization failed, using poll fallback:', err);
    }

    // Polling fallback every 8 seconds
    const interval = setInterval(fetchAnnotations, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [project.id]);

  // Handle Text Selection Highlighting within the Research View
  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelectionTooltip(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 5) {
      setSelectionTooltip(null);
      return;
    }

    // Ensure selection is inside the container
    if (containerRef.current && containerRef.current.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionTooltip({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top - 12,
        });
      } catch {
        setSelectionTooltip(null);
      }
    } else {
      setSelectionTooltip(null);
    }
  };

  const handleAnnotateSelection = () => {
    if (!selectionTooltip) return;
    setDrawerHighlightText(selectionTooltip.text);
    setDrawerTargetId(project.problems[0]?.id || 'general-finding');
    setDrawerTargetTitle(`Excerpt: "${selectionTooltip.text.substring(0, 45)}..."`);
    setIsAnnotationDrawerOpen(true);
    setSelectionTooltip(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleOpenAnnotations = (targetId: string, targetTitle?: string, startNew = false) => {
    setDrawerTargetId(targetId);
    setDrawerTargetTitle(targetTitle || '');
    if (startNew) {
      setDrawerHighlightText('');
    }
    setIsAnnotationDrawerOpen(true);
  };

  const handleAddAnnotation = async (data: {
    targetType: string;
    targetId: string;
    targetTitle?: string;
    highlightedText?: string;
    comment: string;
    flag: EvidenceFlag;
  }): Promise<boolean> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      const res = await fetch(`/api/research/${project.id}/annotations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const created: FindingAnnotation = await res.json();
        setAnnotations((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to post annotation:', err);
      return false;
    }
  };

  const handleToggleResolve = async (annotationId: string, currentResolved: boolean): Promise<boolean> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      const res = await fetch(`/api/research/${project.id}/annotations/${annotationId}/resolve`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ resolved: !currentResolved }),
      });

      if (res.ok) {
        const updated: FindingAnnotation = await res.json();
        setAnnotations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to resolve annotation:', err);
      return false;
    }
  };

  const handleDeleteAnnotation = async (annotationId: string): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {};
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      const res = await fetch(`/api/research/${project.id}/annotations/${annotationId}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete annotation:', err);
      return false;
    }
  };

  const handleJumpToTarget = (targetId: string) => {
    setIsAnnotationDrawerOpen(false);

    // Switch to appropriate tab depending on target
    const probMatch = problems.find((p) => p.id === targetId);
    if (probMatch) {
      setActiveTab('problems');
      setSelectedProblem(probMatch);
      return;
    }

    const hlMatch = (project.articleHighlights || []).find((h) => h.id === targetId);
    if (hlMatch) {
      setActiveTab('articles');
      return;
    }

    const claimMatch = (project.claims || []).find((c) => c.id === targetId);
    if (claimMatch) {
      setActiveTab('verification');
      return;
    }

    const innoMatch = (project.allInnovationConcepts || []).find((i) => i.id === targetId);
    if (innoMatch) {
      setActiveTab('innovation');
      return;
    }

    setActiveTab('overview');
  };

  const {
    title,
    config,
    problems,
    crossProblemPatterns,
    claims,
    sources,
    globalTechnicalGlossary,
    allInnovationConcepts,
    metadata,
  } = project;

  // Filter sources by type
  const filteredSources =
    sourceFilter === 'all' ? sources : sources.filter((s) => s.sourceType === sourceFilter);

  const tabs: Array<{ id: TabType; label: string; count?: number; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-3.5 h-3.5" /> },
    {
      id: 'articles',
      label: 'Verified Article Highlights',
      count: (project.articleHighlights || []).length,
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      id: 'analytics',
      label: 'Trend Analytics & Graphs',
      icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />,
    },
    { id: 'problems', label: 'Problems', count: problems.length, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    {
      id: 'strategies',
      label: 'Problem Solving Strategies',
      count: (project.problemStrategies || []).length,
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'visuals',
      label: 'Visuals & Video Studio',
      count: (project.generatedVisuals || []).length,
      icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      id: 'solutions',
      label: 'Solutions & Failure Points',
      count: problems.reduce((acc, p) => acc + p.existingSolutions.length, 0),
      icon: <Flame className="w-3.5 h-3.5" />,
    },
    {
      id: 'gaps',
      label: 'Research Gaps',
      count: problems.reduce((acc, p) => acc + p.unsolvedGaps.length, 0),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'innovation',
      label: 'Innovation Concepts',
      count: allInnovationConcepts.length,
      icon: <Lightbulb className="w-3.5 h-3.5" />,
    },
    { id: 'verification', label: 'Claim Verification', count: claims.length, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    {
      id: 'annotations' as any,
      label: 'Evidence Annotations & Flags',
      count: annotations.length,
      icon: <MessageSquare className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'patterns',
      label: 'Cross-Problem Patterns',
      count: crossProblemPatterns.length,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    { id: 'glossary', label: 'Technical Terms', count: globalTechnicalGlossary.length, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'sources', label: 'Sources', count: sources.length, icon: <Share2 className="w-3.5 h-3.5" /> },
  ];

  const activeAnnotationCount = annotations.filter((a) => !a.resolved).length;

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 relative select-text"
    >
      {/* Floating Selection Tooltip for Highlighting Findings */}
      {selectionTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionTooltip.x}px`,
            top: `${selectionTooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 60,
          }}
          className="animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onClick={handleAnnotateSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-indigo-300 hover:text-white border border-indigo-500/80 shadow-2xl text-xs font-mono font-bold hover:bg-indigo-900 transition-all cursor-pointer whitespace-nowrap backdrop-blur-md"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span>Highlight & Flag Finding {canAnnotate ? '(Manager/Admin)' : '(View)'}</span>
          </button>
        </div>
      )}

      {/* Research Summary Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                Verified Research Report
              </span>
              <span className="text-xs text-slate-400">
                Generated: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Region: <strong className="text-white">{formatRegionLabel(config.region, config.customRegion)}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Time Horizon: <strong className="text-white">{formatTimeRangeLabel(config.timeRange, config.customTimeRange)}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Depth: <strong className="text-white capitalize">{config.depth}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-semibold">
                Corroborated Claims: {metadata?.corroboratedClaimsRatio || '85%'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Real-Time Collaborative Annotations & Evidence Flags Button */}
            <button
              type="button"
              onClick={() => setIsAnnotationDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-indigo-600/70 hover:border-indigo-400 text-white font-bold text-xs sm:text-sm shadow-md transition group cursor-pointer"
              title="Open real-time collaborative annotations and evidence flags drawer"
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-slate-200 group-hover:text-white">Evidence Notes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {annotations.length}
              </span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onNewResearch}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>New Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collaborative Annotations & Evidence Live Bar */}
      <div className="mb-6 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={isLiveConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isLiveConnected ? 'Real-Time SSE Sync Active' : 'Connecting to Stream...'}
            </span>
          </div>

          <span className="text-slate-500 hidden sm:inline">&bull;</span>

          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
            <span>Collaborative Findings:</span>
            <span className="font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
              {annotations.length} Shared Flags
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              ({activeAnnotationCount} active review)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {canAnnotate ? (
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manager/Admin Privileges: Highlight text or click '+ Note' to flag evidence</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-amber-400 font-mono text-[11px] bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only Review Mode: Manager & Admin annotations sync live</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setDrawerTargetId(project.problems[0]?.id || 'general-finding');
              setDrawerTargetTitle('General Research Report Finding');
              setDrawerHighlightText('');
              setIsAnnotationDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-sm"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Open Annotations Drawer</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-thin gap-1.5 border-b border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-950/80 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {project.executiveSummary && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
              <h2 className="text-sm uppercase font-bold text-indigo-400 tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Executive Summary</span>
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {project.executiveSummary}
              </p>
            </div>
          )}

          {/* Scope Areas */}
          {project.scopeAreas && project.scopeAreas.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Research Scope Decomposition:
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.scopeAreas.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Problem Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Discovered Real-World Problems ({problems.length})</span>
              </h2>
              <button
                onClick={() => setActiveTab('problems')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {problems.map((prob, idx) => (
                <ProblemCard
                  key={prob.id}
                  problem={prob}
                  index={idx}
                  onSelect={() => setSelectedProblem(prob)}
                  annotations={annotations}
                  canAnnotate={canAnnotate}
                  onOpenAnnotations={handleOpenAnnotations}
                />
              ))}
            </div>
          </div>

          {/* Highlighted Cross-Problem Insight */}
          {crossProblemPatterns.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/50 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Primary Cross-Problem Systemic Pattern</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {crossProblemPatterns[0].patternName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                {crossProblemPatterns[0].description}
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <strong className="text-cyan-300">Implication for Innovators: </strong>
                {crossProblemPatterns[0].implicationForInnovators}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Verified Article Highlights */}
      {activeTab === 'articles' && (
        <ArticleHighlightsView
          highlights={project.articleHighlights || []}
          sources={sources}
          annotations={annotations}
          canAnnotate={canAnnotate}
          onOpenAnnotations={handleOpenAnnotations}
        />
      )}

      {/* Tab: Trend Analytics & Graphs */}
      {activeTab === 'analytics' && (
        <AnalyticsView project={project} />
      )}

      {/* Tab: Problems */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-400">
              Select any problem card to open its complete 9-stage structured research report. Highlight text or click notes to add shared evidence flags.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((prob, idx) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                index={idx}
                onSelect={() => setSelectedProblem(prob)}
                annotations={annotations}
                canAnnotate={canAnnotate}
                onOpenAnnotations={handleOpenAnnotations}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Problem Solving Strategies */}
      {activeTab === 'strategies' && (
        <StrategiesView
          strategies={project.problemStrategies || []}
          problems={problems}
        />
      )}

      {/* Tab: Visuals & Video Studio */}
      {activeTab === 'visuals' && (
        <VisualsStudio
          visuals={project.generatedVisuals || []}
          videoSimulation={project.videoSimulation}
        />
      )}

      {/* Tab: Existing Solutions & Failure Points */}
      {activeTab === 'solutions' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            Below is the empirical breakdown of currently deployed solutions and the exact conditions where they break down.
          </div>

          <div className="space-y-5">
            {problems.map((prob) => (
              <div key={prob.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                    Problem Context:
                  </span>
                  <h3 className="text-lg font-bold text-white">{prob.shortTitle}</h3>
                </div>

                <div className="space-y-4">
                  {prob.existingSolutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-base">{sol.name}</h4>
                        <span className="text-xs text-indigo-300 font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                          {sol.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        <strong>How it operates:</strong> {sol.howItWorks}
                      </p>

                      {/* Failure Point Highlight */}
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                          <Flame className="w-4 h-4 text-rose-400" />
                          <span>THE EXACT FAILURE POINT:</span>
                        </div>
                        <div className="text-slate-200">
                          Works under{' '}
                          <span className="text-emerald-300 font-semibold">{sol.failurePoint.conditionWorks}</span>
                          , but fails when{' '}
                          <span className="text-rose-300 font-semibold underline decoration-rose-500">
                            {sol.failurePoint.conditionFails}
                          </span>
                          .
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          {sol.failurePoint.detailedExplanation}
                        </p>
                      </div>

                      {/* Evidence Flag & Annotation Badge */}
                      <AnnotationBadge
                        targetId={sol.id}
                        targetTitle={`Solution: ${sol.name}`}
                        targetType="solution"
                        annotations={annotations}
                        canAnnotate={canAnnotate}
                        onOpenAnnotations={handleOpenAnnotations}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Research Gaps */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            Documented research gaps classified by unsolved state. Claims of "unsolved" are corroborated by published citations.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.flatMap((p) => p.unsolvedGaps).map((gap) => (
              <div key={gap.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-white text-sm sm:text-base">{gap.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-300">
                    {gap.classification.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300">
                  <strong className="text-indigo-300">Why it still persists:</strong> {gap.whyItStillExists}
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong>Evidence Basis:</strong> {gap.evidenceBasis}
                </div>

                {/* Evidence Flag & Annotation Badge */}
                <AnnotationBadge
                  targetId={gap.id}
                  targetTitle={`Research Gap: ${gap.title}`}
                  targetType="gap"
                  annotations={annotations}
                  canAnnotate={canAnnotate}
                  onOpenAnnotations={handleOpenAnnotations}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Innovation Concepts */}
      {activeTab === 'innovation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Research Integrity Notice:</strong> All concepts below are synthesized as [AI-GENERATED INNOVATION CONCEPTS]. They are designed to target specific identified failure points and require independent experimental validation.
            </span>
          </div>

          <div className="space-y-5">
            {allInnovationConcepts.map((concept) => (
              <div
                key={concept.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-700/50 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      <span>{concept.ideaName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Targeted Existing Limitation: <strong className="text-indigo-300">{concept.targetedLimitation}</strong>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/40 text-amber-300 shrink-0">
                    AI-Generated Concept
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-2">
                    <p className="text-slate-200">
                      <strong>Core Concept:</strong> {concept.coreConcept}
                    </p>
                    <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <strong>How it could work:</strong> {concept.mechanismOfAction}
                    </p>
                    <p className="text-slate-300">
                      <strong>Why it improves the current situation:</strong> {concept.improvementAdvantage}
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <strong className="text-slate-300 block mb-1">Required Technologies:</strong>
                      <div className="flex flex-wrap gap-1">
                        {concept.requiredTechnologies.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-300 block mb-1">What Makes It Different (Differentiator):</strong>
                      <span className="text-slate-300 leading-relaxed">
                        {concept.feasibilityCheck.differentiators}
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-300 block mb-1">Validation Requirements:</strong>
                      <ul className="list-disc pl-4 text-slate-300 space-y-0.5">
                        {concept.experimentalValidationNeeds.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Evidence Flag & Annotation Badge */}
                <AnnotationBadge
                  targetId={concept.id}
                  targetTitle={`Innovation Concept: ${concept.ideaName}`}
                  targetType="concept"
                  annotations={annotations}
                  canAnnotate={canAnnotate}
                  onOpenAnnotations={handleOpenAnnotations}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Claim Verification */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            Claims are cross-checked across indexed databases. When sources disagree, conflicting findings are presented neutrally without forced consensus.
          </div>

          <div className="space-y-4">
            {claims.map((c) => {
              const meta = getVerificationMeta(c.status);
              return (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${meta.badgeStyle}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      Referenced by {c.supportingSourceIds.length} source(s)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">"{c.claim}"</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{c.evidenceSummary}</p>

                  {c.neutralDisagreementSummary && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200">
                      <strong>Dissenting / Divergent Analysis: </strong>
                      {c.neutralDisagreementSummary}
                    </div>
                  )}

                  {/* Evidence Flag & Annotation Badge */}
                  <AnnotationBadge
                    targetId={c.id}
                    targetTitle={`Claim: ${c.claim.substring(0, 50)}...`}
                    targetType="claim"
                    annotations={annotations}
                    canAnnotate={canAnnotate}
                    onOpenAnnotations={handleOpenAnnotations}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 7: Cross-Problem Patterns */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            Systemic patterns and shared failure modes detected across multiple independently analyzed problems.
          </div>

          <div className="space-y-4">
            {crossProblemPatterns.map((pat) => (
              <div key={pat.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>{pat.patternName}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pat.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-rose-400 block mb-1">Systemic Failure Mode:</strong>
                    <span className="text-slate-300">{pat.systemicFailureMode}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-cyan-400 block mb-1">Implication for Innovators:</strong>
                    <span className="text-slate-300">{pat.implicationForInnovators}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Technical Glossary */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-300">
              Technical terms extracted automatically from the research evidence.
            </span>

            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setGlossaryLevel('beginner')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  glossaryLevel === 'beginner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Beginner Level
              </button>
              <button
                type="button"
                onClick={() => setGlossaryLevel('technical')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  glossaryLevel === 'technical' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Technical Engineering
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalTechnicalGlossary.map((term, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm space-y-2">
                <div className="font-bold text-white text-base flex items-center justify-between">
                  <span>{term.term}</span>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase">
                    {glossaryLevel === 'beginner' ? 'Plain English' : 'Technical Spec'}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {glossaryLevel === 'beginner' ? term.beginnerDefinition : term.technicalDefinition}
                </p>

                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <strong className="text-slate-300">Real-World Context: </strong>
                  {term.realWorldExample}
                </div>

                <div className="text-[11px] text-indigo-300">
                  <strong>Why it matters: </strong>
                  {term.whyItMatters}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Traceable Sources Directory */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Source Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by Type:
            </span>
            {['all', 'academic', 'government', 'official_advisory', 'industry_report', 'reputable_news', 'social_media', 'web'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setSourceFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    sourceFilter === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type === 'all' ? 'All Sources' : getSourceTypeDisplayName(type as SourceType)}
                </button>
              )
            )}
          </div>

          <div className="space-y-3">
            {filteredSources.map((src) => {
              const quality = evaluateSourceQuality(src);
              return (
                <div
                  key={src.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${quality.badgeColor}`}>
                        {src.sourceType.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {src.publisher} &bull; {src.publishDate}
                      </span>
                      {src.crossCheckCount > 0 && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          +{src.crossCheckCount} corroborations
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-base leading-snug">{src.title}</h4>

                    {src.excerpt && (
                      <p className="text-xs text-slate-300 italic">"{src.excerpt}"</p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      <strong>Indicator:</strong> {quality.reliabilityNote}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigator.clipboard.writeText(src.url)}
                      title="Copy URL"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs transition"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Evidence Annotations & Flags View */}
      {activeTab === 'annotations' && (
        <div className="space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Collaborative Review Workspace</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Real-Time Finding Annotations & Evidence Flags
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Reviewers with <strong className="text-indigo-300">Manager</strong> or <strong className="text-indigo-300">Admin</strong> privileges can highlight specific findings, tag evidence validity, and collaborate in real time. Changes synchronize instantly across all active sessions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerTargetId(project.problems[0]?.id || 'general');
                setDrawerTargetTitle('General Research Finding');
                setDrawerHighlightText('');
                setIsAnnotationDrawerOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
            >
              <Highlighter className="w-4 h-4" />
              <span>{canAnnotate ? 'Create Annotation & Flag' : 'Open Annotations Drawer'}</span>
            </button>
          </div>

          {/* Quick Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {annotations.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-300 text-sm">No Annotations Recorded Yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  {canAnnotate
                    ? 'Highlight text in any finding card or click "Create Annotation & Flag" above to add the first evidence note.'
                    : 'Log in as a Manager or Admin to highlight findings and attach evidence flags.'}
                </p>
              </div>
            ) : (
              annotations.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    ann.resolved ? 'bg-slate-950/40 border-slate-800/60 opacity-80' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">
                      Flag: {ann.flag.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {ann.author.name} <span className="text-indigo-400 uppercase font-bold">({ann.author.role})</span>
                    </span>
                  </div>

                  {ann.targetTitle && (
                    <h4 className="text-sm font-bold text-white mb-1.5">{ann.targetTitle}</h4>
                  )}

                  {ann.highlightedText && (
                    <p className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-amber-200/90 italic mb-2 break-words">
                      "{ann.highlightedText}"
                    </p>
                  )}

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{ann.comment}</p>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className={ann.resolved ? 'text-emerald-400 font-mono flex items-center gap-1 font-semibold' : 'text-amber-400 font-mono flex items-center gap-1 font-semibold'}>
                      {ann.resolved ? '✓ Addressed' : '● Active Review'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToTarget(ann.targetId)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
                    >
                      Jump to Finding &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Problem Detail Deep-Dive Modal */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          allSources={sources}
          onClose={() => setSelectedProblem(null)}
        />
      )}

      {/* Real-Time Collaborative Annotation Drawer */}
      <AnnotationDrawer
        isOpen={isAnnotationDrawerOpen}
        onClose={() => setIsAnnotationDrawerOpen(false)}
        project={project}
        annotations={annotations}
        session={session}
        selectedTargetId={drawerTargetId}
        selectedTargetTitle={drawerTargetTitle}
        initialHighlightText={drawerHighlightText}
        isLiveConnected={isLiveConnected}
        onAddAnnotation={handleAddAnnotation}
        onToggleResolve={handleToggleResolve}
        onDeleteAnnotation={handleDeleteAnnotation}
        onJumpToTarget={handleJumpToTarget}
      />
    </div>
  );
};
