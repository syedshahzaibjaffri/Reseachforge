import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Eye,
  Flame,
  Compass,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Radio,
  Quote,
  Lock,
} from 'lucide-react';
import type { FindingAnnotation, EvidenceFlag, UserSession, UserRole, ResearchProject } from '../types/research.ts';
import { EVIDENCE_FLAG_METAS, canUserAnnotate, filterAnnotations } from '../lib/annotationUtils.ts';

interface AnnotationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ResearchProject;
  annotations: FindingAnnotation[];
  session: UserSession | null;
  selectedTargetId?: string;
  selectedTargetTitle?: string;
  initialHighlightText?: string;
  isLiveConnected: boolean;
  onAddAnnotation: (data: {
    targetType: string;
    targetId: string;
    targetTitle?: string;
    highlightedText?: string;
    comment: string;
    flag: EvidenceFlag;
  }) => Promise<boolean>;
  onToggleResolve: (annotationId: string, currentResolved: boolean) => Promise<boolean>;
  onDeleteAnnotation: (annotationId: string) => Promise<boolean>;
  onJumpToTarget?: (targetId: string) => void;
}

export const AnnotationDrawer: React.FC<AnnotationDrawerProps> = ({
  isOpen,
  onClose,
  project,
  annotations,
  session,
  selectedTargetId,
  selectedTargetTitle,
  initialHighlightText,
  isLiveConnected,
  onAddAnnotation,
  onToggleResolve,
  onDeleteAnnotation,
  onJumpToTarget,
}) => {
  const canAnnotate = canUserAnnotate(session?.role);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTargetId, setFormTargetId] = useState(selectedTargetId || '');
  const [formTargetTitle, setFormTargetTitle] = useState(selectedTargetTitle || '');
  const [formHighlight, setFormHighlight] = useState(initialHighlightText || '');
  const [formComment, setFormComment] = useState('');
  const [formFlag, setFormFlag] = useState<EvidenceFlag>('verified');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter & Search State
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<EvidenceFlag | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state when props change
  React.useEffect(() => {
    if (selectedTargetId) {
      setFormTargetId(selectedTargetId);
      setFormTargetTitle(selectedTargetTitle || '');
      setShowAddForm(true);
    }
    if (initialHighlightText) {
      setFormHighlight(initialHighlightText);
      setShowAddForm(true);
    }
  }, [selectedTargetId, selectedTargetTitle, initialHighlightText]);

  // Build target options from research project
  const targetOptions = useMemo(() => {
    const list: Array<{ id: string; title: string; type: string }> = [];

    // Problems
    project.problems.forEach((p) => {
      list.push({ id: p.id, title: `Problem: ${p.shortTitle}`, type: 'finding' });
      p.existingSolutions.forEach((sol) => {
        list.push({ id: sol.id, title: `Solution: ${sol.name}`, type: 'solution' });
      });
      p.unsolvedGaps.forEach((gap) => {
        list.push({ id: gap.id, title: `Research Gap: ${gap.title}`, type: 'gap' });
      });
    });

    // Article Highlights
    (project.articleHighlights || []).forEach((art) => {
      list.push({ id: art.id, title: `Article: ${art.sourceTitle}`, type: 'highlight' });
    });

    // Claims
    (project.claims || []).forEach((c) => {
      list.push({ id: c.id, title: `Claim: ${c.claim.substring(0, 50)}...`, type: 'claim' });
    });

    // Innovation Concepts
    (project.allInnovationConcepts || []).forEach((inno) => {
      list.push({ id: inno.id, title: `Concept: ${inno.ideaName}`, type: 'concept' });
    });

    return list;
  }, [project]);

  // Filtered annotations
  const filteredList = useMemo(() => {
    return filterAnnotations(annotations, {
      flag: selectedFlagFilter,
      status: statusFilter,
      query: searchQuery,
    });
  }, [annotations, selectedFlagFilter, statusFilter, searchQuery]);

  // Counts for flags
  const flagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: annotations.length };
    annotations.forEach((a) => {
      counts[a.flag] = (counts[a.flag] || 0) + 1;
    });
    return counts;
  }, [annotations]);

  const activeCount = useMemo(() => annotations.filter((a) => !a.resolved).length, [annotations]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAnnotate) return;
    if (!formComment.trim()) {
      setSubmitError('Please enter a shared comment or observation.');
      return;
    }
    const finalTargetId = formTargetId || targetOptions[0]?.id || 'general-report';
    const foundTarget = targetOptions.find((t) => t.id === finalTargetId);
    const finalTargetTitle = formTargetTitle || foundTarget?.title || 'Research Finding';
    const finalTargetType = foundTarget?.type || 'finding';

    setIsSubmitting(true);
    setSubmitError(null);

    const success = await onAddAnnotation({
      targetType: finalTargetType,
      targetId: finalTargetId,
      targetTitle: finalTargetTitle,
      highlightedText: formHighlight.trim() || undefined,
      comment: formComment.trim(),
      flag: formFlag,
    });

    setIsSubmitting(false);
    if (success) {
      setFormComment('');
      setFormHighlight('');
      setShowAddForm(false);
    } else {
      setSubmitError('Failed to post annotation. Please verify Manager or Admin authorization.');
    }
  };

  const getFlagIcon = (flag: EvidenceFlag) => {
    switch (flag) {
      case 'verified':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'conflicting':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'needs_review':
        return <Eye className="w-3.5 h-3.5 text-blue-400" />;
      case 'critical_insight':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'methodology_gap':
        return <Compass className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Evidence Annotations & Flags
                </h2>
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    isLiveConnected
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                      : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                  }`}
                  title={isLiveConnected ? 'SSE Live Stream Active' : 'Polling Sync Active'}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isLiveConnected ? 'Live Sync' : 'Connecting'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time review, evidence flagging & findings verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close annotations drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role & Permission Banner */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reviewer Session:</span>
            {session ? (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                {session.name}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
                    session.role === 'Owner'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : session.role === 'Admin'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : session.role === 'Manager'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {session.role}
                </span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Guest (Observer)</span>
            )}
          </div>

          <div>
            {canAnnotate ? (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Annotation Rights Active
              </span>
            ) : (
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> Read-Only Mode (Mgr/Admin Req.)
              </span>
            )}
          </div>
        </div>

        {/* Filter and Action Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 space-y-3">
          {/* Top Row: Search & Add Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, quotes, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-slate-200 placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {canAnnotate && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel Note' : 'Add Note & Flag'}</span>
              </button>
            )}
          </div>

          {/* Evidence Flag Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFlagFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                selectedFlagFilter === 'all'
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              All ({flagCounts['all'] || 0})
            </button>
            {(Object.keys(EVIDENCE_FLAG_METAS) as EvidenceFlag[]).map((f) => {
              const meta = EVIDENCE_FLAG_METAS[f];
              const count = flagCounts[f] || 0;
              const isActive = selectedFlagFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFlagFilter(f)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                    isActive
                      ? `${meta.badgeClass} ring-1 ring-indigo-400`
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {getFlagIcon(f)}
                  <span>{meta.label.replace(' Evidence', '').replace(' Manager', '')}</span>
                  <span className="opacity-75 font-bold">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              {(['all', 'active', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`capitalize px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    statusFilter === st ? 'text-indigo-300 font-bold underline' : 'hover:text-slate-200'
                  }`}
                >
                  {st} {st === 'active' && `(${activeCount})`}
                </button>
              ))}
            </div>
            <span>{filteredList.length} shown</span>
          </div>
        </div>

        {/* Form Container (When Open & Authorized) */}
        {showAddForm && canAnnotate && (
          <form
            onSubmit={handleFormSubmit}
            className="p-4 bg-slate-950/90 border-b border-indigo-900/40 space-y-3 animate-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> New Annotation / Evidence Flag
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close Form
              </button>
            </div>

            {submitError && (
              <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            {/* Target finding dropdown */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Research Finding / Item:
              </label>
              <select
                value={formTargetId}
                onChange={(e) => {
                  setFormTargetId(e.target.value);
                  const found = targetOptions.find((t) => t.id === e.target.value);
                  setFormTargetTitle(found?.title || '');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {targetOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Highlighted text quote */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Highlighted Excerpt (Optional):</span>
                {formHighlight && (
                  <button
                    type="button"
                    onClick={() => setFormHighlight('')}
                    className="text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    Clear Quote
                  </button>
                )}
              </label>
              <textarea
                rows={2}
                placeholder="Paste or select finding text to highlight..."
                value={formHighlight}
                onChange={(e) => setFormHighlight(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 font-mono text-amber-200/90 placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Evidence Flag Selection */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Assign Evidence Flag:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(Object.keys(EVIDENCE_FLAG_METAS) as EvidenceFlag[]).map((f) => {
                  const meta = EVIDENCE_FLAG_METAS[f];
                  const isSelected = formFlag === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormFlag(f)}
                      className={`flex flex-col text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? `${meta.badgeClass} ring-2 ring-indigo-400 font-bold`
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {getFlagIcon(f)}
                        <span className="text-[11px]">{meta.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shared Comment Field */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Shared Comment & Evidence Analysis:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Enter verified citations, conflicting findings, or methodological evaluation..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formComment.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Posting Annotation...' : 'Publish Shared Annotation'}
              </button>
            </div>
          </form>
        )}

        {/* Read-Only Notice for Guest/Researcher */}
        {!canAnnotate && (
          <div className="mx-4 my-3 p-3 rounded-xl bg-slate-950/70 border border-amber-900/40 flex items-start gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Manager & Admin Verification Active:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Highlighting and adding shared evidence flags is reserved for Manager, Admin, and Owner roles. You can view all real-time team annotations below.
              </p>
            </div>
          </div>
        )}

        {/* Annotations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {filteredList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Annotations Found</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                {searchQuery || selectedFlagFilter !== 'all' || statusFilter !== 'all'
                  ? 'No annotations match the current filters. Clear filters to see all notes.'
                  : canAnnotate
                  ? 'Be the first Manager or Admin to highlight a finding and attach an evidence flag.'
                  : 'No shared annotations have been created for this research report yet.'}
              </p>
              {canAnnotate && !showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Add First Annotation
                </button>
              )}
            </div>
          ) : (
            filteredList.map((ann) => {
              const meta = EVIDENCE_FLAG_METAS[ann.flag] || EVIDENCE_FLAG_METAS.needs_review;
              const formattedDate = new Date(ann.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ann.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ann.resolved
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Top Row: Flag Badge + Target Reference + Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta.badgeClass}`}
                      >
                        {getFlagIcon(ann.flag)}
                        <span>{meta.label}</span>
                      </span>

                      {ann.resolved ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Manager / Admin Resolution Controls */}
                    {canAnnotate && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleResolve(ann.id, ann.resolved)}
                          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                            ann.resolved
                              ? 'text-amber-400 hover:bg-amber-950/40'
                              : 'text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                          title={ann.resolved ? 'Reopen annotation' : 'Mark as resolved'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAnnotation(ann.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 text-xs transition-colors cursor-pointer"
                          title="Delete annotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Target Finding Title & Jump Link */}
                  {ann.targetTitle && (
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                      <span className="truncate pr-2">{ann.targetTitle}</span>
                      {onJumpToTarget && (
                        <button
                          type="button"
                          onClick={() => onJumpToTarget(ann.targetId)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 shrink-0 cursor-pointer"
                        >
                          <span>Jump to Finding</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Quoted Excerpt */}
                  {ann.highlightedText && (
                    <div className="my-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-amber-200/90 flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-amber-400/60 shrink-0 mt-0.5" />
                      <span className="italic leading-relaxed break-words">
                        "{ann.highlightedText}"
                      </span>
                    </div>
                  )}

                  {/* Comment Body */}
                  <div className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                    {ann.comment}
                  </div>

                  {/* Footer Attribution */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">{ann.author.name}</span>
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold border ${
                          ann.author.role === 'Owner'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : ann.author.role === 'Admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : ann.author.role === 'Manager'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ann.author.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Resolved Audit Byline */}
                  {ann.resolved && ann.resolvedBy && (
                    <div className="mt-2 text-[10px] font-mono text-emerald-400/80 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-900/30">
                      Addressed by {ann.resolvedBy.username} ({ann.resolvedBy.role})
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
