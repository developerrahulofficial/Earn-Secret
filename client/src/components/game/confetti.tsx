import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

const COLORS = [
  "hsl(280, 70%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(320, 70%, 65%)",
  "hsl(45, 90%, 65%)",
  "hsl(180, 60%, 55%)",
];

interface ConfettiProps {
  isActive: boolean;
  count?: number;
}

export function Confetti({ isActive, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));

    setPieces(newPieces);
  }, [isActive, count]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animation: `confetti ${piece.duration}s ease-out forwards`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
