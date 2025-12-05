import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PlayerAvatarsProps {
  player1Name?: string;
  player2Name?: string;
  currentTurn: "player1" | "player2";
  isPlayer1Connected: boolean;
  isPlayer2Connected: boolean;
}

export function PlayerAvatars({
  player1Name = "Player 1",
  player2Name = "Player 2",
  currentTurn,
  isPlayer1Connected,
  isPlayer2Connected,
}: PlayerAvatarsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3" data-testid="player-avatars">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
          currentTurn === "player1" && "bg-primary/10 ring-2 ring-primary/50"
        )}
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              isPlayer1Connected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {getInitials(player1Name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "text-sm font-medium",
            !isPlayer1Connected && "text-muted-foreground"
          )}
          data-testid="text-player1-name"
        >
          {player1Name}
        </span>
      </div>

      <div className="text-muted-foreground text-sm">vs</div>

      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
          currentTurn === "player2" && "bg-primary/10 ring-2 ring-primary/50"
        )}
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              isPlayer2Connected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {getInitials(player2Name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "text-sm font-medium",
            !isPlayer2Connected && "text-muted-foreground"
          )}
          data-testid="text-player2-name"
        >
          {player2Name}
        </span>
      </div>
    </div>
  );
}
