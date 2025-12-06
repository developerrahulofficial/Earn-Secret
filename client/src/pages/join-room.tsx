import { useEffect, useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Users, AlertCircle } from "lucide-react";

export default function JoinRoom() {
  const [, navigate] = useLocation();
  const { code } = useParams<{ code: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const playerName = params.get("name") || "Player";

  const { room, isConnected, joinRoom, error } = useWebSocket();
  const { isMuted, toggleMute } = useSound();
  
  const [hasJoined, setHasJoined] = useState(false);

  // Store player name in sessionStorage
  useEffect(() => {
    if (playerName) {
      sessionStorage.setItem("playerName", playerName);
    }
  }, [playerName]);

  useEffect(() => {
    if (isConnected && code && !hasJoined) {
      setHasJoined(true);
      joinRoom(code.toUpperCase(), playerName);
    }
  }, [isConnected, code, playerName, joinRoom, hasJoined]);

  useEffect(() => {
    if (room && (room.status === "active" || room.status === "check" || room.status === "checkmate" || room.status === "stalemate")) {
      navigate(`/game/${room.code}`);
    }
  }, [room, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-3 sm:space-y-4">
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
              <CardTitle>Couldn't Join</CardTitle>
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
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Joining Game</CardTitle>
            <CardDescription>
              Connecting to room {code?.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
