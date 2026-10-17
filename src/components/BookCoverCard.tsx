import React, { useState } from 'react';
import { ColoringBook } from '../types/book';
import { Star, Download, Edit2, Check, RefreshCw } from 'lucide-react';

interface BookCoverCardProps {
  book: ColoringBook;
  onUpdateCoverInfo?: (updates: { bookTitle?: string; bookSubtitle?: string; dedication?: string }) => void;
  onRegenerateCover?: () => void;
  isRegeneratingCover?: boolean;
}

export const BookCoverCard: React.FC<BookCoverCardProps> = ({
  book,
  onUpdateCoverInfo,
  onRegenerateCover,
  isRegeneratingCover,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(book.bookTitle);
  const [subtitle, setSubtitle] = useState(book.bookSubtitle);
  const [dedication, setDedication] = useState(book.dedication);

  const handleSave = () => {
    if (onUpdateCoverInfo) {
      onUpdateCoverInfo({
        bookTitle: title,
        bookSubtitle: subtitle,
        dedication: dedication,
      });
    }
    setIsEditing(false);
  };

  const handleDownloadCover = () => {
    const coverSrc = book.coverImageUrl || book.pages[0]?.imageUrl;
    if (!coverSrc) return;
    const link = document.createElement('a');
    link.download = `${book.childName}_Coloring_Book_Cover.png`;
    link.href = coverSrc;
    link.click();
  };

  const coverSrc = book.coverImageUrl || book.pages[0]?.imageUrl;

  return (
    <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-200 text-yellow-200" />
          <span className="font-display font-bold text-sm tracking-wider uppercase">
            Official Book Cover
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="Edit Title & Dedication"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Text</span>
          </button>
          <button
            onClick={handleDownloadCover}
            disabled={!coverSrc}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer disabled:opacity-40"
            title="Download Cover Art"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Printable Cover Simulation Canvas */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white text-center border-b border-slate-100 relative">
        {/* Ornate Frame */}
        <div className="border-2 border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-full bg-slate-50/40">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              A Personal Coloring Adventure
            </p>

            {/* Editable or Display Title */}
            {isEditing ? (
              <div className="my-2 space-y-2 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Book Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm font-bold p-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subtitle:</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full text-xs p-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Dedication:</label>
                  <textarea
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-1.5 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1 uppercase tracking-wide leading-tight">
                  {book.bookTitle}
                </h3>
                <p className="font-hand text-slate-600 text-sm mt-0.5">{book.bookSubtitle}</p>
              </>
            )}

            {/* Name Ribbon */}
            <div className="my-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border border-amber-300 px-4 py-1.5 rounded-full shadow-xs">
              <span className="text-amber-600">⭐</span>
              <span className="font-display font-bold text-xs sm:text-sm text-slate-800 tracking-wider">
                SPECIALLY CREATED FOR {book.childName.toUpperCase()}
              </span>
              <span className="text-amber-600">⭐</span>
            </div>
          </div>

          {/* Cover Art Image */}
          <div className="relative aspect-[4/3] sm:aspect-[3/2] my-2 bg-white rounded-xl border-2 border-slate-700 overflow-hidden flex items-center justify-center p-2 shadow-inner">
            {isRegeneratingCover ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs text-slate-500 font-bold">Painting cover art...</p>
              </div>
            ) : coverSrc ? (
              <img
                src={coverSrc}
                alt="Book Cover Art"
                className="w-full h-full object-contain filter contrast-105"
              />
            ) : (
              <p className="text-xs text-slate-400 font-hand">Cover illustration will appear here</p>
            )}
          </div>

          {/* Bottom Dedication Box */}
          <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-left">
            <p className="text-[11px] italic text-slate-700 leading-snug font-hand">
              "{book.dedication}"
            </p>
            <div className="mt-2 pt-1.5 border-t border-amber-200/50 flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              <span>ARTIST: {book.childName}</span>
              <span>ALL 5 PAGES READY TO COLOR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
