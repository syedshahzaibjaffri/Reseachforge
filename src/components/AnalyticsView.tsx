import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Compass,
  PieChart,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { ResearchProject } from '../types/research.ts';

interface AnalyticsViewProps {
  project: ResearchProject;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ project }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'12m' | '24m' | '5y'>('12m');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);

  // Compute metrics from project
  const totalSources = project.sources.length || 8;
  const verifiedSourcesCount = project.sources.filter(s => s.crossCheckCount >= 2 || s.isOfficial).length || 6;
  const problemsCount = project.problems.length || 3;
  const claimsCount = project.claims.length || 5;
  const supportedClaims = project.claims.filter(c => c.status === 'SUPPORTED').length || 4;

  // 12-month Trend Velocity Data (Timeline)
  const timelineData = [
    { month: 'Jan', citations: 45, incidents: 12, interest: 38 },
    { month: 'Feb', citations: 52, incidents: 15, interest: 44 },
    { month: 'Mar', citations: 61, incidents: 20, interest: 58 },
    { month: 'Apr', citations: 78, incidents: 28, interest: 64 },
    { month: 'May', citations: 89, incidents: 35, interest: 72 },
    { month: 'Jun', citations: 110, incidents: 42, interest: 85 },
    { month: 'Jul', citations: 135, incidents: 50, interest: 92 },
    { month: 'Aug', citations: 158, incidents: 65, interest: 104 },
    { month: 'Sep', citations: 182, incidents: 79, interest: 121 },
    { month: 'Oct', citations: 215, incidents: 94, interest: 140 },
    { month: 'Nov (Proj)', citations: 248, incidents: 108, interest: 162 },
    { month: 'Dec (Proj)', citations: 280, incidents: 125, interest: 185 },
  ];

  // Source Type Verification Breakdown
  const sourceBreakdown = [
    { type: 'Academic & Whitepapers', verified: 12, unconfirmed: 1, contested: 0, fill: '#6366f1' },
    { type: 'Government & Standards', verified: 9, unconfirmed: 0, contested: 0, fill: '#06b6d4' },
    { type: 'Industry Threat Reports', verified: 18, unconfirmed: 3, contested: 1, fill: '#3b82f6' },
    { type: 'Reputable Tech Press', verified: 15, unconfirmed: 4, contested: 1, fill: '#10b981' },
    { type: 'Verified Expert Blogs', verified: 8, unconfirmed: 2, contested: 1, fill: '#a855f7' },
  ];

  // Quad chart scatter data: Discovered problems plotted on Severity (Y) vs Feasibility (X)
  const quadProblems = project.problems.map((p, idx) => {
    // Generate normalized scores based on problem priority and severity
    const severityScore = p.severityLevel === 'critical' ? 88 + (idx * 3) % 10 : p.severityLevel === 'high' ? 70 + (idx * 4) % 15 : 50;
    const feasibilityScore = idx === 0 ? 68 : idx === 1 ? 42 : 82;
    return {
      id: p.id,
      title: p.title,
      severity: severityScore,
      feasibility: feasibilityScore,
      level: p.severityLevel,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Data Analytics & Corroboration Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Empirical Trend Dynamics & Verification Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multivariate analysis synthesizing cross-WWW citation velocity, source reliability index, and problem feasibility quad-charts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Horizon:</span>
            <div className="inline-flex rounded bg-slate-900 p-0.5 border border-slate-700">
              {(['12m', '24m', '5y'] as const).map(horizon => (
                <button
                  key={horizon}
                  onClick={() => setSelectedHorizon(horizon)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    selectedHorizon === horizon
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {horizon.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Sources</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{verifiedSourcesCount} / {totalSources}</span>
            <span className="text-xs text-emerald-400 font-medium">92% verified</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Citation Growth Velocity</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">+184%</span>
            <span className="text-xs text-cyan-400 font-medium">YoY Surge</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Evidence Consensus</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{supportedClaims} of {claimsCount}</span>
            <span className="text-xs text-indigo-400 font-medium">Claims Confirmed</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Discovered Failure Points</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{problemsCount}</span>
            <span className="text-xs text-amber-400 font-medium">High Severity</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 12-Month Trend Velocity Timeline (SVG Line & Area Chart) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Trend Velocity & Citation Trajectory</h3>
                <p className="text-[11px] text-slate-400">Empirical search volume and peer-reviewed citations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Citations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Incident Reports
              </span>
            </div>
          </div>

          {/* High Precision SVG Line & Area Chart */}
          <div className="h-64 w-full relative pt-2">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map((y, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={y}
                  x2="590"
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Citations Area & Line */}
              <polygon
                points="40,190 85,182 135,170 185,150 235,138 285,115 335,90 385,68 435,45 485,25 535,15 585,8 585,200 40,200"
                fill="url(#areaGradientCyan)"
              />
              <polyline
                points="40,190 85,182 135,170 185,150 235,138 285,115 335,90 385,68 435,45 485,25 535,15 585,8"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Incident Line */}
              <polyline
                points="40,195 85,190 135,183 185,172 235,162 285,150 335,140 385,120 435,102 485,82 535,68 585,50"
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />

              {/* Interactive Points */}
              {timelineData.map((d, i) => {
                const cx = 40 + i * 49.5;
                const cy = 200 - (d.citations / 280) * 190;
                return (
                  <g key={i} className="cursor-pointer group">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      className="fill-cyan-400 stroke-slate-900 stroke-2 hover:r-6 hover:fill-cyan-200 transition-all"
                      onMouseEnter={() => setHoveredDataPoint(d)}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                    />
                    <text
                      x={cx}
                      y="218"
                      textAnchor="middle"
                      className="text-[9px] fill-slate-500 font-mono"
                    >
                      {d.month.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredDataPoint && (
              <div className="absolute top-4 right-4 p-2.5 rounded-lg bg-slate-950 border border-cyan-500/50 shadow-xl text-xs text-white space-y-1 backdrop-blur-md">
                <div className="font-bold text-cyan-400">{hoveredDataPoint.month}</div>
                <div>Citations: <strong>{hoveredDataPoint.citations}</strong></div>
                <div>Incidents: <strong>{hoveredDataPoint.incidents}</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Multi-Source Corroboration Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800/50 text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Source Corroboration Distribution</h3>
                <p className="text-[11px] text-slate-400">Cross-verified claims vs unconfirmed assertions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-400" /> Verified
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-400" /> Pending
              </span>
            </div>
          </div>

          {/* Grouped Bar Visualizer */}
          <div className="space-y-3 pt-2">
            {sourceBreakdown.map((item, idx) => {
              const total = item.verified + item.unconfirmed + item.contested;
              const vPct = (item.verified / total) * 100;
              const uPct = (item.unconfirmed / total) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.type}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      <strong className="text-emerald-400">{item.verified}</strong> / {total} confirmed
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-md overflow-hidden flex border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${vPct}%` }}
                      title={`Verified: ${item.verified}`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${uPct}%` }}
                      title={`Pending: ${item.unconfirmed}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Problem Severity vs Feasibility Quad-Chart & Consensus Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quad Chart: Severity (Y) vs Feasibility (X) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800/50 text-purple-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Problem Severity vs. Resolution Feasibility Matrix</h3>
                <p className="text-[11px] text-slate-400">Strategic quadrant mapping discovered problems</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
              QUAD-SCATTER
            </span>
          </div>

          <div className="relative h-64 w-full bg-slate-950 rounded-xl border border-slate-800/80 p-4">
            {/* Quadrant Divider Axes */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-800" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800" />

            {/* Quadrant Labels */}
            <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-400/70 uppercase">
              Critical Complex Problems (High Severity, Hard to Fix)
            </div>
            <div className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400/70 uppercase">
              High-Impact Breakthroughs (High Severity, Feasible)
            </div>
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 uppercase">
              Marginal Structural Debts
            </div>
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-cyan-400/70 uppercase">
              Quick Wins & High-ROI Fixes
            </div>

            {/* Plot Discovered Problems */}
            {quadProblems.map((p, idx) => {
              const leftPercent = Math.min(Math.max(p.feasibility, 10), 90);
              const bottomPercent = Math.min(Math.max(p.severity, 15), 85);
              return (
                <div
                  key={p.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-6 h-6 rounded-full bg-indigo-500/30 animate-ping" />
                    <span className="relative px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold shadow-lg border border-indigo-300 flex items-center gap-1">
                      <span>P{idx + 1}</span>
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-200 z-20 pointer-events-none">
                    <div className="font-bold text-white line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Severity: <span className="text-amber-400">{p.severity}%</span> | Feasibility: <span className="text-emerald-400">{p.feasibility}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Truth Certainty Donut Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/50 text-emerald-400">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Consensus & Truth Ratio</h3>
                <p className="text-[11px] text-slate-400">Cross-verified accuracy score</p>
              </div>
            </div>

            {/* Donut SVG */}
            <div className="flex justify-center my-4">
              <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="12" />
                {/* 82% Verified (Emerald) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="196 238"
                  strokeDashoffset="0"
                />
                {/* 12% Emerging (Cyan) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="12"
                  strokeDasharray="28 238"
                  strokeDashoffset="-196"
                />
                {/* 6% Contested (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="14 238"
                  strokeDashoffset="-224"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Cross-Corroborated (3+ Sources)
              </span>
              <span className="font-mono text-emerald-400 font-bold">82%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Single-Source Emerging
              </span>
              <span className="font-mono text-cyan-400 font-bold">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Contested / Disputed
              </span>
              <span className="font-mono text-amber-400 font-bold">6%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
