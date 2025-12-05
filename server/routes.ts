import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  createPlayer,
  createRoom,
  getRoom,
  joinRoom,
  setupGame,
  startGame,
  connectDot,
  setPlayerSocket,
  removePlayerSocket,
  broadcastToRoom,
  getPlayer,
} from "./game";
import type { WebSocketMessage } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let currentPlayerId: string | null = null;
    let currentRoomCode: string | null = null;

    ws.on("message", (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error("Failed to parse message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (currentPlayerId) {
        removePlayerSocket(currentPlayerId);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    function handleMessage(socket: WebSocket, message: WebSocketMessage) {
      switch (message.type) {
        case "join_room": {
          const { roomCode, playerName } = message;
          const player = createPlayer(playerName);
          currentPlayerId = player.id;
          setPlayerSocket(player.id, socket as unknown as WebSocket);

          if (!roomCode || roomCode === "") {
            const room = createRoom(player);
            currentRoomCode = room.code;
            socket.send(JSON.stringify({
              type: "room_created",
              room,
              player,
            }));
          } else {
            const room = joinRoom(roomCode, player);
            if (!room) {
              socket.send(JSON.stringify({
                type: "error",
                message: "Room not found or full",
              }));
              return;
            }
            currentRoomCode = room.code;

            socket.send(JSON.stringify({
              type: "room_joined",
              room,
              player,
              isHost: false,
            }));

            broadcastToRoom(room, {
              type: "player_joined",
              player,
            }, player.id);

            if (room.player1Id && room.player2Id && room.status === "setup") {
              const startedRoom = startGame(room.code);
              if (startedRoom) {
                broadcastToRoom(startedRoom, {
                  type: "game_started",
                  room: startedRoom,
                });
              }
            }
          }
          break;
        }

        case "setup_shape": {
          if (!currentRoomCode || !currentPlayerId) {
            socket.send(JSON.stringify({
              type: "error",
              message: "Not in a room",
            }));
            return;
          }

          const { shapeType, shapeData } = message;
          const room = setupGame(currentRoomCode, shapeType, shapeData);
          
          if (!room) {
            socket.send(JSON.stringify({
              type: "error",
              message: "Failed to setup game",
            }));
            return;
          }

          const player = getPlayer(currentPlayerId);

          socket.send(JSON.stringify({
            type: "room_joined",
            room,
            player: player || { id: currentPlayerId, name: "Host", roomId: room.id, isHost: true },
            isHost: true,
          }));

          if (room.player1Id && room.player2Id) {
            const startedRoom = startGame(room.code);
            if (startedRoom) {
              broadcastToRoom(startedRoom, {
                type: "game_started",
                room: startedRoom,
              });
            }
          }
          break;
        }

        case "connect_dot": {
          if (!currentRoomCode || !currentPlayerId) {
            socket.send(JSON.stringify({
              type: "error",
              message: "Not in a game",
            }));
            return;
          }

          const room = getRoom(currentRoomCode);
          if (!room || room.status !== "playing") {
            socket.send(JSON.stringify({
              type: "error",
              message: "Game not in playing state",
            }));
            return;
          }

          const result = connectDot(currentRoomCode, message.dotId, currentPlayerId);
          
          if (!result) {
            socket.send(JSON.stringify({
              type: "error",
              message: "Invalid move",
            }));
            return;
          }

          const { room: updatedRoom, nextDotId } = result;

          broadcastToRoom(updatedRoom, {
            type: "dot_connected",
            dotId: message.dotId,
            nextDotId,
            room: updatedRoom,
          });

          if (updatedRoom.status === "revealing") {
            setTimeout(() => {
              const currentRoom = getRoom(currentRoomCode!);
              if (currentRoom) {
                broadcastToRoom(currentRoom, {
                  type: "reveal_started",
                  room: currentRoom,
                });

                setTimeout(() => {
                  const finalRoom = getRoom(currentRoomCode!);
                  if (finalRoom) {
                    finalRoom.status = "completed";
                    broadcastToRoom(finalRoom, {
                      type: "game_completed",
                      room: finalRoom,
                    });
                  }
                }, 6000);
              }
            }, 500);
          }
          break;
        }

        case "ping": {
          socket.send(JSON.stringify({ type: "pong" }));
          break;
        }
      }
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
