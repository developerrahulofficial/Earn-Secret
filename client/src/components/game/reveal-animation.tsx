import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";
import { Sparkles } from "./sparkles";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share2 } from "lucide-react";

interface RevealAnimationProps {
  isActive: boolean;
  shapeType: "text" | "drawing" | "image";
  shapeData: string;
  onPlayAgain: () => void;
  onShare?: () => void;
}

export function RevealAnimation({
  isActive,
  shapeType,
  shapeData,
  onPlayAgain,
  onShare,
}: RevealAnimationProps) {
  const [stage, setStage] = useState<"building" | "revealing" | "complete">("building");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setStage("building");
      setShowConfetti(false);
      setShowSparkles(false);
      return;
    }

    setStage("building");

    const revealTimer = setTimeout(() => {
      setStage("revealing");
      setShowSparkles(true);
    }, 2000);

    const completeTimer = setTimeout(() => {
      setStage("complete");
      setShowConfetti(true);
    }, 4000);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive]);

  if (!isActive) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I revealed a secret!",
          text: `Check out what I discovered: ${shapeType === "text" ? shapeData : "A beautiful shape"}`,
          url: window.location.href,
        });
      } catch {
      }
    }
    onShare?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Confetti isActive={showConfetti} count={80} />
      
      <div className="relative w-full max-w-lg mx-auto px-6 text-center">
        <Sparkles isActive={showSparkles} count={16} />

        <div
          className={cn(
            "transition-all duration-1000",
            stage === "building" && "opacity-50 scale-90",
            stage === "revealing" && "opacity-100 scale-100",
            stage === "complete" && "opacity-100 scale-100"
          )}
        >
          {stage === "building" && (
            <div className="space-y-4 animate-pulse">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/20" />
              <p className="text-lg text-muted-foreground">Building the reveal...</p>
            </div>
          )}

          {(stage === "revealing" || stage === "complete") && (
            <div className="space-y-8">
              {shapeType === "text" && (
                <div className="animate-reveal-glow">
                  <h1
                    className="font-display text-6xl md:text-8xl font-bold text-primary tracking-wider"
                    style={{
                      textShadow: "0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--primary) / 0.3)",
                    }}
                    data-testid="text-final-reveal"
                  >
                    {shapeData}
                  </h1>
                </div>
              )}

              {shapeType === "drawing" && (
                <div className="animate-reveal-glow">
                  <div
                    className="w-64 h-64 mx-auto rounded-2xl bg-card border border-primary/30 flex items-center justify-center"
                    style={{
                      boxShadow: "0 0 40px hsl(var(--primary) / 0.4)",
                    }}
                    data-testid="drawing-final-reveal"
                  >
                    <span className="text-6xl">Your Drawing</span>
                  </div>
                </div>
              )}

              {shapeType === "image" && (
                <div className="animate-reveal-glow">
                  <img
                    src={shapeData}
                    alt="Revealed"
                    className="max-w-full max-h-64 mx-auto rounded-2xl border border-primary/30"
                    style={{
                      boxShadow: "0 0 40px hsl(var(--primary) / 0.4)",
                    }}
                    data-testid="img-final-reveal"
                  />
                </div>
              )}

              {stage === "complete" && (
                <div className="space-y-4 animate-slide-up">
                  <p className="text-xl text-muted-foreground">
                    You revealed the secret together!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      size="lg"
                      onClick={onPlayAgain}
                      className="w-full sm:w-auto"
                      data-testid="button-play-again"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Play Again
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleShare}
                      className="w-full sm:w-auto"
                      data-testid="button-share-result"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Result
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
