import React from 'react';
import { Palette, Sparkles, MessageSquare, PlusCircle, Crown, Award } from 'lucide-react';

interface HeaderProps {
  onNewBook: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  hasBook: boolean;
  isPro: boolean;
  onOpenProModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewBook,
  onToggleChat,
  isChatOpen,
  hasBook,
  isPro,
  onOpenProModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewBook}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-2xl shadow-md shadow-orange-500/20 transform -rotate-3 hover:rotate-0 transition-transform">
            🖍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                WonderColor
              </h1>
              <span className="text-[10px] font-bold font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Gemini 3 Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-hand font-medium hidden sm:block">
              Printable Children's Coloring Books with Custom Covers & Diverse Story Pages
            </p>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2.5">
          {/* $5 USD Pro Subscription Button / Badge */}
          {isPro ? (
            <button
              onClick={onOpenProModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:shadow-sm transition-all"
              title="View Pro Subscription Details"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>PRO ARTIST</span>
              <span className="hidden sm:inline text-[10px] text-amber-700 bg-amber-300/60 px-1.5 py-0.2 rounded-full">
                4K Active
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenProModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span>Get Pro ($5)</span>
            </button>
          )}

          {hasBook && (
            <button
              onClick={onNewBook}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">New Book</span>
            </button>
          )}

          {/* Assistant Trigger Button */}
          <button
            onClick={onToggleChat}
            className={`px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              isChatOpen
                ? 'bg-violet-700 text-white shadow-violet-500/25'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
            }`}
          >
            <span className="text-base">🐛</span>
            <span className="hidden sm:inline">Barnaby AI</span>
            <span className="sm:hidden">Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
};
