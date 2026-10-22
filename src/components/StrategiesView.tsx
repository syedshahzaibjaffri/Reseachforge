import React, { useState } from 'react';
import { Target, Zap, Wrench, Shield, CheckCircle2, ChevronRight, Users, Clock, AlertTriangle } from 'lucide-react';
import type { ProblemSolvingStrategy, ProblemReport } from '../types/research.ts';

interface StrategiesViewProps {
  strategies: ProblemSolvingStrategy[];
  problems: ProblemReport[];
}

export const StrategiesView: React.FC<StrategiesViewProps> = ({ strategies, problems }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    strategies[0]?.problemId || problems[0]?.id || ''
  );

  const activeStrategy =
    strategies.find((s) => s.problemId === selectedProblemId) || strategies[0];
  const activeProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 border border-emerald-800/60 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Actionable Problem-Solving Roadmap</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          Multi-Horizon Problem Solving Strategies
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Detailed readout of identified real-world vulnerabilities paired with pragmatic, multi-phase solving strategies across immediate operational triage (0-30 days), mid-term engineering overhauls (1-6 months), and long-term architectural innovations (6-24+ months).
        </p>
      </div>

      {/* Problem Selector Pills */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin">
        {problems.map((prob) => {
          const isSelected = prob.id === selectedProblemId;
          return (
            <button
              key={prob.id}
              onClick={() => setSelectedProblemId(prob.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
              <span className="truncate max-w-[220px]">{prob.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Active Problem Readout & Strategies Matrix */}
      {activeStrategy && activeProblem && (
        <div className="space-y-6">
          {/* Problem Summary Context Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 block mb-1">
              Problem Readout:
            </span>
            <h3 className="text-lg font-bold text-white mb-1.5">{activeProblem.shortTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeProblem.oneSentenceSummary}
            </p>
          </div>

          {/* 3 Horizon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Horizon 1: Immediate Mitigations */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-900/50 shadow-md space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Immediate Mitigations</h4>
                  <span className="text-[10px] font-mono text-amber-300">Phase 1 &bull; 0 to 30 Days</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Rapid defensive adjustments, configuration hardening, and immediate operational triage.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                {activeStrategy.immediateMitigations.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horizon 2: Mid-Term Engineering */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-900/50 shadow-md space-y-3">
              <div className="flex items-center gap-2 border-b border-blue-900/40 pb-2.5">
                <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Engineering Overhauls</h4>
                  <span className="text-[10px] font-mono text-blue-300">Phase 2 &bull; 1 to 6 Months</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Protocol upgrades, software refactoring, regression testing, and sandboxing architecture.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                {activeStrategy.midTermEngineering.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-blue-400 font-bold">&bull;</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horizon 3: Long-Term Architectural Innovations */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-900/50 shadow-md space-y-3">
              <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Architectural Innovations</h4>
                  <span className="text-[10px] font-mono text-emerald-300">Phase 3 &bull; 6 to 24+ Months</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Novel cryptographic standards, hardware-level attestation, and institutional ecosystem changes.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                {activeStrategy.longTermArchitectural.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stakeholder Action Plan Table */}
          {activeStrategy.stakeholderActionPlan && activeStrategy.stakeholderActionPlan.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Multi-Stakeholder Execution Plan</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Target Stakeholder</th>
                      <th className="p-3">Priority Action Required</th>
                      <th className="p-3">Priority Level</th>
                      <th className="p-3">Expected Empirical Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {activeStrategy.stakeholderActionPlan.map((plan, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40 transition">
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          {plan.stakeholder}
                        </td>
                        <td className="p-3 text-slate-200">{plan.action}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              plan.priority === 'Critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : plan.priority === 'High'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {plan.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 text-[11px]">{plan.expectedImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
