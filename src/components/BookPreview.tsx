import React, { useState } from 'react';
import { ColoringBook, ColoringPage } from '../types/book';
import { BookCoverCard } from './BookCoverCard';
import { PageCard } from './PageCard';
import { CertificateCard } from './CertificateCard';
import { ColoringStudioModal } from './ColoringStudioModal';
import { generateColoringBookPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  Download,
  Printer,
  Sparkles,
  BookOpen,
  Grid,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface BookPreviewProps {
  book: ColoringBook;
  onRegeneratePage: (pageNumber: number, customPrompt?: string) => void;
  onUpdateCoverInfo: (updates: { bookTitle?: string; bookSubtitle?: string; dedication?: string }) => void;
  onSaveColoredPage: (pageNumber: number, dataUrl: string) => void;
  regeneratingPageNumber: number | null;
}

export const BookPreview: React.FC<BookPreviewProps> = ({
  book,
  onRegeneratePage,
  onUpdateCoverInfo,
  onSaveColoredPage,
  regeneratingPageNumber,
}) => {
  const [activeStudioPage, setActiveStudioPage] = useState<ColoringPage | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [carouselIndex, setCarouselIndex] = useState(0); // 0 = Cover, 1-5 = Pages, 6 = Certificate

  const completedPagesCount = book.pages.filter((p) => p.status === 'completed' && p.imageUrl).length;
  const isBookComplete = completedPagesCount === book.pages.length;

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateColoringBookPdf(book);
      // Trigger joyous confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Celebration Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-amber-200/90 flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="bg-amber-100 text-amber-900 font-display font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Theme: {book.theme}
            </span>
            <span className="bg-orange-100 text-orange-950 font-bold text-xs px-3 py-1 rounded-full capitalize">
              Style: {book.artStyle.replace('-', ' ')}
            </span>
            <span className="bg-indigo-100 text-indigo-900 font-bold text-xs px-3 py-1 rounded-full">
              Child: {book.childName}
            </span>
            <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full">
              {book.imageResolution} Resolution
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full">
              Age {book.ageGroup}
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            {book.bookTitle}
          </h2>
          <p className="text-sm text-slate-500 font-hand">
            5 distinct black-and-white coloring pages + custom cover ready for printing or coloring!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Pages
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Book Reader
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Print coloring pages directly"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Direct</span> Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || completedPagesCount === 0}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-display font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isExportingPdf ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Assembling PDF Booklet...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Coloring Book PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Custom Front Cover Card */}
            <div className="lg:col-span-1">
              <BookCoverCard
                book={book}
                onUpdateCoverInfo={onUpdateCoverInfo}
              />
            </div>

            {/* The 5 Coloring Pages */}
            {book.pages.map((page) => (
              <PageCard
                key={page.pageNumber}
                page={page}
                childName={book.childName}
                artStyle={book.artStyle}
                onOpenColoringStudio={(p) => setActiveStudioPage(p)}
                onRegeneratePage={onRegeneratePage}
                isRegenerating={regeneratingPageNumber === page.pageNumber}
              />
            ))}

            {/* Bonus Certificate Card */}
            <div className="lg:col-span-1">
              <CertificateCard
                childName={book.childName}
                theme={book.theme}
              />
            </div>
          </div>
        </div>
      )}

      {/* Carousel / Story Reader Mode */}
      {viewMode === 'carousel' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-200/80 flex flex-col items-center">
          {/* Navigation Controls */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setCarouselIndex((prev) => Math.max(0, prev - 1))}
              disabled={carouselIndex === 0}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-sm font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Page</span>
            </button>

            {/* Indicator Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setCarouselIndex(0)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  carouselIndex === 0
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cover
              </button>
              {book.pages.map((p, idx) => (
                <button
                  key={p.pageNumber}
                  onClick={() => setCarouselIndex(idx + 1)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    carouselIndex === idx + 1
                      ? 'bg-amber-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.pageNumber}
                </button>
              ))}
              <button
                onClick={() => setCarouselIndex(book.pages.length + 1)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  carouselIndex === book.pages.length + 1
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Award
              </button>
            </div>

            <button
              onClick={() => setCarouselIndex((prev) => Math.min(book.pages.length + 1, prev + 1))}
              disabled={carouselIndex === book.pages.length + 1}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 text-sm font-bold"
            >
              <span>Next Page</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Current Page Display */}
          <div className="w-full max-w-xl">
            {carouselIndex === 0 && (
              <BookCoverCard
                book={book}
                onUpdateCoverInfo={onUpdateCoverInfo}
              />
            )}

            {carouselIndex >= 1 && carouselIndex <= book.pages.length && (
              <PageCard
                page={book.pages[carouselIndex - 1]}
                childName={book.childName}
                artStyle={book.artStyle}
                onOpenColoringStudio={(p) => setActiveStudioPage(p)}
                onRegeneratePage={onRegeneratePage}
                isRegenerating={regeneratingPageNumber === book.pages[carouselIndex - 1].pageNumber}
              />
            )}

            {carouselIndex === book.pages.length + 1 && (
              <CertificateCard
                childName={book.childName}
                theme={book.theme}
              />
            )}
          </div>
        </div>
      )}

      {/* Interactive Coloring Studio Modal */}
      {activeStudioPage && (
        <ColoringStudioModal
          page={activeStudioPage}
          childName={book.childName}
          onClose={() => setActiveStudioPage(null)}
          onSaveColored={(dataUrl) => onSaveColoredPage(activeStudioPage.pageNumber, dataUrl)}
        />
      )}
    </div>
  );
};
