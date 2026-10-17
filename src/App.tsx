import React, { useState, useEffect } from 'react';
import { ColoringBook, ColoringPage, ImageResolution, AspectRatio, AgeGroup, ArtStyle } from './types/book';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { BookPreview } from './components/BookPreview';
import { ChatDrawer } from './components/ChatDrawer';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';
import confetti from 'canvas-confetti';
import { Sparkles, Printer, Heart, Award, ArrowDown, HelpCircle, CheckCircle, Crown } from 'lucide-react';

export default function App() {
  const [book, setBook] = useState<ColoringBook | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wondercolor_pro') === 'true';
    } catch {
      return false;
    }
  });
  const [regeneratingPageNumber, setRegeneratingPageNumber] = useState<number | null>(null);

  // Sync Pro state to localStorage
  const handleUpgradeSuccess = () => {
    setIsPro(true);
    try {
      localStorage.setItem('wondercolor_pro', 'true');
    } catch (e) {
      console.warn(e);
    }
    setIsProModalOpen(false);
  };

  const handleToggleProMode = () => {
    const nextVal = !isPro;
    setIsPro(nextVal);
    try {
      localStorage.setItem('wondercolor_pro', nextVal.toString());
    } catch (e) {
      console.warn(e);
    }
  };

  // Generate complete 5-page coloring book with chosen diverse art style
  const handleGenerateBook = async (params: {
    childName: string;
    theme: string;
    ageGroup: AgeGroup;
    artStyle: ArtStyle;
    imageResolution: ImageResolution;
    aspectRatio: AspectRatio;
  }) => {
    setIsGenerating(true);
    setProgressStep(`Plotting 5 distinct story chapters for ${params.childName}'s "${params.theme}" book in ${params.artStyle} style...`);

    try {
      // Step 1: Generate Storyboard with Gemini 3.8 Flash
      const storyboardRes = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: params.childName,
          theme: params.theme,
          ageGroup: params.ageGroup,
          artStyle: params.artStyle,
          isPro: isPro,
        }),
      });

      if (!storyboardRes.ok) {
        const errData = await storyboardRes.json();
        throw new Error(errData.error || 'Failed to outline coloring scenes.');
      }

      const storyboard = await storyboardRes.json();

      // Initialize book skeleton with live generating states
      const initialPages: ColoringPage[] = storyboard.pages.map((p: any) => ({
        pageNumber: p.pageNumber,
        title: p.title,
        caption: p.caption,
        coloringTip: p.coloringTip,
        prompt: p.prompt,
        status: 'generating',
        sceneCategory: p.sceneCategory,
      }));

      const newBook: ColoringBook = {
        id: Date.now().toString(),
        childName: params.childName,
        theme: params.theme,
        ageGroup: params.ageGroup,
        artStyle: params.artStyle,
        imageResolution: params.imageResolution,
        aspectRatio: params.aspectRatio,
        bookTitle: storyboard.bookTitle || `${params.childName}'s ${params.theme} Coloring Adventure`,
        bookSubtitle: storyboard.bookSubtitle || `A Custom Storybook for ${params.childName}`,
        dedication: storyboard.dedication || `Created specially for ${params.childName}. Keep coloring your dreams!`,
        coverPrompt: storyboard.coverPrompt || `Coloring book cover for ${params.theme}`,
        createdAt: new Date().toISOString(),
        pages: initialPages,
        isProBook: isPro,
      };

      setBook(newBook);

      // Step 2: Realtime Page-by-Page Drawing Generation
      // Concurrently stream and update individual pages so user sees live visual progress
      const fetchPageImage = async (page: ColoringPage) => {
        try {
          setProgressStep(`Drawing Page ${page.pageNumber}: "${page.title}" (${params.artStyle} style)...`);

          const res = await fetch('/api/generate-coloring-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: page.prompt,
              imageSize: params.imageResolution,
              aspectRatio: params.aspectRatio,
              title: page.title,
              theme: params.theme,
              pageNumber: page.pageNumber,
              artStyle: params.artStyle,
              childName: params.childName,
            }),
          });

          const data = await res.json();
          if (data.imageUrl) {
            setBook((prev) => {
              if (!prev) return null;
              const updated = prev.pages.map((p) =>
                p.pageNumber === page.pageNumber
                  ? { ...p, imageUrl: data.imageUrl, status: 'completed' as const }
                  : p
              );
              return {
                ...prev,
                pages: updated,
                coverImageUrl: updated[0]?.imageUrl || prev.coverImageUrl,
              };
            });
            return data.imageUrl;
          }
        } catch (err: any) {
          console.warn(`Failed image for page ${page.pageNumber}:`, err);
          setBook((prev) => {
            if (!prev) return null;
            const updated = prev.pages.map((p) =>
              p.pageNumber === page.pageNumber
                ? { ...p, status: 'error' as const, errorMessage: err.message }
                : p
            );
            return { ...prev, pages: updated };
          });
        }
      };

      // Generate pages in batches of 2 for snappy realtime feedback
      for (let i = 0; i < newBook.pages.length; i += 2) {
        const batch = newBook.pages.slice(i, i + 2);
        await Promise.all(batch.map((p) => fetchPageImage(p)));
      }

      setProgressStep('Finalizing printable book & gold cover ribbons...');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (error: any) {
      console.error('Error in handleGenerateBook:', error);
      alert(`Error generating coloring book: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  // Regenerate a single page
  const handleRegeneratePage = async (pageNumber: number, customPrompt?: string) => {
    if (!book) return;
    const targetPage = book.pages.find((p) => p.pageNumber === pageNumber);
    if (!targetPage) return;

    setRegeneratingPageNumber(pageNumber);

    try {
      const promptToUse = customPrompt || targetPage.prompt;
      const res = await fetch('/api/generate-coloring-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          imageSize: book.imageResolution,
          aspectRatio: book.aspectRatio,
          title: targetPage.title,
          theme: book.theme,
          pageNumber: targetPage.pageNumber,
          artStyle: book.artStyle,
          childName: book.childName,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setBook((prev) => {
          if (!prev) return null;
          const updated = prev.pages.map((p) =>
            p.pageNumber === pageNumber
              ? {
                  ...p,
                  imageUrl: data.imageUrl,
                  prompt: promptToUse,
                  status: 'completed' as const,
                  userColoredDataUrl: undefined,
                }
              : p
          );
          return {
            ...prev,
            pages: updated,
            coverImageUrl: pageNumber === 1 ? data.imageUrl : prev.coverImageUrl,
          };
        });
      }
    } catch (err: any) {
      console.error('Error regenerating page:', err);
      alert('Failed to redraw this page. Please try again.');
    } finally {
      setRegeneratingPageNumber(null);
    }
  };

  // Update cover metadata
  const handleUpdateCoverInfo = (updates: { bookTitle?: string; bookSubtitle?: string; dedication?: string }) => {
    setBook((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
      };
    });
  };

  // Save colored version from ColoringStudioModal
  const handleSaveColoredPage = (pageNumber: number, dataUrl: string) => {
    setBook((prev) => {
      if (!prev) return null;
      const updated = prev.pages.map((p) =>
        p.pageNumber === pageNumber ? { ...p, userColoredDataUrl: dataUrl } : p
      );
      return { ...prev, pages: updated };
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col font-body selection:bg-amber-200">
      {/* Header Bar */}
      <div className="no-print">
        <Header
          onNewBook={() => setBook(null)}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
          hasBook={!!book}
          isPro={isPro}
          onOpenProModal={() => setIsProModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {!book ? (
          <div className="space-y-10">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/80 px-4 py-1.5 rounded-full text-xs font-bold text-amber-900 shadow-xs">
                <span>✨</span>
                <span>Real-Time Diverse Story Drawing • 6 Art Styles • Gemini 3 Pro</span>
              </div>

              <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight">
                Create a Custom{' '}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                  Coloring Book
                </span>{' '}
                for Your Child
              </h2>
              <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed font-body max-w-2xl mx-auto">
                Enter any theme (e.g. <em>"space dinosaurs"</em> or <em>"magical mermaid safari"</em>) and your child's name.
                Get 5 distinct, non-repetitive black-and-white coloring pages, a personalized cover, and an award certificate in a single PDF!
              </p>

              {/* $5 Pro Pass Callout Banner */}
              {!isPro && (
                <div
                  onClick={() => setIsProModalOpen(true)}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-102"
                >
                  <Crown className="w-4 h-4 text-yellow-200" />
                  <span>Pro Version ($5 USD): Unlock 4K Ultra-Sharp Print & All 6 Art Styles</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono">
                    Upgrade
                  </span>
                </div>
              )}
            </div>

            {/* Generator Form */}
            <div className="max-w-3xl mx-auto">
              <GeneratorForm
                onGenerate={handleGenerateBook}
                isGenerating={isGenerating}
                progressStep={progressStep}
                isPro={isPro}
                onOpenProModal={() => setIsProModalOpen(true)}
              />
            </div>

            {/* Features Highlight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto">
              <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-amber-200/60 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                  🎨
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg mb-1">
                  6 Diverse Art Styles
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-body">
                  Never repetitive! Pick from Chunky Toddler, Whimsical Storybook, Kawaii Chibi, Mandala, Action Comic, or Wildlife Nature.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-orange-200/60 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                  ⏱️
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg mb-1">
                  Real-Time Live Drawing
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-body">
                  Watch pages sketch and ink in real time with progressive stroke feedback and instant live thumbnail updates.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-rose-200/60 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                  📄
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg mb-1">
                  1-Click Complete PDF
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-body">
                  Combines custom cover with child's name, 5 varied story scenes with rhymes, and an official Master Artist completion certificate.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Book Preview Mode */
          <div className="space-y-8">
            <BookPreview
              book={book}
              onRegeneratePage={handleRegeneratePage}
              onUpdateCoverInfo={handleUpdateCoverInfo}
              onSaveColoredPage={handleSaveColoredPage}
              regeneratingPageNumber={regeneratingPageNumber}
            />
          </div>
        )}
      </main>

      {/* Floating Gemini Chat Co-Pilot Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentBookContext={
          book
            ? {
                childName: book.childName,
                theme: book.theme,
                ageGroup: book.ageGroup,
                bookTitle: book.bookTitle,
                pages: book.pages.map((p) => ({ pageNumber: p.pageNumber, title: p.title })),
              }
            : undefined
        }
      />

      {/* Pro Subscription Modal ($5 USD) */}
      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={isPro}
        childName={book?.childName || 'Your Child'}
        onUpgradeSuccess={handleUpgradeSuccess}
        onToggleProMode={handleToggleProMode}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2 font-hand">
          <p className="text-sm font-bold text-slate-700">
            WonderColor • Sparking imagination with real-time diverse children's coloring books.
          </p>
          <p>
            Powered by Google Gemini 3 Pro Image (1K, 2K, 4K resolution) & Gemini 3.8 Flash story arc co-pilot.
          </p>
        </div>
      </footer>

      {/* Hidden Print-Only Layout for Direct Browser Printing */}
      {book && (
        <div className="hidden print:block print-only">
          {/* Print Cover Page */}
          <div className="page-break p-8 text-center border-4 border-black min-h-[95vh] flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest">OFFICIAL COLORING BOOK</p>
              <h1 className="text-4xl font-bold uppercase mt-4">{book.bookTitle}</h1>
              <p className="text-lg mt-2">{book.bookSubtitle}</p>
              <div className="my-6 border-2 border-black inline-block px-6 py-2 text-xl font-bold">
                CREATED FOR {book.childName.toUpperCase()}
              </div>
            </div>
            {book.coverImageUrl && (
              <div className="my-6 max-h-[45vh] flex items-center justify-center">
                <img
                  src={book.coverImageUrl}
                  alt="Cover"
                  className="max-h-[40vh] object-contain border-2 border-black"
                />
              </div>
            )}
            <div className="border border-black p-4 mt-auto">
              <p className="italic">"{book.dedication}"</p>
              <p className="text-xs font-bold mt-4">
                ARTIST: _______________________ DATE: ______________
              </p>
            </div>
          </div>

          {/* Print All 5 Pages */}
          {book.pages.map((page) => (
            <div
              key={page.pageNumber}
              className="page-break p-6 border-2 border-black min-h-[95vh] flex flex-col justify-between"
            >
              <div className="border-b-2 border-black pb-2 text-center">
                <h2 className="text-2xl font-bold">
                  PAGE {page.pageNumber}: {page.title.toUpperCase()}
                </h2>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                {page.imageUrl && (
                  <img
                    src={page.imageUrl}
                    alt={page.title}
                    className="max-h-[68vh] object-contain border border-black"
                  />
                )}
              </div>
              <div className="border-t border-black pt-3 text-center">
                <p className="text-base font-semibold">{page.caption}</p>
                <p className="text-xs italic text-gray-700 mt-1">Tip: {page.coloringTip}</p>
                <p className="text-xs font-bold text-gray-500 mt-2">
                  Page {page.pageNumber} of 5 • {book.childName}'s Coloring Book
                </p>
              </div>
            </div>
          ))}

          {/* Print Certificate */}
          <div className="p-8 text-center border-8 border-double border-black min-h-[95vh] flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold tracking-widest">★ ★ ★ OFFICIAL CERTIFICATE ★ ★ ★</p>
              <h1 className="text-4xl font-bold uppercase mt-4">MASTER COLORING ARTIST</h1>
              <p className="mt-4 text-sm">PROUDLY PRESENTED TO</p>
              <h2 className="text-4xl font-bold underline mt-4">{book.childName.toUpperCase()}</h2>
              <p className="mt-6 max-w-md mx-auto text-sm leading-relaxed">
                For completing all 5 pages of the {book.theme} coloring adventure with flying colors
                and wonderful imagination!
              </p>
            </div>
            <div className="flex justify-between items-end px-8 mt-auto pt-12">
              <div className="text-center">
                <div className="w-48 border-b border-black mb-1"></div>
                <p className="text-xs font-bold">Artist's Signature</p>
              </div>
              <div className="text-center">
                <div className="w-48 border-b border-black mb-1"></div>
                <p className="text-xs font-bold">Parent / Teacher Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
