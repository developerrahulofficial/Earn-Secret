import { z } from "zod";

<<<<<<< Updated upstream
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type PieceColor = "white" | "black";
export type GameStatus = "waiting" | "active" | "check" | "checkmate" | "stalemate" | "draw";
=======
export type GameType = "chess" | "connect-four" | "tic-tac-toe";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type PieceColor = "white" | "black";
export type PlayerColor = "red" | "yellow";
export type GameStatus = "waiting" | "active" | "check" | "checkmate" | "stalemate" | "draw" | "won";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
}

export interface ConnectFourMove {
  column: number;
  row: number;
  player: "player1" | "player2";
  timestamp: number;
}

export interface ConnectFourBoard {
  grid: (null | "red" | "yellow")[][]; // 6 rows x 7 columns
  lastMove: { row: number; col: number } | null;
}

export interface TicTacToeMove {
  position: number; // 0-8 for grid positions
  player: "player1" | "player2";
  timestamp: number;
}

export interface TicTacToeBoard {
  grid: (null | "player1" | "player2")[]; // 9 positions (3x3)
  winningLine: number[] | null; // positions of winning line
>>>>>>> Stashed changes
}

export interface GameRoom {
  id: string;
  code: string;
<<<<<<< Updated upstream
  status: GameStatus;
  player1Id: string | null; // White player
  player2Id: string | null; // Black player
  currentTurn: PieceColor;
=======
  gameType: GameType;
  status: GameStatus;
  player1Id: string | null; // White/Red player
  player2Id: string | null; // Black/Yellow player
  currentTurn: "player1" | "player2";
  
  // Chess-specific
>>>>>>> Stashed changes
  pieces: ChessPiece[];
  moveHistory: ChessMove[];
  selectedSquare: string | null;
  validMoves: string[];
<<<<<<< Updated upstream
=======
  
  // Connect Four specific
  connectFourBoard?: ConnectFourBoard;
  connectFourMoves?: ConnectFourMove[];
  
  // Tic Tac Toe specific
  ticTacToeBoard?: TicTacToeBoard;
  ticTacToeMoves?: TicTacToeMove[];
  
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  gameType: z.enum(["chess", "connect-four", "tic-tac-toe"]),
>>>>>>> Stashed changes
});

export const joinRoomSchema = z.object({
  roomCode: z.string().length(6),
  playerName: z.string().min(1).max(20),
});

export const makeMoveSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
<<<<<<< Updated upstream
  from: z.string().length(2),
  to: z.string().length(2),
=======
  from: z.string().length(2).optional(),
  to: z.string().length(2).optional(),
  column: z.number().min(0).max(6).optional(),
  position: z.number().min(0).max(8).optional(),
>>>>>>> Stashed changes
  promotion: z.enum(["queen", "rook", "bishop", "knight"]).optional(),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
export type MakeMove = z.infer<typeof makeMoveSchema>;

export type WebSocketMessage = 
  | { type: "register"; playerId: string }
<<<<<<< Updated upstream
  | { type: "create_room"; playerName: string; secret: string }
=======
  | { type: "create_room"; playerName: string; secret: string; gameType: GameType }
>>>>>>> Stashed changes
  | { type: "room_created"; room: GameRoom; playerId: string }
  | { type: "join_room"; code: string; playerName: string; playerId?: string }
  | { type: "room_joined"; room: GameRoom; playerId: string }
  | { type: "player_joined"; playerId: string }
  | { type: "game_started"; room: GameRoom }
  | { type: "select_square"; roomId: string; playerId: string; square: string }
  | { type: "square_selected"; room: GameRoom; validMoves: string[] }
<<<<<<< Updated upstream
  | { type: "make_move"; roomId: string; playerId: string; from: string; to: string; promotion?: PieceType }
  | { type: "move_made"; room: GameRoom; move: ChessMove }
=======
  | { type: "make_move"; roomId: string; playerId: string; from?: string; to?: string; column?: number; position?: number; promotion?: PieceType }
  | { type: "move_made"; room: GameRoom; move?: ChessMove; connectFourMove?: ConnectFourMove; ticTacToeMove?: TicTacToeMove }
>>>>>>> Stashed changes
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
