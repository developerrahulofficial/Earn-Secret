import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Dot } from "@shared/schema";

interface GameCanvasProps {
  dots: Dot[];
  connections: Array<{ from: string; to: string }>;
  onDotClick: (dotId: string) => void;
  isYourTurn: boolean;
  isRevealing: boolean;
  revealedShape?: string;
  shapeType?: "text" | "drawing" | "image";
}

export function GameCanvas({
  dots,
  connections,
  onDotClick,
  isYourTurn,
  isRevealing,
  revealedShape,
  shapeType,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 800);
        setCanvasSize({ width: size, height: size });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasSize;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    const isDark = document.documentElement.classList.contains("dark");
    const lineColor = isDark ? "rgba(168, 139, 250, 0.6)" : "rgba(124, 58, 237, 0.5)";
    const dotColor = isDark ? "#a78bfa" : "#7c3aed";
    const dotConnectedColor = isDark ? "#c4b5fd" : "#8b5cf6";
    const dotGlowColor = isDark ? "rgba(167, 139, 250, 0.5)" : "rgba(124, 58, 237, 0.4)";

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    connections.forEach(({ from, to }) => {
      const fromDot = dots.find((d) => d.id === from);
      const toDot = dots.find((d) => d.id === to);
      if (fromDot && toDot) {
        ctx.beginPath();
        ctx.moveTo(fromDot.x * width, fromDot.y * height);
        ctx.lineTo(toDot.x * width, toDot.y * height);
        ctx.stroke();
      }
    });

    dots.forEach((dot) => {
      if (!dot.revealed && !isRevealing) return;

      const x = dot.x * width;
      const y = dot.y * height;
      const isClickable = dot.revealed && !dot.connected && isYourTurn;
      const isHovered = hoveredDot === dot.id;

      const baseRadius = 8;
      const radius = isClickable ? (isHovered ? 12 : 10) : 6;

      if (isClickable) {
        ctx.save();
        ctx.shadowColor = dotGlowColor;
        ctx.shadowBlur = isHovered ? 20 : 12;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.connected ? dotConnectedColor : dotColor;
        ctx.fill();
      }

      if (dot.connected) {
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#1e1b2e" : "#faf5ff";
        ctx.fill();
      }
    });

    ctx.restore();
  }, [dots, connections, scale, offset, hoveredDot, isYourTurn, isRevealing, canvasSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left - offset.x) / scale,
      y: (touch.clientY - rect.top - offset.y) / scale,
    };
  };

  const findClickedDot = (pos: { x: number; y: number }) => {
    const { width, height } = canvasSize;
    const clickRadius = 25;

    return dots.find((dot) => {
      if (!dot.revealed || dot.connected) return false;
      const dx = pos.x - dot.x * width;
      const dy = pos.y - dot.y * height;
      return Math.sqrt(dx * dx + dy * dy) < clickRadius;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (!isYourTurn) {
      setHoveredDot(null);
      return;
    }

    const pos = getMousePos(e);
    const dot = findClickedDot(pos);
    setHoveredDot(dot?.id ?? null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || !isYourTurn) return;

    const pos = getMousePos(e);
    const dot = findClickedDot(pos);
    if (dot) {
      onDotClick(dot.id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 2) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    if (!isYourTurn) return;

    const touch = e.changedTouches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: (touch.clientX - rect.left - offset.x) / scale,
      y: (touch.clientY - rect.top - offset.y) / scale,
    };

    const dot = findClickedDot(pos);
    if (dot) {
      onDotClick(dot.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleZoomIn = () => setScale((prev) => Math.min(3, prev * 1.2));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev / 1.2));
  const handleResetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-xl",
          "bg-game-canvas dark:bg-game-canvas"
        )}
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        {isRevealing && shapeType === "text" && revealedShape && (
          <div className="absolute inset-0 flex items-center justify-center z-10 animate-reveal-glow">
            <h1
              className="font-display text-6xl md:text-8xl font-bold text-primary tracking-wide"
              style={{
                textShadow: "0 0 30px hsl(var(--primary) / 0.5)",
              }}
              data-testid="text-revealed-shape"
            >
              {revealedShape}
            </h1>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={cn(
            "cursor-crosshair touch-none",
            isDragging && "cursor-grabbing",
            hoveredDot && "cursor-pointer",
            isRevealing && "opacity-20 transition-opacity duration-1000"
          )}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="game-canvas"
        />

        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border flex items-center justify-center text-lg font-bold hover-elevate"
            data-testid="button-zoom-in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border flex items-center justify-center text-lg font-bold hover-elevate"
            data-testid="button-zoom-out"
          >
            -
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border flex items-center justify-center text-xs font-semibold hover-elevate"
            data-testid="button-reset-view"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
