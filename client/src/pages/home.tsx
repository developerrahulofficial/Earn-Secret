import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, Users, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "join">("select");

  const handleCreate = () => {
    if (playerName.trim()) {
      navigate(`/create?name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && joinCode.trim().length === 6) {
      navigate(`/join/${joinCode.trim().toUpperCase()}?name=${encodeURIComponent(playerName.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-end p-4">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Heart className="h-10 w-10 text-primary animate-float" />
          </div>
          <h1
            className="font-display text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
            data-testid="text-game-title"
          >
            Connect the Dots
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Reveal a secret together, one dot at a time
          </p>
        </div>

        <div className="w-full max-w-md space-y-6 animate-slide-up">
          {mode === "select" && (
            <>
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Your Name
                  </CardTitle>
                  <CardDescription>How should we call you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                    className="text-center text-lg h-12"
                    maxLength={20}
                    data-testid="input-player-name"
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => setMode("create")}
                  disabled={!playerName.trim()}
                  data-testid="button-create-game"
                >
                  <Sparkles className="h-6 w-6" />
                  <span className="text-base">Create Secret</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => setMode("join")}
                  disabled={!playerName.trim()}
                  data-testid="button-join-game"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-base">Join Game</span>
                </Button>
              </div>
            </>
          )}

          {mode === "create" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create a Secret
                </CardTitle>
                <CardDescription>
                  You'll create a hidden shape for your partner to discover
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Playing as <strong className="text-foreground">{playerName}</strong>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMode("select")}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreate}
                    data-testid="button-continue-create"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
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
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleJoin}
                    disabled={joinCode.length !== 6}
                    data-testid="button-join"
                  >
                    Join Game
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <p className="mt-12 text-sm text-muted-foreground text-center">
          A game of connection and discovery
        </p>
      </main>
    </div>
  );
}
