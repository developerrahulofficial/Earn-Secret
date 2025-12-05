import { useState, useEffect, useRef, useCallback } from "react";
import type { WebSocketMessage, GameRoom, Player } from "@shared/schema";

interface WebSocketState {
  isConnected: boolean;
  room: GameRoom | null;
  player: Player | null;
  isHost: boolean;
  error: string | null;
}

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    room: null,
    player: null,
    isHost: false,
    error: null,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, error: "Connection failed" }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch {
        console.error("Failed to parse message");
      }
    };
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "room_created":
        setState((prev) => ({
          ...prev,
          room: message.room,
          player: message.player,
          isHost: true,
          error: null,
        }));
        break;
      case "room_joined":
        setState((prev) => ({
          ...prev,
          room: message.room,
          player: message.player,
          isHost: message.isHost,
          error: null,
        }));
        break;
      case "player_joined":
        setState((prev) => {
          if (!prev.room) return prev;
          return {
            ...prev,
            room: {
              ...prev.room,
              player2Id: message.player.id,
            },
          };
        });
        break;
      case "game_started":
        setState((prev) => ({
          ...prev,
          room: message.room,
        }));
        break;
      case "dot_connected":
        setState((prev) => ({
          ...prev,
          room: message.room,
        }));
        break;
      case "turn_changed":
        setState((prev) => ({
          ...prev,
          room: prev.room ? { ...prev.room, currentTurn: message.currentTurn } : prev.room,
        }));
        break;
      case "reveal_started":
        setState((prev) => ({
          ...prev,
          room: message.room,
        }));
        break;
      case "game_completed":
        setState((prev) => ({
          ...prev,
          room: message.room,
        }));
        break;
      case "error":
        setState((prev) => ({ ...prev, error: message.message }));
        break;
      case "pong":
        break;
    }
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createRoom = useCallback((playerName: string) => {
    send({ type: "join_room", roomCode: "", playerName });
  }, [send]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    send({ type: "join_room", roomCode, playerName });
  }, [send]);

  const setupShape = useCallback((shapeType: "text" | "drawing" | "image", shapeData: string) => {
    send({ type: "setup_shape", shapeType, shapeData });
  }, [send]);

  const connectDot = useCallback((dotId: string) => {
    send({ type: "connect_dot", dotId });
  }, [send]);

  useEffect(() => {
    connect();
    
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ type: "ping" });
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect, send]);

  const resetState = useCallback(() => {
    setState({
      isConnected: state.isConnected,
      room: null,
      player: null,
      isHost: false,
      error: null,
    });
  }, [state.isConnected]);

  return {
    ...state,
    createRoom,
    joinRoom,
    setupShape,
    connectDot,
    resetState,
  };
}
