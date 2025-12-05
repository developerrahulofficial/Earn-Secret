import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { GameCanvas } from "@/components/game/game-canvas";
import { TurnIndicator } from "@/components/game/turn-indicator";
import { ProgressRing } from "@/components/game/progress-ring";
import { StrategyTooltip } from "@/components/game/strategy-tooltip";
import { PlayerAvatars } from "@/components/game/player-avatars";
import { RevealAnimation } from "@/components/game/reveal-animation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Game() {
  const [, navigate] = useLocation();
  const { code } = useParams<{ code: string }>();

  const { room, player, isHost, isConnected, joinRoom, connectDot, resetState, error } = useWebSocket();
  const { isMuted, toggleMute, playClick, playConnect, playReveal, playComplete } = useSound();

  const [hasJoined, setHasJoined] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (isConnected && code && !hasJoined && !room) {
      setHasJoined(true);
      const storedName = sessionStorage.getItem("playerName") || "Player";
      joinRoom(code.toUpperCase(), storedName);
    }
  }, [isConnected, code, hasJoined, room, joinRoom]);

  useEffect(() => {
    if (room?.status === "revealing" && !isRevealing) {
      setIsRevealing(true);
      playReveal();
    }
    if (room?.status === "completed") {
      playComplete();
    }
  }, [room?.status, isRevealing, playReveal, playComplete]);

  const handleDotClick = (dotId: string) => {
    if (!room || !player) return;
    if (room.status !== "playing") return;
    
    const isPlayer1 = room.player1Id === player.id;
    const isMyTurn = 
      (room.currentTurn === "player1" && isPlayer1) ||
      (room.currentTurn === "player2" && !isPlayer1);

    if (!isMyTurn) return;

    playConnect();
    connectDot(dotId);
  };

  const handlePlayAgain = () => {
    resetState();
    navigate("/");
  };

  const handleBack = () => {
    playClick();
    resetState();
    navigate("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={handleBack}
                data-testid="button-go-home"
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = player && room.player1Id === player.id;
  const isMyTurn = player && (
    (room.currentTurn === "player1" && isPlayer1) ||
    (room.currentTurn === "player2" && !isPlayer1)
  );

  const progress = room.totalDots > 0 
    ? (room.revealedCount / room.totalDots) * 100 
    : 0;

  const player1Name = isPlayer1 ? "You" : "Partner";
  const player2Name = isPlayer1 ? "Partner" : "You";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="hidden sm:block">
          <PlayerAvatars
            player1Name={player1Name}
            player2Name={player2Name}
            currentTurn={room.currentTurn}
            isPlayer1Connected={!!room.player1Id}
            isPlayer2Connected={!!room.player2Id}
          />
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-help">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">
                Take turns clicking dots to reveal them. Connect dots to uncover the hidden shape!
              </p>
            </TooltipContent>
          </Tooltip>
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <TurnIndicator
            isYourTurn={!!isMyTurn}
            opponentName="Partner"
          />
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ProgressRing progress={progress} />
        </div>

        <div className="w-full h-full p-4 pt-20">
          <GameCanvas
            dots={room.dots}
            connections={room.connections}
            onDotClick={handleDotClick}
            isYourTurn={!!isMyTurn && room.status === "playing"}
            isRevealing={isRevealing || room.status === "revealing" || room.status === "completed"}
            revealedShape={room.shapeData}
            shapeType={room.shapeType}
          />
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <StrategyTooltip />
        </div>

        <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2">
          <PlayerAvatars
            player1Name={player1Name}
            player2Name={player2Name}
            currentTurn={room.currentTurn}
            isPlayer1Connected={!!room.player1Id}
            isPlayer2Connected={!!room.player2Id}
          />
        </div>
      </main>

      <RevealAnimation
        isActive={isRevealing || room.status === "revealing" || room.status === "completed"}
        shapeType={room.shapeType}
        shapeData={room.shapeData}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
