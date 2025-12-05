import { useCallback, useRef, useState } from "react";

const SOUNDS = {
  click: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGwyHDqS0NvRnUkRNZjW27OJOgQxldi7oXpYJj2e1s+xhE8iO5rY1LiGPgItl9jXwY1FGDyW1ta4jkYUQZjU0rmMQRBFm9LVsIdACkuY0dfNj0UORZrTz7iHQg5Km9DVxI9FDEab0dS+ikMOS5vP1cONQg9Ims7UwI9EDUqa0NfDjUIQRZnP1L+PRA5KmtDWwY5DEUmYz9XAjkMPSJnP1cGNQhBImc/VwI1DEkiaz9W/jUMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1b+OQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImM/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMR",
  connect: "data:audio/wav;base64,UklGRpIHAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YW4HAACBhYqFbF1fdJivrJBhNjVgodDbsGwyHDqS0NvRnUkRNZjW27OJOgQxldi7oXpYJj2e1s+xhE8iO5rY1LiGPgItl9jXwY1FGDyW1ta4jkYUQZjU0rmMQRBFm9LVsIdACkuY0dfNj0UORZrTz7iHQg5Km9DVxI9FDEab0dS+ikMOS5vP1cONQg9Ims7UwI9EDUqa0NfDjUIQRZnP1L+PRA5KmtDWwY5DEUmYz9XAjkMPSJnP1cGNQhBImc/VwI1DEkiaz9W/jUMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1b+OQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImM/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMR",
  reveal: "data:audio/wav;base64,UklGRqAIAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXwIAACBhYqFbF1fdJivrJBhNjVgodDbsGwyHDqS0NvRnUkRNZjW27OJOgQxldi7oXpYJj2e1s+xhE8iO5rY1LiGPgItl9jXwY1FGDyW1ta4jkYUQZjU0rmMQRBFm9LVsIdACkuY0dfNj0UORZrTz7iHQg5Km9DVxI9FDEab0dS+ikMOS5vP1cONQg9Ims7UwI9EDUqa0NfDjUIQRZnP1L+PRA5KmtDWwY5DEUmYz9XAjkMPSJnP1cGNQhBImc/VwI1DEkiaz9W/jUMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1b+OQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImM/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMR",
  complete: "data:audio/wav;base64,UklGRrAJAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwJAACBhYqFbF1fdJivrJBhNjVgodDbsGwyHDqS0NvRnUkRNZjW27OJOgQxldi7oXpYJj2e1s+xhE8iO5rY1LiGPgItl9jXwY1FGDyW1ta4jkYUQZjU0rmMQRBFm9LVsIdACkuY0dfNj0UORZrTz7iHQg5Km9DVxI9FDEab0dS+ikMOS5vP1cONQg9Ims7UwI9EDUqa0NfDjUIQRZnP1L+PRA5KmtDWwY5DEUmYz9XAjkMPSJnP1cGNQhBImc/VwI1DEkiaz9W/jUMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMRSJnP1b+OQxFImc/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImM/VwI5DEUiZz9XAjkMRSJnP1cCOQxFImc/VwI5DEUiZz9XAjkMR",
};

export function useSound() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sound-muted") === "true";
    }
    return false;
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    if (isMuted) return;
    
    try {
      const audio = new Audio(SOUNDS[soundName]);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // Silently fail if audio can't play
    }
  }, [isMuted]);

  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playConnect = useCallback(() => playSound("connect"), [playSound]);
  const playReveal = useCallback(() => playSound("reveal"), [playSound]);
  const playComplete = useCallback(() => playSound("complete"), [playSound]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("sound-muted", String(newValue));
      return newValue;
    });
  }, []);

  return {
    isMuted,
    toggleMute,
    playClick,
    playConnect,
    playReveal,
    playComplete,
  };
}
