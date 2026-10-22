import React, { useState } from 'react';
import {
  Film,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ImageIcon,
  Download,
  Copy,
  Check,
  Volume2,
  Maximize2,
  Sparkles,
  Layers,
  FileCode,
} from 'lucide-react';
import type { GeneratedVisual, GeneratedVideoSimulation, VideoScene } from '../types/research.ts';
import { downloadFile } from '../lib/exportUtils.ts';

interface VisualsStudioProps {
  visuals: GeneratedVisual[];
  videoSimulation?: GeneratedVideoSimulation;
}

export const VisualsStudio: React.FC<VisualsStudioProps> = ({ visuals, videoSimulation }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'visuals'>('video');
  const [selectedVisual, setSelectedVisual] = useState<GeneratedVisual>(visuals[0]);

  // Video player state
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const scenes = videoSimulation?.scenes || [];
  const currentScene: VideoScene | undefined = scenes[currentSceneIdx];

  // Auto-advance scenes when playing
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSceneIdx((prev) => {
        if (prev >= scenes.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  const handleCopyScript = () => {
    if (!videoSimulation) return;
    const fullScript = videoSimulation.scenes
      .map((s) => `[${s.timestamp}] Scene ${s.sceneNumber}: ${s.title}\n${s.narrationScript}\nTakeaway: ${s.keyTakeaway}\n`)
      .join('\n');
    navigator.clipboard.writeText(fullScript).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    });
  };

  const handleDownloadSvg = () => {
    if (!selectedVisual) return;
    downloadFile(selectedVisual.svgContent, `${selectedVisual.id}.svg`, 'image/svg+xml');
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-800/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Multi-Modal Synthesis Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Visuals & Video Simulation Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Evidence-grounded architectural schematics, threat flowcharts, and multi-scene executive video presentation simulations.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeMediaTab === 'video'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video Presentation</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('visuals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeMediaTab === 'visuals'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Visual Schematics ({visuals.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Generation & Simulation Tab */}
      {activeMediaTab === 'video' && videoSimulation && currentScene && (
        <div className="space-y-6">
          {/* Main Simulated 16:9 4K Video Player Display */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl aspect-video max-h-[520px] flex flex-col justify-between p-6 sm:p-8">
            {/* Ambient Background Simulation Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-purple-950/20 to-cyan-950/30 opacity-70" />

            {/* Top Video Overlay Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-700">
                  SCENE {currentScene.sceneNumber} OF {scenes.length}
                </span>
                <span className="text-xs text-slate-300 font-mono font-semibold">
                  [{currentScene.timestamp}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/80 text-red-300 border border-red-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>SIMULATED 4K PREVIEW</span>
                </span>
              </div>
            </div>

            {/* Center Visual Content & Data Overlay */}
            <div className="relative z-10 my-auto text-center max-w-3xl mx-auto space-y-4">
              <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {currentScene.title}
              </h3>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg text-left space-y-3">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <strong className="text-indigo-300">Narrator Script Voiceover:</strong>
                </div>
                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic">
                  "{currentScene.narrationScript}"
                </p>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span>Key Takeaway:</span>
                    <span className="text-slate-200">{currentScene.keyTakeaway}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-950/80 text-cyan-300 text-xs font-mono font-bold border border-indigo-800 self-start sm:self-auto">
                    {currentScene.highlightedData}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Video Controls Bar */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Playback Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentSceneIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentSceneIdx === 0}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
                  title="Previous Scene"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-2 font-bold text-xs"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause Simulation' : 'Play Presentation'}</span>
                </button>

                <button
                  onClick={() => setCurrentSceneIdx((prev) => Math.min(scenes.length - 1, prev + 1))}
                  disabled={currentSceneIdx === scenes.length - 1}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition"
                  title="Next Scene"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Scene Timeline Scrub Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                {scenes.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSceneIdx(idx);
                      setIsPlaying(false);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSceneIdx
                        ? 'w-10 bg-gradient-to-r from-purple-500 to-cyan-400'
                        : 'w-4 bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Scene ${s.sceneNumber}: ${s.title}`}
                  />
                ))}
              </div>

              {/* Export Script */}
              <button
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Script Copied' : 'Copy Narrator Script'}</span>
              </button>
            </div>
          </div>

          {/* Scene Breakdown Cards */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span>Complete Video Scene Storyboard ({scenes.length} Scenes)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scenes.map((sc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition space-y-2 ${
                    idx === currentSceneIdx
                      ? 'bg-purple-950/50 border-purple-600/70 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-purple-400">SCENE {sc.sceneNumber}</span>
                    <span>{sc.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs leading-snug">{sc.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{sc.visualDescription}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Schematics Tab */}
      {activeMediaTab === 'visuals' && (
        <div className="space-y-6">
          {/* Visual Selector Pills */}
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin">
            {visuals.map((vis) => {
              const isSelected = vis.id === selectedVisual?.id;
              return (
                <button
                  key={vis.id}
                  onClick={() => setSelectedVisual(vis)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{vis.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Visual Render Box */}
          {selectedVisual && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedVisual.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedVisual.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSvg}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>
                </div>
              </div>

              {/* Rendered SVG Display */}
              <div
                className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: selectedVisual.svgContent }}
              />

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold mr-1">Tags:</span>
                {selectedVisual.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
