import { useState, useEffect, useRef, useCallback } from "react";
import type { WebSocketMessage, GameRoom, Player, GameType } from "@shared/schema";

interface WebSocketState {
  isConnected: boolean;
  room: GameRoom | null;
  player: Player | null;
  isHost: boolean;
  error: string | null;
}

// Global WebSocket instance that persists across page navigations
let globalWs: WebSocket | null = null;
let globalState: WebSocketState = {
  isConnected: false,
  room: null,
  player: null,
  isHost: false,
  error: null,
};
const stateListeners = new Set<(state: WebSocketState) => void>();

function notifyListeners() {
  stateListeners.forEach(listener => listener(globalState));
}

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>(globalState);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Subscribe to global state changes
  useEffect(() => {
    stateListeners.add(setState);
    setState(globalState);
    return () => {
      stateListeners.delete(setState);
    };
  }, []);

  const connect = useCallback(() => {
    if (globalWs?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host || "localhost:5000";
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log("[WebSocket] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      globalWs = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        globalState = { ...globalState, isConnected: true, error: null };
        notifyListeners();
        
        // Re-register if we have a player ID
        const playerId = sessionStorage.getItem("playerId");
        if (playerId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "register", playerId }));
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        globalState = { ...globalState, isConnected: false };
        notifyListeners();
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        globalState = { ...globalState, error: "Connection failed" };
        notifyListeners();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("[WebSocket] Received:", message.type, message);
          handleMessage(message);
        } catch (err) {
          console.error("[WebSocket] Failed to parse message:", err);
        }
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
      globalState = { ...globalState, error: "Failed to connect" };
      notifyListeners();
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "room_created": {
        if (message.playerId) {
          sessionStorage.setItem("playerId", message.playerId);
        }
        // Create player object from stored data
        const playerName = sessionStorage.getItem("playerName") || "Player";
        const player: Player = {
          id: message.playerId,
          name: playerName,
          roomId: message.room.id,
          isHost: true,
        };
        globalState = {
          ...globalState,
          room: message.room,
          player,
          isHost: true,
          error: null,
        };
        notifyListeners();
        break;
      }

      case "room_joined": {
        if (message.playerId) {
          sessionStorage.setItem("playerId", message.playerId);
        }
        const playerName = sessionStorage.getItem("playerName") || "Player";
        const isHost = message.room.player1Id === message.playerId;
        const player: Player = {
          id: message.playerId,
          name: playerName,
          roomId: message.room.id,
          isHost,
        };
        globalState = {
          ...globalState,
          room: message.room,
          player,
          isHost,
          error: null,
        };
        notifyListeners();
        break;
      }

      case "game_started":
      case "square_selected":
      case "move_made": {
        globalState = {
          ...globalState,
          room: message.room,
        };
        notifyListeners();
        break;
      }

      case "game_over": {
        globalState = {
          ...globalState,
          room: message.room,
        };
        notifyListeners();
        break;
      }

      case "error": {
        globalState = {
          ...globalState,
          error: message.message,
        };
        notifyListeners();
        break;
      }
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (globalWs?.readyState === WebSocket.OPEN) {
      console.log("[WebSocket] Sending:", message.type, message);
      globalWs.send(JSON.stringify(message));
    } else {
      console.error("[WebSocket] Cannot send message, not connected");
    }
  }, []);

  const createRoom = useCallback((playerName: string, secret: string, gameType: GameType = "chess") => {
    sessionStorage.setItem("playerName", playerName);
    sendMessage({ type: "create_room", playerName, secret, gameType });
  }, [sendMessage]);

  const joinRoom = useCallback((code: string, playerName: string) => {
    sessionStorage.setItem("playerName", playerName);
    const playerId = sessionStorage.getItem("playerId");
    sendMessage({ type: "join_room", code, playerName, playerId: playerId || undefined });
  }, [sendMessage]);

  const resetState = useCallback(() => {
    globalState = {
      isConnected: globalState.isConnected,
      room: null,
      player: null,
      isHost: false,
      error: null,
    };
    notifyListeners();
  }, []);

  return {
    ...state,
    sendMessage,
    createRoom,
    joinRoom,
    resetState,
  };
}
