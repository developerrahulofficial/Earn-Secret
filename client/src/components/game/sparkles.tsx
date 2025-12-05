import { useEffect, useState } from "react";
import { Sparkles as SparkleIcon } from "lucide-react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface SparklesProps {
  isActive: boolean;
  count?: number;
}

export function Sparkles({ isActive, count = 12 }: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setSparkles([]);
      return;
    }

    const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 16 + Math.random() * 16,
      delay: Math.random() * 1.5,
    }));

    setSparkles(newSparkles);
  }, [isActive, count]);

  if (!isActive || sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <SparkleIcon
          key={sparkle.id}
          className="absolute text-primary"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animation: `sparkle 1.5s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
