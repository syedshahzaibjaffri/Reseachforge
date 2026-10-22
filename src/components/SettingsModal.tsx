import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Cpu,
  KeyRound,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  FolderArchive,
} from 'lucide-react';
import type { ApiKeysConfig } from '../types/research.ts';

interface SettingsModalProps {
  onClose: () => void;
  onDownloadAppArchive?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onDownloadAppArchive }) => {
  const [activeTab, setActiveTab] = useState<'api_keys' | 'architecture' | 'export_code'>('api_keys');

  // Multi-API Keys state
  const [geminiKey, setGeminiKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [modelMode, setModelMode] = useState<ApiKeysConfig['selectedModelMode']>('auto');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('researchforge_api_keys');
      if (saved) {
        const parsed = JSON.parse(saved);
        setGeminiKey(parsed.geminiApiKey || '');
        setOpenAiKey(parsed.openAiApiKey || '');
        setClaudeKey(parsed.claudeApiKey || '');
        setPerplexityKey(parsed.perplexityApiKey || '');
        setModelMode(parsed.selectedModelMode || 'auto');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveKeys = () => {
    const config: ApiKeysConfig = {
      geminiApiKey: geminiKey.trim(),
      openAiApiKey: openAiKey.trim(),
      claudeApiKey: claudeKey.trim(),
      perplexityApiKey: perplexityKey.trim(),
      selectedModelMode: modelMode,
    };
    localStorage.setItem('researchforge_api_keys', JSON.stringify(config));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleShow = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadAppZip = () => {
    if (onDownloadAppArchive) {
      onDownloadAppArchive();
    } else {
      window.location.href = '/api/export-app-archive';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Platform Settings & Orchestration</h2>
              <p className="text-xs text-slate-400">Manage Multi-Model API Keys, Autonomous Routing & App Files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-4">
          <button
            onClick={() => setActiveTab('api_keys')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'api_keys'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Multi-API Keys & Model Router</span>
          </button>

          <button
            onClick={() => setActiveTab('export_code')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'export_code'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>App Source Package (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrity & Security</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-300 text-xs sm:text-sm">
          {activeTab === 'api_keys' && (
            <div className="space-y-5">
              {/* Smart Router Explanation */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Autonomous Multi-Model Intelligent Routing</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Provide one or more API keys below. In <strong>Auto-Select Mode</strong>, ResearchForge autonomously
                  routes fast web crawling to Gemini 2.5 Flash, complex synthesis to OpenAI GPT-4o, and rigorous contradiction
                  detection to Claude 3.5 Sonnet.
                </p>
              </div>

              {/* Model Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">Execution & Routing Strategy</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModelMode('auto')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      modelMode === 'auto'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 mt-0.5 ${modelMode === 'auto' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Autonomous Smart Router (Recommended)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Dynamically dispatches tasks to best available model</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelMode('gemini-flash')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      modelMode === 'gemini-flash'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 mt-0.5 ${modelMode === 'gemini-flash' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Force Gemini 2.5 Flash</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Ultra-fast search, groundings & multimodal scraping</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelMode('gpt-4o')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      modelMode === 'gpt-4o'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 mt-0.5 ${modelMode === 'gpt-4o' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Force OpenAI GPT-4o</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Deep strategic problem diagnosis & solution synthesis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelMode('claude-3-5-sonnet')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      modelMode === 'claude-3-5-sonnet'
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 mt-0.5 ${modelMode === 'claude-3-5-sonnet' ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Force Claude 3.5 Sonnet</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Rigorous fact verification & scientific peer audit</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* API Key Inputs */}
              <div className="space-y-4 pt-2">
                {/* Gemini API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Google Gemini API Key
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Used for WWW search grounding & vision</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['gemini'] ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy... (leave blank to use server environment default)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white font-mono placeholder:text-slate-600 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('gemini')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI ChatGPT API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      OpenAI ChatGPT (GPT-4o) API Key
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Used for problem solving & strategies</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['openai'] ? 'text' : 'password'}
                      value={openAiKey}
                      onChange={e => setOpenAiKey(e.target.value)}
                      placeholder="sk-proj-... (optional, user provided)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white font-mono placeholder:text-slate-600 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('openai')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Anthropic Claude Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Anthropic Claude API Key
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Used for contradiction detection</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['claude'] ? 'text' : 'password'}
                      value={claudeKey}
                      onChange={e => setClaudeKey(e.target.value)}
                      placeholder="sk-ant-... (optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white font-mono placeholder:text-slate-600 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('claude')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKeys['claude'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Perplexity Search Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Perplexity / SerpWeb Search Key
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Supplemental web citations</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['perplexity'] ? 'text' : 'password'}
                      value={perplexityKey}
                      onChange={e => setPerplexityKey(e.target.value)}
                      placeholder="pplx-... (optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white font-mono placeholder:text-slate-600 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow('perplexity')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKeys['perplexity'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Saved into secure local storage
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleSaveKeys}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Save API Keys & Routing
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export_code' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Complete Application Archive (.zip)</h3>
                    <p className="text-xs text-slate-400">Download the full repository codebase and assets</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  As requested, you can download the entire application source code bundle directly as a standard ZIP file.
                  The package includes the full React 19 frontend, Vite configuration, Express backend server, research orchestrator,
                  RBAC authentication system, export engine, unit tests, and Tailwind CSS styling.
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-indigo-400 font-bold">How to run locally:</div>
                  <div className="text-slate-400">1. Unzip the downloaded file</div>
                  <div className="text-slate-400">2. Run <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">npm install</code></div>
                  <div className="text-slate-400">3. Create <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">.env</code> with your <code className="text-cyan-300">GEMINI_API_KEY</code></div>
                  <div className="text-slate-400">4. Run <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">npm run dev</code> to start server on port 3000</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadAppZip}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download App Source Bundle (.zip)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Strict Cross-WWW Verification Policy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The engine automatically cross-references empirical details across multiple verified articles, research publications, and official advisories. If a detail appears only in a single unverified source, it is flagged as contested.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>Prompt-Injection Defense Active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All external web content is quarantined inside sandboxed envelopes. Adversarial instructions in web documents cannot alter system directives or compromise research integrity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleDownloadAppZip}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Get App Source Code (.zip)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
