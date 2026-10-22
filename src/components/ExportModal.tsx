import React, { useState } from 'react';
import { X, Download, FileText, Code, Printer, Copy, Check } from 'lucide-react';
import type { ResearchProject } from '../types/research.ts';
import { generateMarkdownReport, generateWordDocumentHtml, downloadFile } from '../lib/exportUtils.ts';

interface ExportModalProps {
  project: ResearchProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(project);
    downloadFile(md, `ResearchForge-${project.id}.md`, 'text/markdown;charset=utf-8');
  };

  const handleDownloadDocx = () => {
    const docHtml = generateWordDocumentHtml(project);
    downloadFile(docHtml, `ResearchForge-${project.id}.docx`, 'application/vnd.ms-word;charset=utf-8');
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    downloadFile(jsonStr, `ResearchForge-${project.id}.json`, 'application/json;charset=utf-8');
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport(project);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Export Research Report</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300">
            Export the complete synthesized research project, including executive summaries, empirical failure points, AI innovation concepts, and traceable source citations.
          </p>

          <div className="space-y-3">
            {/* Markdown Export */}
            <button
              onClick={handleDownloadMarkdown}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-600/70 text-left flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                    Markdown Report (.md)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Standard format formatted with headings, tables, blockquotes, and citations.
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
            </button>

            {/* Microsoft Word (.docx) Export */}
            <button
              onClick={handleDownloadDocx}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/70 text-left flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                    Microsoft Word Document (.docx)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Styled executive document with headers, formatted tables, and bibliography.
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition" />
            </button>

            {/* JSON Export */}
            <button
              onClick={handleDownloadJSON}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-600/70 text-left flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition">
                    Structured Research Data (.json)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Machine-readable JSON schema with raw claims, failure conditions, and source nodes.
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrint}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600/70 text-left flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition">
                    Print / Save as PDF
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Use your operating system print dialog to generate a clean PDF document.
                  </div>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
            </button>
          </div>

          {/* Copy to Clipboard */}
          <div className="pt-2">
            <button
              onClick={handleCopyMarkdown}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Markdown Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Formatted Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
