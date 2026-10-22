import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Globe,
  Database,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { ResearchConfig, ResearchDepth, SourceType, TimeRangeOption } from '../types/research.ts';
import { COUNTRIES, POPULAR_REGIONS } from '../lib/countries.ts';

import { MultiModalUpload } from './MultiModalUpload.tsx';
import type { ResearchAttachment } from '../types/research.ts';

interface ResearchInputProps {
  onStartResearch: (config: ResearchConfig) => void;
  isLoading: boolean;
}

const SAMPLE_TOPICS = [
  'Growing cybersecurity problems in everyday life in the modern world',
  'Security weaknesses and privacy leakage in consumer smart-home IoT',
  'Generative AI voice cloning and real-time deepfake identity fraud',
  'Data broker surveillance and mobile health application privacy leakage',
  'Supply chain compromises in everyday open-source desktop software',
];

export const ResearchInput: React.FC<ResearchInputProps> = ({ onStartResearch, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('deep');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('last_year');
  const [customTime, setCustomTime] = useState('');
  const [region, setRegion] = useState('GLOBAL');
  const [customCountry, setCustomCountry] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachments, setAttachments] = useState<ResearchAttachment[]>([]);
  const [chatGptApiKey, setChatGptApiKey] = useState('');

  const [selectedSources, setSelectedSources] = useState<SourceType[]>([
    'academic',
    'government',
    'official_advisory',
    'industry_report',
    'reputable_news',
    'web',
    'article',
    'blog',
    'verified_post',
    'official_website',
  ]);

  const toggleSource = (source: SourceType) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onStartResearch({
      topic: topic.trim(),
      depth,
      timeRange,
      customTimeRange: timeRange === 'custom' ? customTime : undefined,
      region,
      customRegion: region === 'CUSTOM' ? customCountry : undefined,
      sourceTypes: selectedSources.length > 0 ? selectedSources : ['academic', 'government', 'web'],
      enablePromptInjectionDefense: true,
      attachments,
      customOpenAIApiKey: chatGptApiKey.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Value Proposition */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-4 shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Evidence-First Research & Innovation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Discover Real Problems. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Forge Evidence-Based Solutions.
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Autonomous multi-stage AI research that discovers real-world vulnerabilities, uncovers why existing solutions fail, and engineers targeted innovation concepts.
        </p>
      </div>

      {/* Main Research Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

        <div className="mb-5">
          <label htmlFor="topic-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            What do you want to research?
          </label>
          <div className="relative">
            <textarea
              id="topic-input"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe a real-world problem, emerging technology, industry challenge, or domain... (e.g. Growing cybersecurity problems in everyday life in the modern world)"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base transition duration-150 resize-none outline-none font-medium"
            />
            {topic.length > 0 && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SAMPLE_TOPICS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(sample)}
                className="text-left text-xs px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-white transition truncate max-w-full"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Research Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 pt-3 border-t border-slate-800/80">
          {/* Depth Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Research Depth</span>
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as ResearchDepth)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:border-indigo-500 outline-none"
            >
              <option value="quick">Quick (Rapid scan, 5-8 sources)</option>
              <option value="standard">Standard (In-depth, 10-15 sources)</option>
              <option value="deep">Deep (Comprehensive failure points)</option>
              <option value="advanced">Advanced (Multi-vector stress test)</option>
            </select>
          </div>

          {/* Time Range Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time Horizon</span>
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRangeOption)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:border-indigo-500 outline-none"
            >
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_year">Last Year (12 Months)</option>
              <option value="last_5_years">Last 5 Years</option>
              <option value="custom">Custom Duration / Dates</option>
            </select>
          </div>

          {/* Region / Country Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Geographic Region</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 focus:border-indigo-500 outline-none"
            >
              <optgroup label="Regional Blocs">
                {POPULAR_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Individual Countries">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Custom Input Fields (if Custom Time or Custom Country selected) */}
        {(timeRange === 'custom' || region === 'CUSTOM') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-slate-950/70 border border-indigo-900/40">
            {timeRange === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specify Custom Time Range / Period:
                </label>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="e.g. 2023 - 2026, Post-Pandemic Era, Q1 2026"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            )}
            {region === 'CUSTOM' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specify Specific Countries or Multi-Country List:
                </label>
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="e.g. United States, Germany, Japan, Singapore"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Advanced Source Customization Toggle */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Select Source Repositories ({selectedSources.length} active)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'academic', label: 'Peer-Reviewed Academic', desc: 'IEEE, ACM, Elsevier, ArXiv' },
                { id: 'government', label: 'Government & Standards', desc: 'NIST, CISA, FTC, ENISA' },
                { id: 'official_advisory', label: 'Security Advisories', desc: 'CVE, US-CERT, Vendor Advisories' },
                { id: 'industry_report', label: 'Industry Reports', desc: 'DBIR, Gartner, IDC benchmarks' },
                { id: 'reputable_news', label: 'Reputable Journalism', desc: 'Investigative technical press' },
                { id: 'social_media', label: 'Social Signals (Unverified)', desc: 'Practitioner real-time alerts' },
                { id: 'web', label: 'Standards & Specifications', desc: 'W3C, IETF RFCs' },
              ].map((src) => {
                const isChecked = selectedSources.includes(src.id as SourceType);
                return (
                  <label
                    key={src.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-left cursor-pointer transition ${
                      isChecked
                        ? 'bg-indigo-950/40 border-indigo-700/60 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSource(src.id as SourceType)}
                      className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold leading-tight">{src.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{src.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button & Security Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Prompt Injection Protected &bull; Zero Hallucination Standard</span>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition duration-150"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Research Pipeline</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
