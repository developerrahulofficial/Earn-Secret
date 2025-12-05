import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Share2, Users, Loader2 } from "lucide-react";

interface RoomShareProps {
  roomCode: string;
  isWaitingForPlayer: boolean;
  onPlayerJoined?: () => void;
}

export function RoomShare({ roomCode, isWaitingForPlayer }: RoomShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/join/${roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Connect the Dots game!",
          text: "I have a secret for you to discover. Join my game!",
          url: shareUrl,
        });
      } catch {
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-display text-2xl">Invite Your Partner</CardTitle>
        <CardDescription>
          Share this code or link to start the game together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Room Code
          </p>
          <p
            className="font-mono text-4xl font-bold tracking-[0.3em] text-primary"
            data-testid="text-room-code"
          >
            {roomCode}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
            data-testid="button-copy-link"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {isWaitingForPlayer && (
          <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Waiting for partner to join...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
