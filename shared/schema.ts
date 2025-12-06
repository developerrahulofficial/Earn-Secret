import { z } from "zod";

export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type PieceColor = "white" | "black";
export type GameStatus = "waiting" | "active" | "check" | "checkmate" | "stalemate" | "draw";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: string; // e.g., "e2"
  hasMoved: boolean;
}

export interface ChessMove {
  from: string;
  to: string;
  piece: PieceType;
  captured?: PieceType;
  isCheck: boolean;
  isCheckmate: boolean;
  promotion?: PieceType;
  timestamp: number;
}

export interface GameRoom {
  id: string;
  code: string;
  status: GameStatus;
  player1Id: string | null; // White player
  player2Id: string | null; // Black player
  currentTurn: PieceColor;
  pieces: ChessPiece[];
  moveHistory: ChessMove[];
  selectedSquare: string | null;
  validMoves: string[];
  winner: "player1" | "player2" | "draw" | null;
  secret: string; // Encrypted secret message from player 1
  secretRevealed: boolean;
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
  secret: z.string().min(1).max(500),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(1).max(20),
});

export const makeMoveSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  from: z.string().length(2),
  to: z.string().length(2),
  promotion: z.enum(["queen", "rook", "bishop", "knight"]).optional(),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
export type MakeMove = z.infer<typeof makeMoveSchema>;

export type WebSocketMessage = 
  | { type: "register"; playerId: string }
  | { type: "create_room"; playerName: string; secret: string }
  | { type: "room_created"; room: GameRoom; playerId: string }
  | { type: "join_room"; code: string; playerName: string; playerId?: string }
  | { type: "room_joined"; room: GameRoom; playerId: string }
  | { type: "player_joined"; playerId: string }
  | { type: "game_started"; room: GameRoom }
  | { type: "select_square"; roomId: string; playerId: string; square: string }
  | { type: "square_selected"; room: GameRoom; validMoves: string[] }
  | { type: "make_move"; roomId: string; playerId: string; from: string; to: string; promotion?: PieceType }
  | { type: "move_made"; room: GameRoom; move: ChessMove }
  | { type: "invalid_move"; message: string }
  | { type: "game_over"; room: GameRoom; winner: "player1" | "player2" | "draw"; secret?: string }
  | { type: "error"; message: string };

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
