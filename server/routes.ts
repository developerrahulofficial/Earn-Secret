import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  createPlayer,
  getPlayer,
  createRoom,
  joinRoom as joinGameRoom,
  getRoomByCode,
  getRoom,
  getValidMoves,
  makeMove,
  makeConnectFourMove,
  makeTicTacToeMove,
  registerPlayerSocket,
  unregisterPlayerSocket,
  broadcastToRoom,
} from "./game";
import type { WebSocketMessage } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let currentPlayerId: string | null = null;

    ws.on("message", (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case "register": {
            const playerId = message.playerId;
            if (!playerId) return;

            currentPlayerId = playerId;
            registerPlayerSocket(playerId, ws);

            const player = getPlayer(playerId);
            if (player && player.roomId) {
              const room = getRoom(player.roomId);
              if (room) {
                ws.send(JSON.stringify({ type: "room_joined", room, playerId }));
              }
            }
            break;
          }

          case "create_room": {
            const { playerName, secret, gameType } = message;
            if (!playerName || !secret || !gameType) return;

            const player = createPlayer(playerName);
            currentPlayerId = player.id;
            registerPlayerSocket(player.id, ws);

            const room = createRoom(player.id, secret, gameType);
            ws.send(JSON.stringify({ type: "room_created", room, playerId: player.id }));
            break;
          }

          case "join_room": {
            const { code, playerName, playerId } = message;
            if (!code || !playerName) return;

            let player;
            if (playerId) {
              player = getPlayer(playerId);
            }

            if (!player) {
              player = createPlayer(playerName);
            }

            currentPlayerId = player.id;
            registerPlayerSocket(player.id, ws);

            const room = getRoomByCode(code);
            if (!room) {
              ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
              return;
            }

            const joinedRoom = joinGameRoom(room.id, player.id);
            if (!joinedRoom) {
              ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
              return;
            }

            // Send to joining player
            ws.send(JSON.stringify({ type: "room_joined", room: joinedRoom, playerId: player.id }));

            // Broadcast to room
            broadcastToRoom(joinedRoom, {
              type: "game_started",
              room: joinedRoom,
            });
            break;
          }

          case "select_square": {
            const { roomId, playerId, square } = message;
            if (!roomId || !playerId || !square) return;

            const room = getRoom(roomId);
            if (!room) {
              ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
              return;
            }

            const validMoves = getValidMoves(roomId, square);
            room.selectedSquare = square;
            room.validMoves = validMoves;

            ws.send(JSON.stringify({ type: "square_selected", room, validMoves }));
            break;
          }

          case "make_move": {
            const { roomId, playerId, from, to, column, position, promotion } = message;
            if (!roomId || !playerId) return;

            const room = getRoom(roomId);
            if (!room) {
              ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
              return;
            }

            // Handle Tic Tac Toe move
            if (room.gameType === "tic-tac-toe" && position !== undefined) {
              const result = makeTicTacToeMove(roomId, playerId, position);
              if (!result.success) {
                ws.send(JSON.stringify({ type: "invalid_move", message: result.error }));
                return;
              }

              // Check if game is over
              if (result.room!.status === "won" || result.room!.status === "draw") {
                const gameOverMessage = {
                  type: "game_over",
                  room: result.room,
                  winner: result.room!.winner,
                  secret: result.room!.secretRevealed ? result.room!.secret : undefined,
                };
                broadcastToRoom(result.room!, gameOverMessage);
              } else {
                // Broadcast move to both players
                broadcastToRoom(result.room!, {
                  type: "move_made",
                  room: result.room,
                  ticTacToeMove: result.move,
                });
              }
              return;
            }

            // Handle Connect Four move
            if (room.gameType === "connect-four" && column !== undefined) {
              const result = makeConnectFourMove(roomId, playerId, column);
              if (!result.success) {
                ws.send(JSON.stringify({ type: "invalid_move", message: result.error }));
                return;
              }

              // Check if game is over
              if (result.room!.status === "won" || result.room!.status === "draw") {
                const gameOverMessage = {
                  type: "game_over",
                  room: result.room,
                  winner: result.room!.winner,
                  secret: result.room!.secretRevealed ? result.room!.secret : undefined,
                };
                broadcastToRoom(result.room!, gameOverMessage);
              } else {
                // Broadcast move to both players
                broadcastToRoom(result.room!, {
                  type: "move_made",
                  room: result.room,
                  connectFourMove: result.move,
                });
              }
              return;
            }

            // Handle Chess move
            if (room.gameType === "chess" && from && to) {
              const result = makeMove(roomId, playerId, from, to, promotion);
              if (!result.success) {
                ws.send(JSON.stringify({ type: "invalid_move", message: result.message }));
                return;
              }

              // Check if game is over
              if (result.room!.status === "checkmate") {
                const gameOverMessage = {
                  type: "game_over",
                  room: result.room,
                  winner: result.room!.winner,
                  secret: result.room!.secretRevealed ? result.room!.secret : undefined,
                };
                broadcastToRoom(result.room!, gameOverMessage);
              } else {
                // Broadcast move to both players
                broadcastToRoom(result.room!, {
                  type: "move_made",
                  room: result.room,
                  move: result.move,
                });
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (currentPlayerId) {
        unregisterPlayerSocket(currentPlayerId);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
