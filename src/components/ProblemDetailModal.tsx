import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Wrench,
  Cpu,
} from 'lucide-react';
import type { ProblemReport, ResearchSource } from '../types/research.ts';
import { evaluateSourceQuality } from '../lib/sourceQuality.ts';

interface ProblemDetailModalProps {
  problem: ProblemReport;
  allSources: ResearchSource[];
  onClose: () => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({ problem, allSources, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [termLevel, setTermLevel] = useState<'beginner' | 'technical'>('beginner');

  // Filter sources for this problem
  const problemSources = allSources.filter((s) => problem.sourceIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                Deep-Dive Research Report
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                {problem.evidenceLevel} Evidence ({problem.evidenceCount} sources)
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Category: <strong className="text-slate-200">{problem.category}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {problem.shortTitle}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              {problem.oneSentenceSummary}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-8 flex-1">
          {/* Section 01: What is the problem? */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                01
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Problem Overview & Occurrence Mechanism</h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <p className="leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <strong className="text-slate-100 block mb-1">What is the problem?</strong>
                {problem.overview.whatIsIt}
              </p>

              <div>
                <strong className="text-slate-200 text-xs uppercase tracking-wider block mb-1.5">
                  Root Causes Identified:
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  {problem.overview.rootCauses.map((rc, i) => (
                    <li key={i}>{rc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-slate-200 text-xs uppercase tracking-wider block mb-1">
                  Mechanism of Occurrence:
                </strong>
                <p className="leading-relaxed text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                  {problem.overview.mechanismOfOccurrence}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <strong className="text-indigo-300 text-xs uppercase tracking-wider block mb-1">
                  Why It Matters:
                </strong>
                <p className="leading-relaxed text-slate-300">{problem.overview.whyItMatters}</p>
              </div>
            </div>
          </section>

          {/* Section 02: Real-World Impact */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                02
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Real-World Impact & Documented Evidence</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-xs uppercase font-bold text-slate-300 block mb-2">
                  Who is Affected:
                </strong>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {problem.realWorldImpact.whoIsAffected.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">&bull;</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-xs uppercase font-bold text-slate-300 block mb-2">
                  Systems & Infrastructures Affected:
                </strong>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {problem.realWorldImpact.systemsAffected.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">&bull;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Documented Statistics */}
            <div>
              <strong className="text-xs uppercase font-bold text-slate-300 block mb-2">
                Documented Statistical Evidence (Non-Hallucinated):
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {problem.realWorldImpact.keyStatistics.map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs">
                    <div className="font-bold text-indigo-200 mb-1 leading-snug">"{stat.stat}"</div>
                    <div className="text-[11px] text-slate-400">{stat.context}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 03 & 04: Existing Solutions, Limitations, & Critical Failure Points */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                03 & 04
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Existing Solutions, Technical Limitations & Critical Failure Points
              </h3>
            </div>

            <div className="space-y-5">
              {problem.existingSolutions.map((sol, idx) => (
                <div key={sol.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{sol.name}</h4>
                      <span className="text-xs text-indigo-400 font-mono">{sol.type}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                      Used by: {sol.whoUsesIt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>How it works:</strong> {sol.howItWorks}
                  </p>

                  {/* Limitations Breakdown */}
                  <div>
                    <strong className="text-xs uppercase font-bold text-slate-400 block mb-1.5">
                      Documented Limitations:
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {sol.limitations.technical && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <strong className="text-slate-400">Technical: </strong>
                          {sol.limitations.technical}
                        </div>
                      )}
                      {sol.limitations.humanFactor && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <strong className="text-slate-400">Human Factor: </strong>
                          {sol.limitations.humanFactor}
                        </div>
                      )}
                      {sol.limitations.usability && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <strong className="text-slate-400">Usability: </strong>
                          {sol.limitations.usability}
                        </div>
                      )}
                      {sol.limitations.adoptionBarriers && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <strong className="text-slate-400">Adoption Barrier: </strong>
                          {sol.limitations.adoptionBarriers}
                        </div>
                      )}
                      {sol.limitations.cost && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <strong className="text-slate-400">Cost: </strong>
                          {sol.limitations.cost}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Critical Failure Point Banner */}
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs">
                    <div className="flex items-center gap-1.5 font-extrabold text-rose-300 text-xs uppercase tracking-wide mb-1.5">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>CRITICAL FAILURE POINT (The Specific Gap)</span>
                    </div>
                    <div className="text-slate-200 mb-1 leading-relaxed">
                      Current solution works under{' '}
                      <span className="font-semibold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {sol.failurePoint.conditionWorks}
                      </span>
                      , but fails when{' '}
                      <span className="font-semibold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60">
                        {sol.failurePoint.conditionFails}
                      </span>
                      .
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      <strong>Failure Mechanism:</strong> {sol.failurePoint.detailedExplanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 05: Unsolved / Under-served Gaps */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                05
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Genuine Unsolved Research & Innovation Gaps</h3>
            </div>

            <div className="space-y-3">
              {problem.unsolvedGaps.map((gap) => (
                <div key={gap.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-white">{gap.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950 border border-purple-800 text-purple-300">
                      {gap.classification.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed mb-2">{gap.description}</p>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                    <strong className="text-indigo-300">Why this gap persists:</strong> {gap.whyItStillExists}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    <strong>Evidence Basis:</strong> {gap.evidenceBasis}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 06 & 07: Innovation Opportunities & Concepts */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                06 & 07
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Innovation Concepts & Feasibility Analysis
              </h3>
            </div>

            {/* Improvement Opportunities */}
            {problem.improvementOpportunities.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                  Incremental Improvement Opportunities:
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
                  {problem.improvementOpportunities.map((opp, i) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Innovation Concepts */}
            <div className="space-y-4">
              {problem.innovationConcepts.map((concept) => (
                <div
                  key={concept.id}
                  className="p-5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900/80 border border-indigo-700/50 shadow-md space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/60 pb-2">
                    <div>
                      <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>{concept.ideaName}</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Targeting Limitation: <strong className="text-indigo-300">{concept.targetedLimitation}</strong>
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 border border-amber-500/40 text-amber-300">
                      [AI-GENERATED INNOVATION CONCEPT]
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <strong>Core Concept:</strong> {concept.coreConcept}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <strong>Mechanism of Action:</strong> {concept.mechanismOfAction}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-slate-300 block mb-1">Required Technologies:</strong>
                      <div className="flex flex-wrap gap-1">
                        {concept.requiredTechnologies.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <strong className="text-slate-300 block mb-1">Differentiators vs Existing Approaches:</strong>
                      <span className="text-slate-300 text-[11px] leading-relaxed">
                        {concept.feasibilityCheck.differentiators}
                      </span>
                    </div>
                  </div>

                  {/* Feasibility & Validation */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Technically Plausible: {concept.feasibilityCheck.plausibilityRationale}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Experimental Validation Requirements:</strong>
                      <ul className="list-disc pl-4 mt-0.5 text-slate-300">
                        {concept.experimentalValidationNeeds.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 08: Technical Terminology */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  08
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">Technical Terminology Explainer</h3>
              </div>

              {/* Beginner vs Technical Toggle */}
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTermLevel('beginner')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    termLevel === 'beginner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Beginner
                </button>
                <button
                  type="button"
                  onClick={() => setTermLevel('technical')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    termLevel === 'technical' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Technical
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problem.technicalTerms.map((term, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-white text-sm flex items-center justify-between">
                    <span>{term.term}</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-mono">
                      {termLevel === 'beginner' ? 'Plain English' : 'Engineering Spec'}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {termLevel === 'beginner' ? term.beginnerDefinition : term.technicalDefinition}
                  </p>

                  <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-850">
                    <strong className="text-slate-300">Real-World Example:</strong> {term.realWorldExample}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 09: Traceable Sources */}
          <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                09
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Traceable Sources & Supporting Citations</h3>
            </div>

            <div className="space-y-3">
              {problemSources.map((src) => {
                const evalQuality = evaluateSourceQuality(src);
                return (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${evalQuality.badgeColor}`}>
                          {src.sourceType.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {src.publisher} &bull; {src.publishDate}
                        </span>
                      </div>
                      <h4 className="font-bold text-white leading-snug">{src.title}</h4>
                      {src.excerpt && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          "{src.excerpt}"
                        </p>
                      )}
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition shrink-0 self-start sm:self-auto"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Close Deep-Dive Report
          </button>
        </div>
      </div>
    </div>
  );
};
