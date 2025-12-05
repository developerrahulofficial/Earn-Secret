import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Undo2, Trash2, Pencil } from "lucide-react";

interface DrawingCanvasProps {
  onDrawingComplete: (drawingData: string) => void;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  brushSize: number;
}

export function DrawingCanvas({ onDrawingComplete, className }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [brushSize, setBrushSize] = useState(4);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width - 32, 400);
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

    ctx.fillStyle = document.documentElement.classList.contains("dark") 
      ? "#1e1b2e" 
      : "#faf5ff";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    const strokeColor = document.documentElement.classList.contains("dark")
      ? "#a78bfa"
      : "#7c3aed";

    [...strokes, { points: currentStroke, brushSize }].forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = stroke.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        const p0 = stroke.points[i - 1];
        const p1 = stroke.points[i];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });
  }, [strokes, currentStroke, brushSize, canvasSize]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentStroke([pos]);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    setCurrentStroke((prev) => [...prev, pos]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke, brushSize }]);
    }
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const handleComplete = () => {
    const allPoints: Point[] = [];
    strokes.forEach((stroke) => {
      allPoints.push(...stroke.points);
    });
    
    if (allPoints.length < 10) return;
    
    const drawingData = JSON.stringify({
      strokes: strokes.map((s) => s.points),
      width: canvasSize.width,
      height: canvasSize.height,
    });
    
    onDrawingComplete(drawingData);
  };

  const brushSizes = [2, 4, 8, 12];

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-card-border">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="touch-none cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          data-testid="drawing-canvas"
        />
        
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1 border border-card-border">
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                brushSize === size && "bg-primary/20"
              )}
              data-testid={`button-brush-size-${size}`}
            >
              <div
                className="rounded-full bg-primary"
                style={{ width: size + 4, height: size + 4 }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          data-testid="button-undo"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={strokes.length === 0}
          data-testid="button-clear"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          onClick={handleComplete}
          disabled={strokes.length === 0}
          data-testid="button-complete-drawing"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Done
        </Button>
      </div>
    </div>
  );
}
