import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Crown, Users, ArrowRight, Lock, Grid3x3 } from "lucide-react";
import type { GameType } from "@shared/schema";

export default function Home() {
  const [, navigate] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [secret, setSecret] = useState("");
  const [mode, setMode] = useState<"select" | "game-select" | "create" | "join">("select");
  const [gameType, setGameType] = useState<GameType>("chess");

  const handleCreate = () => {
    if (playerName.trim() && secret.trim()) {
      navigate(`/create?name=${encodeURIComponent(playerName.trim())}&secret=${encodeURIComponent(secret.trim())}&gameType=${gameType}`);
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && joinCode.trim().length === 6) {
      navigate(`/join/${joinCode.trim().toUpperCase()}?name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-end p-3 sm:p-4">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-12 sm:pb-16">
        <div className="text-center mb-6 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 sm:mb-6">
            <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-float" />
          </div>
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent px-4"
            data-testid="text-game-title"
          >
            Secret Stakes Games
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto px-4">
            Play chess or Connect Four with a twist - if Player 2 wins, Player 1's secret is revealed!
          </p>
        </div>

        <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-slide-up">
          {mode === "select" && (
            <>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Your Name
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">How should we call you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                    className="text-center text-base sm:text-lg h-10 sm:h-12"
                    maxLength={20}
                    data-testid="input-player-name"
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="h-auto py-4 sm:py-6 flex-col gap-1 sm:gap-2"
                  onClick={() => setMode("game-select")}
                  disabled={!playerName.trim()}
                  data-testid="button-create-game"
                >
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base">Create Secret</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-auto py-4 sm:py-6 flex-col gap-1 sm:gap-2"
                  onClick={() => setMode("join")}
                  disabled={!playerName.trim()}
                  data-testid="button-join-game"
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base">Join Game</span>
                </Button>
              </div>
            </>
          )}

          {mode === "game-select" && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Choose Your Game
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Select which game you want to play with your secret
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    variant={gameType === "chess" ? "default" : "outline"}
                    className="h-auto py-4 sm:py-6 flex-col gap-1 sm:gap-2"
                    onClick={() => setGameType("chess")}
                  >
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Chess</span>
                  </Button>
                  <Button
                    size="lg"
                    variant={gameType === "connect-four" ? "default" : "outline"}
                    className="h-auto py-4 sm:py-6 flex-col gap-1 sm:gap-2"
                    onClick={() => setGameType("connect-four")}
                  >
                    <Grid3x3 className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Connect Four</span>
                  </Button>
                  <Button
                    size="lg"
                    variant={gameType === "tic-tac-toe" ? "default" : "outline"}
                    className="h-auto py-4 sm:py-6 flex-col gap-1 sm:gap-2 col-span-2"
                    onClick={() => setGameType("tic-tac-toe")}
                  >
                    <Grid3x3 className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-base">Tic Tac Toe</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode("select")}
                    className="text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 text-sm"
                    onClick={() => setMode("create")}
                  >
                    Continue
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === "create" && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Create Your Secret
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Write a secret message. It will only be revealed if Player 2 wins!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Playing <strong className="text-foreground">{gameType === "chess" ? "Chess" : "Connect Four"}</strong> as <strong className="text-foreground">{playerName}</strong>
                </p>
                <Textarea
                  placeholder="Your secret message... (e.g., 'I ate the last cookie!' or 'I have a crush on...')"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.slice(0, 500))}
                  className="min-h-[100px] sm:min-h-[120px] resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{secret.length}/500 characters</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode("game-select")}
                    data-testid="button-back"
                    className="text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 text-sm"
                    onClick={handleCreate}
                    disabled={!secret.trim()}
                    data-testid="button-continue-create"
                  >
                    Create Game
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === "join" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Join a Game
                </CardTitle>
                <CardDescription>
                  Enter the 6-character code from your partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  className="text-center font-mono text-2xl tracking-[0.3em] h-14"
                  maxLength={6}
                  data-testid="input-join-code"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode("select")}
                    data-testid="button-back-join"
                    className="text-sm"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 text-sm"
                    onClick={handleJoin}
                    disabled={joinCode.length !== 6}
                    data-testid="button-join"
                  >
                    Join Game
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <p className="mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground text-center px-4">
          A strategic game with secret stakes
        </p>
      </main>
    </div>
  );
}
