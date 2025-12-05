import { z } from "zod";

export interface Dot {
  id: string;
  x: number;
  y: number;
  revealed: boolean;
  connected: boolean;
  order: number;
  strategyWeight: number;
}

export interface GameRoom {
  id: string;
  code: string;
  status: "waiting" | "setup" | "playing" | "revealing" | "completed";
  player1Id: string | null;
  player2Id: string | null;
  currentTurn: "player1" | "player2";
  dots: Dot[];
  connections: Array<{ from: string; to: string }>;
  shapeType: "text" | "drawing" | "image";
  shapeData: string;
  revealedCount: number;
  totalDots: number;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  roomId: string | null;
  isHost: boolean;
}

export const createRoomSchema = z.object({
  playerName: z.string().min(1).max(20),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(1).max(20),
});

export const setupGameSchema = z.object({
  roomId: z.string(),
  shapeType: z.enum(["text", "drawing", "image"]),
  shapeData: z.string(),
});

export const connectDotSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  dotId: z.string(),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
export type SetupGame = z.infer<typeof setupGameSchema>;

export type WebSocketMessage = 
  | { type: "join_room"; roomCode: string; playerName: string }
  | { type: "room_joined"; room: GameRoom; player: Player; isHost: boolean }
  | { type: "player_joined"; player: Player }
  | { type: "setup_shape"; shapeType: "text" | "drawing" | "image"; shapeData: string }
  | { type: "game_started"; room: GameRoom }
  | { type: "connect_dot"; dotId: string }
  | { type: "dot_connected"; dotId: string; nextDotId: string | null; room: GameRoom }
  | { type: "turn_changed"; currentTurn: "player1" | "player2" }
  | { type: "reveal_started"; room: GameRoom }
  | { type: "game_completed"; room: GameRoom }
  | { type: "error"; message: string }
  | { type: "room_created"; room: GameRoom; player: Player }
  | { type: "ping" }
  | { type: "pong" };

export interface Users {
  id: string;
  username: string;
  password: string;
}

export const users = {
  id: "" as string,
  username: "" as string,
  password: "" as string,
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Users;
