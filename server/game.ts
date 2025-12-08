import { randomUUID } from "crypto";
import type { GameRoom, ChessPiece, Player, PieceType, PieceColor, ChessMove, GameType, ConnectFourMove, ConnectFourBoard, TicTacToeMove, TicTacToeBoard } from "@shared/schema";
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

function initializeConnectFourBoard(): ConnectFourBoard {
  const grid: (null | "red" | "yellow")[][] = [];
  for (let row = 0; row < 6; row++) {
    grid.push(new Array(7).fill(null));
  }
  return { grid, lastMove: null };
}

function initializeTicTacToeBoard(): TicTacToeBoard {
  return { grid: new Array(9).fill(null), winningLine: null };
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

export function createRoom(hostPlayerId: string, secret: string, gameType: GameType = "chess"): GameRoom {
  const code = generateRoomCode();
  const room: GameRoom = {
    id: randomUUID(),
    code,
    gameType,
    status: "waiting",
    player1Id: hostPlayerId,
    player2Id: null,
    currentTurn: "player1",
    pieces: gameType === "chess" ? initializeChessBoard() : [],
    moveHistory: [],
    selectedSquare: null,
    validMoves: [],
    connectFourBoard: gameType === "connect-four" ? initializeConnectFourBoard() : undefined,
    connectFourMoves: gameType === "connect-four" ? [] : undefined,
    ticTacToeBoard: gameType === "tic-tac-toe" ? initializeTicTacToeBoard() : undefined,
    ticTacToeMoves: gameType === "tic-tac-toe" ? [] : undefined,
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
  if (!piece) return [];
  
  // Check if it's the correct player's turn
  const pieceOwner = piece.color === "white" ? "player1" : "player2";
  if (pieceOwner !== room.currentTurn) return [];
  
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
  const currentPlayer = isPlayer1 ? "player1" : "player2";
  if (room.currentTurn !== currentPlayer) {
    return { success: false, message: "Not your turn" };
  }
  
  const expectedColor: PieceColor = isPlayer1 ? "white" : "black";
  
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
  room.currentTurn = isPlayer1 ? "player2" : "player1";
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

// Connect Four game logic
export function makeConnectFourMove(
  roomId: string,
  playerId: string,
  column: number
): { success: boolean; room?: GameRoom; move?: ConnectFourMove; error?: string } {
  const room = rooms.get(roomId);
  if (!room || !room.connectFourBoard) {
    return { success: false, error: "Room not found or not a Connect Four game" };
  }

  if (room.status !== "active") {
    return { success: false, error: "Game is not active" };
  }

  const currentPlayer = room.currentTurn;
  if (
    (currentPlayer === "player1" && playerId !== room.player1Id) ||
    (currentPlayer === "player2" && playerId !== room.player2Id)
  ) {
    return { success: false, error: "Not your turn" };
  }

  if (column < 0 || column > 6) {
    return { success: false, error: "Invalid column" };
  }

  const board = room.connectFourBoard;
  
  // Find the lowest empty row in the column
  let row = -1;
  for (let r = 5; r >= 0; r--) {
    if (board.grid[r][column] === null) {
      row = r;
      break;
    }
  }

  if (row === -1) {
    return { success: false, error: "Column is full" };
  }

  const color = currentPlayer === "player1" ? "red" : "yellow";
  board.grid[row][column] = color;
  board.lastMove = { row, col: column };

  const move: ConnectFourMove = {
    column,
    row,
    player: currentPlayer,
    timestamp: Date.now(),
  };

  if (room.connectFourMoves) {
    room.connectFourMoves.push(move);
  }

  // Check for winner
  const hasWon = checkConnectFourWin(board, row, column, color);
  const isBoardFull = checkConnectFourDraw(board);

  if (hasWon) {
    room.status = "won";
    room.winner = currentPlayer;
    
    // Reveal secret if player2 wins
    if (currentPlayer === "player2") {
      room.secretRevealed = true;
    }
  } else if (isBoardFull) {
    room.status = "draw";
    room.winner = "draw";
  } else {
    room.currentTurn = currentPlayer === "player1" ? "player2" : "player1";
  }

  return { success: true, room, move };
}

function checkConnectFourWin(
  board: ConnectFourBoard,
  row: number,
  col: number,
  color: "red" | "yellow"
): boolean {
  // Check horizontal
  let count = 1;
  for (let c = col - 1; c >= 0 && board.grid[row][c] === color; c--) count++;
  for (let c = col + 1; c < 7 && board.grid[row][c] === color; c++) count++;
  if (count >= 4) return true;

  // Check vertical
  count = 1;
  for (let r = row - 1; r >= 0 && board.grid[r][col] === color; r--) count++;
  for (let r = row + 1; r < 6 && board.grid[r][col] === color; r++) count++;
  if (count >= 4) return true;

  // Check diagonal (top-left to bottom-right)
  count = 1;
  for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board.grid[r][c] === color; r--, c--) count++;
  for (let r = row + 1, c = col + 1; r < 6 && c < 7 && board.grid[r][c] === color; r++, c++) count++;
  if (count >= 4) return true;

  // Check diagonal (top-right to bottom-left)
  count = 1;
  for (let r = row - 1, c = col + 1; r >= 0 && c < 7 && board.grid[r][c] === color; r--, c++) count++;
  for (let r = row + 1, c = col - 1; r < 6 && c >= 0 && board.grid[r][c] === color; r++, c--) count++;
  if (count >= 4) return true;

  return false;
}

function checkConnectFourDraw(board: ConnectFourBoard): boolean {
  // Check if top row is full
  for (let col = 0; col < 7; col++) {
    if (board.grid[0][col] === null) {
      return false;
    }
  }
  return true;
}

// Tic Tac Toe game logic
export function makeTicTacToeMove(
  roomId: string,
  playerId: string,
  position: number
): { success: boolean; room?: GameRoom; move?: TicTacToeMove; error?: string } {
  const room = rooms.get(roomId);
  if (!room || !room.ticTacToeBoard) {
    return { success: false, error: "Room not found or not a Tic Tac Toe game" };
  }

  if (room.status !== "active") {
    return { success: false, error: "Game is not active" };
  }

  const currentPlayer = room.currentTurn;
  if (
    (currentPlayer === "player1" && playerId !== room.player1Id) ||
    (currentPlayer === "player2" && playerId !== room.player2Id)
  ) {
    return { success: false, error: "Not your turn" };
  }

  if (position < 0 || position > 8) {
    return { success: false, error: "Invalid position" };
  }

  const board = room.ticTacToeBoard;
  
  // Check if position is already taken
  if (board.grid[position] !== null) {
    return { success: false, error: "Position already taken" };
  }

  // Store player identifier (player1 or player2) in grid
  board.grid[position] = currentPlayer;

  const move: TicTacToeMove = {
    position,
    player: currentPlayer,
    timestamp: Date.now(),
  };

  if (room.ticTacToeMoves) {
    room.ticTacToeMoves.push(move);
  }

  // Check for winner
  const winResult = checkTicTacToeWin(board, currentPlayer);
  const isDraw = checkTicTacToeDraw(board);

  if (winResult.hasWon) {
    room.status = "won";
    room.winner = currentPlayer;
    board.winningLine = winResult.line;
    
    // Reveal secret if player2 wins
    if (currentPlayer === "player2") {
      room.secretRevealed = true;
    }
  } else if (isDraw) {
    room.status = "draw";
    room.winner = "draw";
  } else {
    room.currentTurn = currentPlayer === "player1" ? "player2" : "player1";
  }

  return { success: true, room, move };
}

function checkTicTacToeWin(
  board: TicTacToeBoard,
  player: "player1" | "player2"
): { hasWon: boolean; line: number[] | null } {
  const winningCombinations = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left to bottom-right
    [2, 4, 6], // diagonal top-right to bottom-left
  ];

  for (const combination of winningCombinations) {
    if (
      board.grid[combination[0]] === player &&
      board.grid[combination[1]] === player &&
      board.grid[combination[2]] === player
    ) {
      return { hasWon: true, line: combination };
    }
  }

  return { hasWon: false, line: null };
}

function checkTicTacToeDraw(board: TicTacToeBoard): boolean {
  return board.grid.every(cell => cell !== null);
}

