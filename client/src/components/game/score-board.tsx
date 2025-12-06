import { Card } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  player1Target: number;
  player2Target: number;
  currentTurn: "player1" | "player2";
  isPlayer1: boolean;
  winner: "player1" | "player2" | null;
}

export function ScoreBoard({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  player1Target,
  player2Target,
  currentTurn,
  isPlayer1,
  winner,
}: ScoreBoardProps) {
  const player1Progress = (player1Score / player1Target) * 100;
  const player2Progress = (player2Score / player2Target) * 100;

  return (
    <Card className="p-4 backdrop-blur-sm bg-background/95">
      <div className="space-y-3">
        {/* Player 1 */}
        <div className={cn(
          "space-y-2 pb-3 border-b",
          currentTurn === "player1" && !winner && "ring-2 ring-primary rounded-lg p-2 -m-2"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {winner === "player1" && <Trophy className="h-4 w-4 text-yellow-500" />}
              <span className={cn(
                "font-semibold",
                isPlayer1 ? "text-primary" : "text-foreground"
              )}>
                {player1Name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {player1Score}/{player1Target}
              </span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(player1Progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Player 2 */}
        <div className={cn(
          "space-y-2",
          currentTurn === "player2" && !winner && "ring-2 ring-primary rounded-lg p-2 -m-2"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {winner === "player2" && <Trophy className="h-4 w-4 text-yellow-500" />}
              <span className={cn(
                "font-semibold",
                !isPlayer1 ? "text-primary" : "text-foreground"
              )}>
                {player2Name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {player2Score}/{player2Target}
              </span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(player2Progress, 100)}%` }}
            />
          </div>
        </div>

        {winner && (
          <div className="pt-3 border-t text-center">
            <p className="text-sm font-semibold text-primary">
              {winner === "player1" ? player1Name : player2Name} Wins! 🎉
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
