import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { RoomShare } from "@/components/game/room-share";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { GameType } from "@shared/schema";

export default function CreateRoom() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const playerName = params.get("name") || "Player";
  const secret = params.get("secret") || "";
  const gameType = (params.get("gameType") as GameType) || "chess";

  const { room, player, isHost, isConnected, createRoom, error } = useWebSocket();
  const { playClick } = useSound();
  
  const [isCreating, setIsCreating] = useState(false);

  // Store player name in sessionStorage
  useEffect(() => {
    if (playerName) {
      sessionStorage.setItem("playerName", playerName);
    }
  }, [playerName]);

  useEffect(() => {
    if (isConnected && !room && !isCreating && secret) {
      setIsCreating(true);
      createRoom(playerName, secret, gameType);
    }
  }, [isConnected, room, playerName, secret, gameType, createRoom, isCreating]);

  useEffect(() => {
    if (room?.player2Id && room?.status === "active") {
      // Game has started, navigate to game page
      navigate(`/game/${room.code}`);
    }
  }, [room?.player2Id, room?.status, room?.code, navigate]);

  const handleBack = () => {
    playClick();
    navigate("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-sm sm:text-base text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-3 sm:px-4">
        <Card className="max-w-md w-full border-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-500 text-base sm:text-lg">Connection Error</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} variant="outline" className="w-full text-sm">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
          <p className="text-muted-foreground">Creating room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Packet Delivery - Waiting...</CardTitle>
              <CardDescription>Share the room code to start playing</CardDescription>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <SoundToggle />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RoomShare roomCode={room.code} />
          <Button onClick={handleBack} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
