import React, { useState } from 'react';
import { ImageResolution, AspectRatio, AgeGroup, ArtStyle } from '../types/book';
import { Sparkles, Wand2, BookOpen, Layers, User, Palette, Lightbulb, Crown, Brush } from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: (params: {
    childName: string;
    theme: string;
    ageGroup: AgeGroup;
    artStyle: ArtStyle;
    imageResolution: ImageResolution;
    aspectRatio: AspectRatio;
  }) => void;
  isGenerating: boolean;
  progressStep?: string;
  isPro: boolean;
  onOpenProModal: () => void;
}

const PRESET_THEMES = [
  { label: 'Space Dinosaurs', icon: '🚀🦖', desc: 'T-Rex in astronaut suits on the moon' },
  { label: 'Deep Sea Explorers', icon: '🌊🐙', desc: 'Cute submarines and glowing jellyfish' },
  { label: 'Enchanted Bakery', icon: '🧁🧚', desc: 'Fairies baking giant rainbow cupcakes' },
  { label: 'Superhero Puppies', icon: '🦸‍♂️🐶', desc: 'Caped rescue dogs saving the playground' },
  { label: 'Safari Racecars', icon: '🏎️🦁', desc: 'Lions and zebras zooming through the savanna' },
  { label: 'Friendly Castle Dragons', icon: '🏰🐲', desc: 'Baby dragons drinking herbal tea with knights' },
];

const ART_STYLES: Array<{ id: ArtStyle; label: string; icon: string; desc: string; isProOnly?: boolean }> = [
  { id: 'storybook', label: 'Classic Storybook', icon: '📖', desc: 'Charming fairytale line art with decorative scenery' },
  { id: 'toddler-chunky', label: 'Chunky Toddler', icon: '🖍️', desc: 'Extra thick 10px lines, huge shapes, easy coloring' },
  { id: 'kawaii', label: 'Kawaii Chibi', icon: '🍡', desc: 'Cute chibi characters, sweets, stars & boba' },
  { id: 'mandala', label: 'Mandala & Patterns', icon: '🏵️', desc: 'Intricate decorative borders & geometric wings' },
  { id: 'comic', label: 'Action Comic', icon: '💥', desc: 'Dynamic superhero angles & sound effect bubbles' },
  { id: 'wildlife', label: 'Wildlife Safari', icon: '🌿', desc: 'Detailed jungle fauna, botanicals & nature animals' },
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onGenerate,
  isGenerating,
  progressStep,
  isPro,
  onOpenProModal,
}) => {
  const [childName, setChildName] = useState('Leo');
  const [theme, setTheme] = useState('space dinosaurs');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('5-8');
  const [artStyle, setArtStyle] = useState<ArtStyle>('storybook');
  const [imageResolution, setImageResolution] = useState<ImageResolution>(isPro ? '4K' : '2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !theme.trim() || isGenerating) return;
    onGenerate({
      childName: childName.trim(),
      theme: theme.trim(),
      ageGroup,
      artStyle,
      imageResolution,
      aspectRatio,
    });
  };

  const handleSelectResolution = (res: ImageResolution) => {
    if (res === '4K' && !isPro) {
      onOpenProModal();
      return;
    }
    setImageResolution(res);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200/80 p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {/* Child Name & Theme Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Child's Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">
                <User className="w-3.5 h-3.5" />
              </span>
              Child's Name
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Leo, Maya, Charlie..."
              required
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 text-base font-semibold focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all font-body"
            />
            <p className="mt-1.5 text-xs text-slate-400 font-hand">
              Featured on the custom cover, certificates, and page headers!
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                <Palette className="w-3.5 h-3.5" />
              </span>
              Coloring Book Theme
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. space dinosaurs, fairy garden..."
              required
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 text-base font-semibold focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all font-body"
            />
            <p className="mt-1.5 text-xs text-slate-400 font-hand">
              Anything your child loves! 5 varied, non-repetitive story scenes will be drawn.
            </p>
          </div>
        </div>

        {/* Quick Theme Presets */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Inspiration Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setTheme(preset.label)}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  theme.toLowerCase() === preset.label.toLowerCase()
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm scale-102'
                    : 'bg-slate-100/80 hover:bg-amber-50 hover:text-amber-800 border-slate-200 text-slate-700'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diverse Art Styles Selection (Not only one type of photo!) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Brush className="w-4 h-4 text-orange-500" />
              Choose Illustration Style (6 Distinct Options):
            </label>
            <span className="text-[11px] font-bold text-slate-400">
              Never just one repetitive style!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ART_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setArtStyle(style.id)}
                disabled={isGenerating}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  artStyle === style.id
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm scale-101 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{style.icon}</span>
                  {artStyle === style.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-slate-900 leading-tight">
                    {style.label}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2 font-hand">
                    {style.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configurations: Resolution (1K, 2K, 4K), Age Group, Aspect Ratio */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Resolution Affordance (1K, 2K, 4K) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Image Resolution
              </span>
              {isPro ? (
                <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-600" /> Pro Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenProModal}
                  className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  $5 Pro Pass
                </button>
              )}
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => {
                const isLocked4K = res === '4K' && !isPro;
                return (
                  <button
                    key={res}
                    type="button"
                    onClick={() => handleSelectResolution(res)}
                    disabled={isGenerating}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                      imageResolution === res
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {res}
                      {isLocked4K && <Crown className="w-2.5 h-2.5 text-amber-500" />}
                    </span>
                    <span className="block text-[9px] font-normal opacity-70">
                      {res === '1K' ? 'Fast' : res === '2K' ? 'Sharp' : 'Ultra HD'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Group / Line Thickness */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              Target Age & Lines
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { id: '2-4', label: '2-4 yrs', sub: 'Chunky' },
                  { id: '5-8', label: '5-8 yrs', sub: 'Standard' },
                  { id: '9+', label: '9+ yrs', sub: 'Detailed' },
                ] as const
              ).map((age) => (
                <button
                  key={age.id}
                  type="button"
                  onClick={() => setAgeGroup(age.id)}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    ageGroup === age.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {age.label}
                  <span className="block text-[9px] font-normal opacity-70">{age.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Book Format / Aspect Ratio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Print Format
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(
                [
                  { id: '3:4', label: 'Portrait 3:4', sub: 'Standard Print' },
                  { id: '1:1', label: 'Square 1:1', sub: 'Storybook' },
                ] as const
              ).map((aspect) => (
                <button
                  key={aspect.id}
                  type="button"
                  onClick={() => setAspectRatio(aspect.id)}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    aspectRatio === aspect.id
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aspect.label}
                  <span className="block text-[9px] font-normal opacity-70">{aspect.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button & Status */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating || !childName.trim() || !theme.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-display font-bold text-lg sm:text-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                <span>Drawing {childName}'s Book in Realtime...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 animate-pulse" />
                <span>Generate 5-Page Coloring Book for {childName || 'Your Child'}!</span>
              </>
            )}
          </button>

          {isGenerating && progressStep && (
            <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-center text-xs font-semibold text-amber-900 animate-pulse flex items-center justify-center gap-2 font-hand">
              <span>🖍️</span>
              <span>{progressStep}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
