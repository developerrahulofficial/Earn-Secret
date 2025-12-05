import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { ShapeCreator } from "@/components/game/shape-creator";
import { RoomShare } from "@/components/game/room-share";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

type CreateStep = "shape" | "share" | "waiting";

export default function CreateRoom() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const playerName = params.get("name") || "Player";

  const { room, player, isHost, isConnected, createRoom, setupShape, error } = useWebSocket();
  const { isMuted, toggleMute, playClick } = useSound();
  
  const [step, setStep] = useState<CreateStep>("shape");
  const [shapeData, setShapeData] = useState<{ type: "text" | "drawing" | "image"; data: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isConnected && !room && !isCreating) {
      setIsCreating(true);
      createRoom(playerName);
    }
  }, [isConnected, room, playerName, createRoom, isCreating]);

  useEffect(() => {
    if (room?.player1Id && step === "share") {
      navigate(`/game/${room.code}`);
    }
  }, [room, step, navigate]);

  const handleShapeCreated = (type: "text" | "drawing" | "image", data: string) => {
    playClick();
    setShapeData({ type, data });
    setupShape(type, data);
    setStep("share");
  };

  const handleBack = () => {
    playClick();
    if (step === "share") {
      setStep("shape");
    } else {
      navigate("/");
    }
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={() => navigate("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

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

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {step === "shape" && (
          <ShapeCreator
            onShapeCreated={handleShapeCreated}
            isLoading={!room}
          />
        )}

        {step === "share" && room && (
          <RoomShare
            roomCode={room.code}
            isWaitingForPlayer={!room.player1Id}
          />
        )}
      </main>
    </div>
  );
}
