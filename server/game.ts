import { randomUUID } from "crypto";
import type { GameRoom, Dot, Player } from "@shared/schema";

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

export function setPlayerSocket(playerId: string, socket: WebSocket): void {
  playerSockets.set(playerId, socket);
}

export function getPlayerSocket(playerId: string): WebSocket | undefined {
  return playerSockets.get(playerId);
}

export function removePlayerSocket(playerId: string): void {
  playerSockets.delete(playerId);
}

export function createRoom(hostPlayer: Player): GameRoom {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const room: GameRoom = {
    id: randomUUID(),
    code,
    status: "waiting",
    player1Id: hostPlayer.id,
    player2Id: null,
    currentTurn: "player1",
    dots: [],
    connections: [],
    shapeType: "text",
    shapeData: "",
    revealedCount: 0,
    totalDots: 0,
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  hostPlayer.roomId = room.id;
  hostPlayer.isHost = true;
  players.set(hostPlayer.id, hostPlayer);

  return room;
}

export function getRoom(code: string): GameRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function joinRoom(code: string, player: Player): GameRoom | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.player2Id) return null;

  room.player2Id = player.id;
  player.roomId = room.id;
  player.isHost = false;
  players.set(player.id, player);
  rooms.set(code, room);

  return room;
}

function textToDots(text: string, dotCount: number = 200): Dot[] {
  const dots: Dot[] = [];
  const chars = text.toUpperCase().split("");
  const charWidth = 0.8 / chars.length;
  const startX = 0.1;
  const centerY = 0.5;

  const letterPatterns: Record<string, Array<[number, number]>> = {
    A: [[0.5, 0], [0, 1], [1, 1], [0.25, 0.6], [0.75, 0.6]],
    B: [[0, 0], [0, 1], [0.7, 0], [0.7, 0.5], [0.7, 1], [0, 0.5]],
    C: [[0.8, 0.2], [0.3, 0], [0, 0.5], [0.3, 1], [0.8, 0.8]],
    D: [[0, 0], [0, 1], [0.6, 0], [0.8, 0.5], [0.6, 1]],
    E: [[0.8, 0], [0, 0], [0, 0.5], [0.6, 0.5], [0, 1], [0.8, 1]],
    F: [[0.8, 0], [0, 0], [0, 0.5], [0.6, 0.5], [0, 1]],
    G: [[0.8, 0.2], [0.3, 0], [0, 0.5], [0.3, 1], [0.8, 0.8], [0.8, 0.5], [0.5, 0.5]],
    H: [[0, 0], [0, 1], [0, 0.5], [1, 0.5], [1, 0], [1, 1]],
    I: [[0.2, 0], [0.8, 0], [0.5, 0], [0.5, 1], [0.2, 1], [0.8, 1]],
    J: [[0.2, 0], [0.8, 0], [0.5, 0], [0.5, 0.8], [0.3, 1], [0, 0.8]],
    K: [[0, 0], [0, 1], [0, 0.5], [1, 0], [1, 1]],
    L: [[0, 0], [0, 1], [0.8, 1]],
    M: [[0, 1], [0, 0], [0.5, 0.5], [1, 0], [1, 1]],
    N: [[0, 1], [0, 0], [1, 1], [1, 0]],
    O: [[0.5, 0], [0, 0.5], [0.5, 1], [1, 0.5]],
    P: [[0, 1], [0, 0], [0.7, 0], [0.7, 0.5], [0, 0.5]],
    Q: [[0.5, 0], [0, 0.5], [0.5, 1], [1, 0.5], [0.8, 1.1]],
    R: [[0, 1], [0, 0], [0.7, 0], [0.7, 0.5], [0, 0.5], [0.8, 1]],
    S: [[0.8, 0.1], [0.2, 0], [0, 0.3], [0.5, 0.5], [1, 0.7], [0.8, 1], [0.2, 0.9]],
    T: [[0, 0], [1, 0], [0.5, 0], [0.5, 1]],
    U: [[0, 0], [0, 0.8], [0.5, 1], [1, 0.8], [1, 0]],
    V: [[0, 0], [0.5, 1], [1, 0]],
    W: [[0, 0], [0.25, 1], [0.5, 0.5], [0.75, 1], [1, 0]],
    X: [[0, 0], [1, 1], [0.5, 0.5], [1, 0], [0, 1]],
    Y: [[0, 0], [0.5, 0.5], [1, 0], [0.5, 1]],
    Z: [[0, 0], [1, 0], [0, 1], [1, 1]],
  };

  const defaultPattern: Array<[number, number]> = [[0.5, 0], [0.5, 1]];
  const dotsPerChar = Math.floor(dotCount / chars.length);

  chars.forEach((char, charIndex) => {
    const pattern = letterPatterns[char] || defaultPattern;
    const charStartX = startX + charIndex * charWidth;

    for (let i = 0; i < dotsPerChar; i++) {
      const t = i / dotsPerChar;
      const segmentIndex = Math.floor(t * (pattern.length - 1));
      const segmentT = (t * (pattern.length - 1)) % 1;

      const p1 = pattern[segmentIndex];
      const p2 = pattern[Math.min(segmentIndex + 1, pattern.length - 1)];

      const x = charStartX + (p1[0] + (p2[0] - p1[0]) * segmentT) * charWidth * 0.8;
      const y = centerY - 0.2 + (p1[1] + (p2[1] - p1[1]) * segmentT) * 0.4;

      const jitterX = (Math.random() - 0.5) * 0.02;
      const jitterY = (Math.random() - 0.5) * 0.02;

      dots.push({
        id: randomUUID(),
        x: Math.max(0.05, Math.min(0.95, x + jitterX)),
        y: Math.max(0.05, Math.min(0.95, y + jitterY)),
        revealed: false,
        connected: false,
        order: i + charIndex * dotsPerChar,
        strategyWeight: Math.random(),
      });
    }
  });

  return shuffleDots(dots);
}

function drawingToDots(drawingData: string, dotCount: number = 200): Dot[] {
  const dots: Dot[] = [];
  
  try {
    const data = JSON.parse(drawingData);
    const strokes = data.strokes as Array<Array<{ x: number; y: number }>>;
    const width = data.width as number;
    const height = data.height as number;

    let totalPoints = 0;
    strokes.forEach((stroke) => (totalPoints += stroke.length));

    strokes.forEach((stroke) => {
      const strokeDots = Math.floor((stroke.length / totalPoints) * dotCount);
      const step = Math.max(1, Math.floor(stroke.length / strokeDots));

      stroke.forEach((point, index) => {
        if (index % step === 0) {
          dots.push({
            id: randomUUID(),
            x: point.x / width,
            y: point.y / height,
            revealed: false,
            connected: false,
            order: dots.length,
            strategyWeight: Math.random(),
          });
        }
      });
    });
  } catch {
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      dots.push({
        id: randomUUID(),
        x: 0.5 + Math.cos(angle) * 0.3,
        y: 0.5 + Math.sin(angle) * 0.3,
        revealed: false,
        connected: false,
        order: i,
        strategyWeight: Math.random(),
      });
    }
  }

  return shuffleDots(dots);
}

function imageToDots(imageData: string, dotCount: number = 200): Dot[] {
  const dots: Dot[] = [];
  
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const radius = 0.2 + (i % 3) * 0.1;
    
    dots.push({
      id: randomUUID(),
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      revealed: false,
      connected: false,
      order: i,
      strategyWeight: Math.random(),
    });
  }

  return shuffleDots(dots);
}

function shuffleDots(dots: Dot[]): Dot[] {
  const shuffled = [...dots];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function setupGame(
  code: string,
  shapeType: "text" | "drawing" | "image",
  shapeData: string
): GameRoom | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;

  let dots: Dot[];
  switch (shapeType) {
    case "text":
      dots = textToDots(shapeData, 150);
      break;
    case "drawing":
      dots = drawingToDots(shapeData, 200);
      break;
    case "image":
      dots = imageToDots(shapeData, 180);
      break;
    default:
      dots = [];
  }

  if (dots.length > 0) {
    dots[0].revealed = true;
    dots[1].revealed = true;
  }

  room.status = "setup";
  room.shapeType = shapeType;
  room.shapeData = shapeData;
  room.dots = dots;
  room.totalDots = dots.length;
  room.revealedCount = 2;
  rooms.set(code.toUpperCase(), room);

  return room;
}

export function startGame(code: string): GameRoom | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || !room.player1Id || !room.player2Id) return null;

  room.status = "playing";
  room.currentTurn = "player2";
  rooms.set(code, room);

  return room;
}

export function connectDot(code: string, dotId: string, playerId: string): { room: GameRoom; nextDotId: string | null } | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.status !== "playing") return null;

  const isPlayer1Turn = room.currentTurn === "player1";
  const isValidPlayer = 
    (isPlayer1Turn && room.player1Id === playerId) ||
    (!isPlayer1Turn && room.player2Id === playerId);

  if (!isValidPlayer) return null;

  const dot = room.dots.find((d) => d.id === dotId);
  if (!dot || !dot.revealed || dot.connected) return null;

  dot.connected = true;

  const lastConnectedDot = room.dots.find((d) => 
    d.connected && d.id !== dotId
  );
  if (lastConnectedDot) {
    room.connections.push({ from: lastConnectedDot.id, to: dotId });
  }

  const unrevealedDots = room.dots.filter((d) => !d.revealed);
  let nextDotId: string | null = null;

  if (unrevealedDots.length > 0) {
    const sortedByWeight = [...unrevealedDots].sort((a, b) => b.strategyWeight - a.strategyWeight);
    const nextDot = sortedByWeight[0];
    nextDot.revealed = true;
    nextDotId = nextDot.id;
    room.revealedCount++;
  }

  room.currentTurn = isPlayer1Turn ? "player2" : "player1";

  const progress = room.revealedCount / room.totalDots;
  if (progress >= 0.8) {
    room.status = "revealing";
    
    room.dots.forEach((d) => {
      d.revealed = true;
      d.connected = true;
    });
  }

  rooms.set(code, room);
  return { room, nextDotId };
}

export function completeReveal(code: string): GameRoom | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;

  room.status = "completed";
  rooms.set(code, room);

  return room;
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
