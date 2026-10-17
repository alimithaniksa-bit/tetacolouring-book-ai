import React, { useRef, useState, useEffect } from 'react';
import { ColoringPage } from '../types/book';
import { X, RotateCcw, Download, Sparkles, Paintbrush, Eraser, CircleDot, Check } from 'lucide-react';

interface ColoringStudioModalProps {
  page: ColoringPage;
  childName: string;
  onClose: () => void;
  onSaveColored?: (dataUrl: string) => void;
}

const PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Sky Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#854d0e', // Amber Brown
  '#78716c', // Stone
  '#0f172a', // Bold Black
  '#fef08a', // Pastel Lemon
  '#bbf7d0', // Mint
  '#fed7aa', // Peach
  '#fbcfe8', // Bubblegum
];

const BRUSH_SIZES = [
  { label: 'Fine', size: 6 },
  { label: 'Medium', size: 14 },
  { label: 'Chunky', size: 28 },
  { label: 'Jumbo', size: 50 },
];

export const ColoringStudioModal: React.FC<ColoringStudioModalProps> = ({
  page,
  childName,
  onClose,
  onSaveColored,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ef4444');
  const [currentSize, setCurrentSize] = useState(14);
  const [activeTool, setActiveTool] = useState<'crayon' | 'marker' | 'rainbow' | 'eraser' | 'stamp'>('marker');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const rainbowHueRef = useRef(0);

  // Initialize canvas with page image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page.imageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 1060;

      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw coloring image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Save initial snapshot to history
      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialSnapshot]);
      setImageLoaded(true);
    };
    img.src = page.imageUrl;
  }, [page.imageUrl]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, fill: string) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
    ctx.restore();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'stamp') {
      drawStar(ctx, x, y, 5, currentSize * 1.5, currentSize * 0.7, currentColor);
      saveToHistory();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Setup brush stroke
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentSize;

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffffff';
    } else if (activeTool === 'crayon') {
      // Crayon texture with transparency
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `${currentColor}99`;
    } else if (activeTool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 20) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // Felt marker
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 3) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${childName}_colored_page_${page.pageNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSaveColored) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveColored(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border-4 border-amber-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
              🎨
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
                Coloring Studio: {page.title}
              </h3>
              <p className="text-amber-100 text-xs sm:text-sm font-hand">
                Made for {childName} • {page.coloringTip}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Canvas Viewport */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto bg-grid-dots">
            <div className="relative shadow-xl rounded-2xl bg-white border-2 border-slate-300 overflow-hidden max-h-[70vh] aspect-[3/4]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full object-contain cursor-crosshair touch-none"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
                </div>
              )}
            </div>
          </div>

          {/* Tools Panel */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Tool Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Drawing Tools
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool('marker')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'marker'
                      ? 'bg-amber-500 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Paintbrush className="w-5 h-5 mb-1" />
                  Marker
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('crayon')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'crayon'
                      ? 'bg-amber-500 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CircleDot className="w-5 h-5 mb-1" />
                  Crayon
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('rainbow')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'rainbow'
                      ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mb-1" />
                  Rainbow
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('stamp')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'stamp'
                      ? 'bg-amber-500 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-lg leading-none mb-1">⭐</span>
                  Star Stamp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('eraser')}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'eraser'
                      ? 'bg-slate-800 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Eraser className="w-5 h-5 mb-1" />
                  Eraser
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length <= 1}
                  className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5 mb-1" />
                  Undo
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Brush Thickness
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.size}
                    type="button"
                    onClick={() => setCurrentSize(b.size)}
                    className={`py-2 px-1 text-xs rounded-xl font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      currentSize === b.size
                        ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className="rounded-full bg-slate-800"
                      style={{ width: Math.min(b.size / 2 + 4, 20), height: Math.min(b.size / 2 + 4, 20) }}
                    />
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Crayon & Marker Palette
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      setCurrentColor(hex);
                      if (activeTool === 'eraser') setActiveTool('marker');
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-transform cursor-pointer border border-black/10 ${
                      currentColor === hex && activeTool !== 'eraser'
                        ? 'ring-4 ring-amber-400 scale-110 shadow-md'
                        : 'hover:scale-105'
                    }`}
                  >
                    {currentColor === hex && activeTool !== 'eraser' && (
                      <Check
                        className={`w-4 h-4 ${
                          ['#fef08a', '#bbf7d0', '#fed7aa', '#fbcfe8', '#eab308'].includes(hex)
                            ? 'text-slate-900'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Colored PNG
              </button>
              {onSaveColored && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save to Coloring Book
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
