import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, PenTool, CheckCircle2 } from 'lucide-react';

interface RealtimeDrawingCanvasProps {
  pageTitle: string;
  pageNumber: number;
  artStyle: string;
  isCompleted: boolean;
  finalImageUrl?: string;
}

export const RealtimeDrawingCanvas: React.FC<RealtimeDrawingCanvasProps> = ({
  pageTitle,
  pageNumber,
  artStyle,
  isCompleted,
  finalImageUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sketchPhase, setSketchPhase] = useState<'rough' | 'inking' | 'details' | 'ready'>('rough');
  const [percent, setPercent] = useState(15);

  useEffect(() => {
    if (isCompleted) {
      setSketchPhase('ready');
      setPercent(100);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 530;

    // Fill white paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw page border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    let animationFrameId: number;
    let t = 0;

    const interval = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(95, p + Math.floor(Math.random() * 8 + 4));
        if (next > 70) setSketchPhase('details');
        else if (next > 40) setSketchPhase('inking');
        return next;
      });
    }, 450);

    const animateSketch = () => {
      t += 0.05;
      if (!isCompleted && ctx) {
        // Draw progressive animated sketch strokes
        ctx.strokeStyle = sketchPhase === 'rough' ? '#94a3b8' : '#0f172a';
        ctx.lineWidth = sketchPhase === 'rough' ? 2 : 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        const cx = 200 + Math.sin(t * 1.5) * 80;
        const cy = 250 + Math.cos(t * 1.2) * 90;
        ctx.arc(cx, cy, 25 + Math.sin(t) * 15, 0, Math.PI * 1.5);
        ctx.stroke();

        // Draw speed lines / hatching
        if (Math.random() > 0.6) {
          ctx.beginPath();
          const rx = 80 + Math.random() * 240;
          const ry = 100 + Math.random() * 300;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + (Math.random() - 0.5) * 40, ry + (Math.random() - 0.5) * 40);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animateSketch);
    };

    animationFrameId = requestAnimationFrame(animateSketch);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, [isCompleted, sketchPhase]);

  if (isCompleted && finalImageUrl) {
    return (
      <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white flex items-center justify-center">
        <img
          src={finalImageUrl}
          alt={pageTitle}
          className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500"
        />
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Ready
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4">
      <canvas ref={canvasRef} className="w-full h-full object-contain opacity-60" />

      {/* Floating Realtime Indicator Overlay */}
      <div className="absolute inset-x-4 bottom-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-amber-200 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            Page {pageNumber}: {sketchPhase === 'rough' ? 'Rough Sketching...' : sketchPhase === 'inking' ? 'Inking Thick Outlines...' : 'Refining Art...'}
          </span>
          <span className="font-mono text-amber-600 font-bold">{percent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-500 truncate font-hand">
          Applying {artStyle} style with black-and-white print contrast
        </p>
      </div>
    </div>
  );
};
