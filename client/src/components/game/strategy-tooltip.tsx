import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIPS = [
  "Some dots reveal more than others...",
  "Edge dots might show the shape early!",
  "Center dots keep the mystery longer.",
  "Watch for patterns as dots connect.",
  "The shape is hidden in plain sight!",
];

interface StrategyTooltipProps {
  className?: string;
}

export function StrategyTooltip({ className }: StrategyTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    if (hasBeenDismissed) return;

    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(showTimeout);
  }, [hasBeenDismissed, tipIndex]);

  useEffect(() => {
    if (!isVisible) return;

    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearTimeout(hideTimeout);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 max-w-xs rounded-xl px-4 py-3",
        "bg-card/90 backdrop-blur-sm border border-card-border shadow-lg",
        "animate-slide-up",
        className
      )}
      data-testid="strategy-tooltip"
    >
      <Lightbulb className="h-5 w-5 text-primary flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{TIPS[tipIndex]}</p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={handleDismiss}
        data-testid="button-dismiss-tooltip"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
