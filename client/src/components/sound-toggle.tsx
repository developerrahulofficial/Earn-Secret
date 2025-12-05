import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/use-sound";

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export function SoundToggle({ isMuted, onToggle }: SoundToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      data-testid="button-sound-toggle"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
