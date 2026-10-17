import React, { useState } from 'react';
import { ColoringPage } from '../types/book';
import { Paintbrush, Download, RefreshCw, ZoomIn, Sparkles, AlertCircle, Edit3 } from 'lucide-react';
import { RealtimeDrawingCanvas } from './RealtimeDrawingCanvas';

interface PageCardProps {
  page: ColoringPage;
  childName: string;
  artStyle?: string;
  onOpenColoringStudio: (page: ColoringPage) => void;
  onRegeneratePage: (pageNumber: number, customPrompt?: string) => void;
  isRegenerating?: boolean;
}

export const PageCard: React.FC<PageCardProps> = ({
  page,
  childName,
  artStyle = 'storybook',
  onOpenColoringStudio,
  onRegeneratePage,
  isRegenerating,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptText, setPromptText] = useState(page.prompt);

  const handleDownloadImage = () => {
    if (!page.imageUrl) return;
    const link = document.createElement('a');
    link.download = `${childName.replace(/\s+/g, '_')}_Coloring_Page_${page.pageNumber}.png`;
    link.href = page.imageUrl;
    link.click();
  };

  const handleSaveAndRegenerate = () => {
    setIsEditingPrompt(false);
    onRegeneratePage(page.pageNumber, promptText);
  };

  const isDrawingNow = page.status === 'generating' || isRegenerating;

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
        {/* Card Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {page.pageNumber}
            </span>
            <h4 className="font-display font-bold text-slate-800 text-sm truncate max-w-[180px] sm:max-w-[220px]">
              {page.title}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsZoomed(true)}
              disabled={!page.imageUrl}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={!page.imageUrl}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-40"
              title="Download Page PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview Container with Realtime Drawing Canvas */}
        <div className="relative aspect-[3/4] bg-white p-3 flex items-center justify-center border-b border-slate-100 overflow-hidden">
          {isDrawingNow ? (
            <RealtimeDrawingCanvas
              pageTitle={page.title}
              pageNumber={page.pageNumber}
              artStyle={artStyle}
              isCompleted={false}
            />
          ) : page.status === 'error' ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-rose-500">
              <AlertCircle className="w-8 h-8" />
              <p className="text-xs font-semibold">Failed to sketch image.</p>
              <button
                onClick={() => onRegeneratePage(page.pageNumber)}
                className="mt-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-bold"
              >
                Retry Page
              </button>
            </div>
          ) : page.imageUrl ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src={page.userColoredDataUrl || page.imageUrl}
                alt={page.title}
                className="w-full h-full object-contain filter contrast-105 transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {page.userColoredDataUrl && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Colored In-App
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-hand">Pending sketch...</div>
          )}
        </div>

        {/* Card Body & Story Snippet */}
        <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
          <div>
            <p className="text-xs text-slate-700 leading-relaxed font-body font-medium">
              "{page.caption}"
            </p>
            <div className="mt-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-1.5">
              <span className="text-xs shrink-0">🖍️</span>
              <span className="leading-tight font-hand">
                <strong>Coloring Tip:</strong> {page.coloringTip}
              </span>
            </div>
          </div>

          {/* Quick Edit Prompt Drawer */}
          {isEditingPrompt ? (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Tweak Scene Prompt:
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditingPrompt(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndRegenerate}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Regenerate with Tweak
                </button>
              </div>
            </div>
          ) : null}

          {/* Actions Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => onOpenColoringStudio(page)}
              disabled={!page.imageUrl}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Color Online
            </button>

            <button
              onClick={() => setIsEditingPrompt(!isEditingPrompt)}
              disabled={isDrawingNow}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              title="Edit Prompt"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onRegeneratePage(page.pageNumber)}
              disabled={isDrawingNow}
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              title="Regenerate this page"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Page {page.pageNumber}: {page.title}
                </h3>
                <p className="text-xs text-slate-500">{page.caption}</p>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-white p-2 border rounded-xl">
              <img
                src={page.userColoredDataUrl || page.imageUrl}
                alt={page.title}
                className="max-h-[65vh] object-contain"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download High-Res PNG
              </button>
              <button
                onClick={() => {
                  setIsZoomed(false);
                  onOpenColoringStudio(page);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Paintbrush className="w-4 h-4" />
                Color this Page Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
