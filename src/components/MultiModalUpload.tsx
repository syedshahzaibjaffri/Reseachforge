import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Video, FileText, X, Paperclip } from 'lucide-react';
import type { ResearchAttachment } from '../types/research.ts';

interface MultiModalUploadProps {
  attachments: ResearchAttachment[];
  onChange: (attachments: ResearchAttachment[]) => void;
}

export const MultiModalUpload: React.FC<MultiModalUploadProps> = ({ attachments, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ResearchAttachment[] = [];

    Array.from(files).forEach((file) => {
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      const attachment: ResearchAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
      };

      // Read small files as base64 dataUrl if needed
      const reader = new FileReader();
      reader.onload = () => {
        attachment.dataBase64 = reader.result as string;
      };
      if (file.size < 5 * 1024 * 1024) {
        reader.readAsDataURL(file);
      }

      newAttachments.push(attachment);
    });

    onChange([...attachments, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multi-Modal Research Attachments (Images, Videos, Files)</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          {attachments.length} attachment{attachments.length !== 1 ? 's' : ''} added
        </span>
      </div>

      {/* Upload Drop Zone / Button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/60 text-center cursor-pointer transition group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-3 text-slate-400 group-hover:text-slate-200">
          <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
              Attach Images, Video Captures, or Documents
            </span>
            <p className="text-[10px] text-slate-400">
              Drag & drop or browse PNG, JPG, MP4, PDF, DOCX, CSV (AI will incorporate context)
            </p>
          </div>
        </div>
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 shadow-sm"
            >
              {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              {att.type === 'video' && <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              {att.type === 'file' && <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />}

              <span className="truncate max-w-[150px] font-medium">{att.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({formatSize(att.size)})</span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(att.id);
                }}
                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
