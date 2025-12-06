import { randomUUID } from "crypto";
import type { GameRoom, ChessPiece, Player, PieceType, PieceColor, ChessMove } from "@shared/schema";
import { WebSocket } from "ws";

const rooms = new Map<string, GameRoom>();
const players = new Map<string, Player>();
const playerSockets = new Map<string, WebSocket>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function initializeChessBoard(): ChessPiece[] {
  const pieces: ChessPiece[] = [];
  
  // Black pieces (top of board)
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  for (let i = 0; i < 8; i++) {
    const file = String.fromCharCode(97 + i); // a-h
    pieces.push({ type: backRow[i], color: "black", position: `${file}8`, hasMoved: false });
    pieces.push({ type: "pawn", color: "black", position: `${file}7`, hasMoved: false });
  }
  
  // White pieces (bottom of board)
  for (let i = 0; i < 8; i++) {
    const file = String.fromCharCode(97 + i);
    pieces.push({ type: "pawn", color: "white", position: `${file}2`, hasMoved: false });
    pieces.push({ type: backRow[i], color: "white", position: `${file}1`, hasMoved: false });
  }
  
  return pieces;
}

export function createPlayer(name: string): Player {
  const player: Player = {
    id: randomUUID(),
    name,
    roomId: null,
    isHost: false,
  };
  players.set(player.id, player);
  return player;
}

export function getPlayer(id: string): Player | undefined {
  return players.get(id);
}

export function registerPlayerSocket(playerId: string, socket: WebSocket): void {
  playerSockets.set(playerId, socket);
}

export function unregisterPlayerSocket(playerId: string): void {
  playerSockets.delete(playerId);
}

export function createRoom(hostPlayerId: string, secret: string): GameRoom {
  const code = generateRoomCode();
  const room: GameRoom = {
    id: randomUUID(),
    code,
    status: "waiting",
    player1Id: hostPlayerId,
    player2Id: null,
    currentTurn: "white",
    pieces: initializeChessBoard(),
    moveHistory: [],
    selectedSquare: null,
    validMoves: [],
    winner: null,
    secret,
    secretRevealed: false,
    createdAt: Date.now(),
  };

  rooms.set(room.id, room);

  const player = players.get(hostPlayerId);
  if (player) {
    player.roomId = room.id;
    player.isHost = true;
  }

  return room;
}

export function getRoomByCode(code: string): GameRoom | undefined {
  return Array.from(rooms.values()).find((room) => room.code === code);
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, playerId: string): GameRoom | null {
  const room = rooms.get(roomId);
  if (!room || room.player2Id) return null;

  room.player2Id = playerId;
  room.status = "active";

  const player = players.get(playerId);
  if (player) {
    player.roomId = roomId;
  }

  return room;
}

function squareToCoords(square: string): [number, number] {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, etc.
  return [file, rank];
}

function coordsToSquare(file: number, rank: number): string {
  return String.fromCharCode(97 + file) + (rank + 1);
}

function getPieceAt(pieces: ChessPiece[], square: string): ChessPiece | null {
  return pieces.find(p => p.position === square) || null;
}

function isSquareUnderAttack(pieces: ChessPiece[], square: string, byColor: PieceColor): boolean {
  // Check if any piece of 'byColor' can attack 'square'
  for (const piece of pieces) {
    if (piece.color === byColor) {
      const moves = getValidMovesForPiece(pieces, piece, true);
      if (moves.includes(square)) {
        return true;
      }
    }
  }
  return false;
}

function getValidMovesForPiece(pieces: ChessPiece[], piece: ChessPiece, ignoreCheck: boolean = false): string[] {
  const moves: string[] = [];
  const [file, rank] = squareToCoords(piece.position);

  const addMoveIfValid = (newFile: number, newRank: number, canCapture: boolean = true): boolean => {
    if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) return false;
    const targetSquare = coordsToSquare(newFile, newRank);
    const targetPiece = getPieceAt(pieces, targetSquare);
    
    if (targetPiece) {
      if (canCapture && targetPiece.color !== piece.color) {
        moves.push(targetSquare);
      }
      return false; // Blocked
    }
    moves.push(targetSquare);
    return true; // Can continue in this direction
  };

  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1;
      const startRank = piece.color === "white" ? 1 : 6;
      
      // Forward move
      if (!getPieceAt(pieces, coordsToSquare(file, rank + direction))) {
        moves.push(coordsToSquare(file, rank + direction));
        
        // Double move from start
        if (rank === startRank && !getPieceAt(pieces, coordsToSquare(file, rank + 2 * direction))) {
          moves.push(coordsToSquare(file, rank + 2 * direction));
        }
      }
      
      // Captures
      for (const df of [-1, 1]) {
        const captureSquare = coordsToSquare(file + df, rank + direction);
        const target = getPieceAt(pieces, captureSquare);
        if (target && target.color !== piece.color) {
          moves.push(captureSquare);
        }
      }
      break;
    }

    case "knight": {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [df, dr] of knightMoves) {
        addMoveIfValid(file + df, rank + dr);
      }
      break;
    }

    case "bishop": {
      for (const [df, dr] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(file + df * i, rank + dr * i)) break;
        }
      }
      break;
    }

    case "rook": {
      for (const [df, dr] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(file + df * i, rank + dr * i)) break;
        }
      }
      break;
    }

    case "queen": {
      for (const [df, dr] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(file + df * i, rank + dr * i)) break;
        }
      }
      break;
    }

    case "king": {
      for (const [df, dr] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        addMoveIfValid(file + df, rank + dr);
      }
      
      // Castling
      if (!piece.hasMoved && !ignoreCheck) {
        // Kingside
        const kingsideRook = pieces.find(p => 
          p.type === "rook" && p.color === piece.color && 
          p.position === coordsToSquare(7, rank) && !p.hasMoved
        );
        if (kingsideRook && 
            !getPieceAt(pieces, coordsToSquare(5, rank)) &&
            !getPieceAt(pieces, coordsToSquare(6, rank)) &&
            !isSquareUnderAttack(pieces, piece.position, piece.color === "white" ? "black" : "white") &&
            !isSquareUnderAttack(pieces, coordsToSquare(5, rank), piece.color === "white" ? "black" : "white")) {
          moves.push(coordsToSquare(6, rank));
        }
        
        // Queenside
        const queensideRook = pieces.find(p => 
          p.type === "rook" && p.color === piece.color && 
          p.position === coordsToSquare(0, rank) && !p.hasMoved
        );
        if (queensideRook &&
            !getPieceAt(pieces, coordsToSquare(1, rank)) &&
            !getPieceAt(pieces, coordsToSquare(2, rank)) &&
            !getPieceAt(pieces, coordsToSquare(3, rank)) &&
            !isSquareUnderAttack(pieces, piece.position, piece.color === "white" ? "black" : "white") &&
            !isSquareUnderAttack(pieces, coordsToSquare(3, rank), piece.color === "white" ? "black" : "white")) {
          moves.push(coordsToSquare(2, rank));
        }
      }
      break;
    }
  }

  // Filter out moves that would leave king in check
  if (!ignoreCheck) {
    return moves.filter(move => !wouldBeInCheck(pieces, piece, move));
  }

  return moves;
}

function wouldBeInCheck(pieces: ChessPiece[], piece: ChessPiece, toSquare: string): boolean {
  // Simulate the move
  const simulatedPieces = pieces.map(p => ({ ...p }));
  const movingPiece = simulatedPieces.find(p => p.position === piece.position);
  const capturedPieceIndex = simulatedPieces.findIndex(p => p.position === toSquare);
  
  if (!movingPiece) return true;
  
  movingPiece.position = toSquare;
  if (capturedPieceIndex !== -1) {
    simulatedPieces.splice(capturedPieceIndex, 1);
  }
  
  // Find king
  const king = simulatedPieces.find(p => p.type === "king" && p.color === piece.color);
  if (!king) return true;
  
  return isSquareUnderAttack(simulatedPieces, king.position, piece.color === "white" ? "black" : "white");
}

export function getValidMoves(roomId: string, square: string): string[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  
  const piece = getPieceAt(room.pieces, square);
  if (!piece || piece.color !== room.currentTurn) return [];
  
  return getValidMovesForPiece(room.pieces, piece);
}

export function makeMove(
  roomId: string,
  playerId: string,
  from: string,
  to: string,
  promotion?: PieceType
): { success: boolean; message?: string; room?: GameRoom; move?: ChessMove } {
  const room = rooms.get(roomId);
  if (!room) return { success: false, message: "Room not found" };
  
  // Check if it's this player's turn
  const isPlayer1 = room.player1Id === playerId;
  const expectedColor: PieceColor = isPlayer1 ? "white" : "black";
  if (room.currentTurn !== expectedColor) {
    return { success: false, message: "Not your turn" };
  }
  
  const piece = getPieceAt(room.pieces, from);
  if (!piece || piece.color !== expectedColor) {
    return { success: false, message: "Invalid piece selection" };
  }
  
  const validMoves = getValidMovesForPiece(room.pieces, piece);
  if (!validMoves.includes(to)) {
    return { success: false, message: "Invalid move" };
  }
  
  // Execute move
  const capturedPiece = getPieceAt(room.pieces, to);
  piece.position = to;
  piece.hasMoved = true;
  
  if (capturedPiece) {
    const index = room.pieces.indexOf(capturedPiece);
    room.pieces.splice(index, 1);
  }
  
  // Handle castling
  if (piece.type === "king" && Math.abs(squareToCoords(from)[0] - squareToCoords(to)[0]) === 2) {
    const [toFile] = squareToCoords(to);
    const [fromFile, rank] = squareToCoords(from);
    if (toFile > fromFile) {
      // Kingside
      const rook = getPieceAt(room.pieces, coordsToSquare(7, rank));
      if (rook) rook.position = coordsToSquare(5, rank);
    } else {
      // Queenside
      const rook = getPieceAt(room.pieces, coordsToSquare(0, rank));
      if (rook) rook.position = coordsToSquare(3, rank);
    }
  }
  
  // Handle pawn promotion
  if (piece.type === "pawn") {
    const [, toRank] = squareToCoords(to);
    if (toRank === 0 || toRank === 7) {
      piece.type = promotion || "queen";
    }
  }
  
  // Check for check/checkmate
  const opponentColor: PieceColor = expectedColor === "white" ? "black" : "white";
  const opponentKing = room.pieces.find(p => p.type === "king" && p.color === opponentColor);
  const isCheck = opponentKing ? isSquareUnderAttack(room.pieces, opponentKing.position, expectedColor) : false;
  
  let isCheckmate = false;
  if (isCheck) {
    // Check if opponent has any valid moves
    const hasValidMove = room.pieces
      .filter(p => p.color === opponentColor)
      .some(p => getValidMovesForPiece(room.pieces, p).length > 0);
    
    if (!hasValidMove) {
      isCheckmate = true;
      room.status = "checkmate";
      room.winner = isPlayer1 ? "player1" : "player2";
      
      // Reveal secret if player 2 wins
      if (!isPlayer1) {
        room.secretRevealed = true;
      }
    } else {
      room.status = "check";
    }
  }
  
  const move: ChessMove = {
    from,
    to,
    piece: piece.type,
    captured: capturedPiece?.type,
    isCheck,
    isCheckmate,
    promotion,
    timestamp: Date.now(),
  };
  
  room.moveHistory.push(move);
  room.currentTurn = opponentColor;
  room.selectedSquare = null;
  room.validMoves = [];
  
  if (room.status !== "checkmate") {
    room.status = isCheck ? "check" : "active";
  }
  
  return { success: true, room, move };
}

export function getPlayersInRoom(room: GameRoom): Player[] {
  const result: Player[] = [];
  if (room.player1Id) {
    const p1 = players.get(room.player1Id);
    if (p1) result.push(p1);
  }
  if (room.player2Id) {
    const p2 = players.get(room.player2Id);
    if (p2) result.push(p2);
  }
  return result;
}

export function broadcastToRoom(room: GameRoom, message: unknown, excludePlayerId?: string): void {
  const roomPlayers = getPlayersInRoom(room);
  roomPlayers.forEach((player) => {
    if (excludePlayerId && player.id === excludePlayerId) return;
    const socket = playerSockets.get(player.id);
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify(message));
    }
  });
}
