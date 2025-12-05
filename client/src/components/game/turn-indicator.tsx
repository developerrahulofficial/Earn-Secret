import { cn } from "@/lib/utils";
import { Loader2, Hand } from "lucide-react";

interface TurnIndicatorProps {
  isYourTurn: boolean;
  isConnecting?: boolean;
  opponentName?: string;
}

export function TurnIndicator({
  isYourTurn,
  isConnecting = false,
  opponentName = "Partner",
}: TurnIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-lg transition-all duration-300",
        "bg-card border border-card-border shadow-lg",
        isYourTurn && "ring-2 ring-primary/50"
      )}
      data-testid="turn-indicator"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Connecting...</span>
        </>
      ) : isYourTurn ? (
        <>
          <div className="relative">
            <Hand className="h-5 w-5 text-primary" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-dot-pulse" />
          </div>
          <span>Your Turn</span>
        </>
      ) : (
        <>
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          <span className="text-muted-foreground">{opponentName}'s Turn</span>
        </>
      )}
    </div>
  );
}
