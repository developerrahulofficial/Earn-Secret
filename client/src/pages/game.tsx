import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Crown, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChessPiece, PieceType } from "@shared/schema";

const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  king: { white: "♔", black: "♚" },
  queen: { white: "♕", black: "♛" },
  rook: { white: "♖", black: "♜" },
  bishop: { white: "♗", black: "♝" },
  knight: { white: "♘", black: "♞" },
  pawn: { white: "♙", black: "♟" },
};

export default function Game() {
  const [, navigate] = useLocation();
  const { code } = useParams<{ code: string }>();

  const { room, player, isHost, isConnected, joinRoom, sendMessage, resetState, error } = useWebSocket();
  const { playClick, playConnect } = useSound();

  const [hasJoined, setHasJoined] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (room && room.code.toUpperCase() === code?.toUpperCase()) {
      setHasJoined(true);
      return;
    }
    
    if (isConnected && code && !hasJoined && !room) {
      setHasJoined(true);
      const storedName = sessionStorage.getItem("playerName") || "Player";
      joinRoom(code.toUpperCase(), storedName);
    }
  }, [isConnected, code, hasJoined, room, joinRoom]);

  const myColor = room && player ? (room.player1Id === player.id ? "white" : "black") : null;
  const isMyTurn = room && myColor && room.currentTurn === myColor;

  const handleSquareClick = (square: string) => {
    if (!room || !player || !isMyTurn) return;

    const piece = getPieceAt(square);

    if (selectedSquare) {
      // Try to make a move
      if (room.validMoves.includes(square)) {
        sendMessage({
          type: "make_move",
          roomId: room.id,
          playerId: player.id,
          from: selectedSquare,
          to: square,
        });
        playConnect();
      }
      setSelectedSquare(null);
    } else if (piece && piece.color === myColor) {
      // Select piece
      setSelectedSquare(square);
      sendMessage({
        type: "select_square",
        roomId: room.id,
        playerId: player.id,
        square,
      });
      playClick();
    }
  };

  const getPieceAt = (square: string): ChessPiece | null => {
    if (!room) return null;
    return room.pieces.find(p => p.position === square) || null;
  };

  const handleLeave = () => {
    resetState();
    navigate("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLeave} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room || room.status === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Waiting for Players...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderBoard = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = myColor === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div className="inline-block border-2 sm:border-4 border-amber-900 shadow-2xl rounded-sm overflow-hidden">
        {ranks.map((rank) => (
          <div key={rank} className="flex">
            {files.map((file) => {
              const square = `${file}${rank}`;
              const piece = getPieceAt(square);
              const isLight = (files.indexOf(file) + rank) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isValidMove = room.validMoves.includes(square);
              
              return (
                <button
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  disabled={!isMyTurn}
                  className={`
                    w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20
                    flex items-center justify-center 
                    text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl
                    transition-all duration-150 relative touch-manipulation
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isSelected ? 'ring-2 sm:ring-4 ring-yellow-400' : ''}
                    ${isValidMove ? 'ring-1 sm:ring-2 ring-green-500' : ''}
                    ${!isMyTurn ? 'cursor-not-allowed opacity-75' : 'cursor-pointer active:scale-95 hover:opacity-90'}
                  `}
                >
                  {piece && (
                    <span className={piece.color === "white" ? "text-white drop-shadow-lg" : "text-black"}>
                      {PIECE_SYMBOLS[piece.type][piece.color]}
                    </span>
                  )}
                  {isValidMove && !piece && (
                    <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 rounded-full opacity-50" />
                  )}
                  {isValidMove && piece && (
                    <div className="absolute inset-0 border-2 sm:border-4 border-red-500 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-2 sm:p-4 overflow-x-hidden">
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 z-10">
        <ThemeToggle />
        <SoundToggle />
        <Button onClick={handleLeave} variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline ml-2">Leave</span>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto pt-12 sm:pt-4">
        <div className="text-center mb-3 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Secret Stakes Chess</h1>
          <p className="text-xs sm:text-sm text-purple-300">Room: {room.code}</p>
        </div>

        {/* Mobile: Status Bar */}
        <div className="lg:hidden mb-4 flex gap-2 justify-center">
          <Badge className={room.currentTurn === myColor ? "bg-green-500" : "bg-gray-500"}>
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </Badge>
          {room.status === "check" && room.currentTurn === myColor && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Check!
            </Badge>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(200px,1fr)_auto_minmax(200px,1fr)] gap-3 sm:gap-4 lg:gap-6 items-start">
          {/* White Player Info - Desktop */}
          <Card className="hidden lg:block bg-slate-800/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-yellow-500" />
                {room.player1Id === player?.id ? "You" : "Opponent"}
                <Badge variant="outline" className="text-xs">White</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {room.currentTurn === "white" && (
                  <Badge className="bg-green-500 text-xs">Current Turn</Badge>
                )}
                {room.status === "check" && room.currentTurn === "white" && (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    In Check!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chess Board - Centered */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full lg:w-auto mx-auto">
            {/* Mobile: Compact Player Info Above Board */}
            <div className="lg:hidden w-full max-w-sm">
              <div className="flex justify-between items-center bg-slate-800/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold">
                    {myColor === "white" ? "You (White)" : "Opp (White)"}
                  </span>
                </div>
                {room.currentTurn === "white" && (
                  <Badge className="bg-green-500 text-xs">Turn</Badge>
                )}
              </div>
            </div>

            {renderBoard()}
            
            {/* Mobile: Compact Player Info Below Board */}
            <div className="lg:hidden w-full max-w-sm">
              <div className="flex justify-between items-center bg-slate-800/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {myColor === "black" ? "You (Black)" : "Opp (Black)"}
                  </span>
                </div>
                {room.currentTurn === "black" && (
                  <Badge className="bg-green-500 text-xs">Turn</Badge>
                )}
              </div>
            </div>
            
            {room.status === "checkmate" && (
              <Card className="w-full max-w-md bg-gradient-to-r from-amber-900 to-amber-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-lg sm:text-xl md:text-2xl">
                    {room.winner === "player1" && room.player1Id === player?.id && "🎉 You Win!"}
                    {room.winner === "player2" && room.player2Id === player?.id && "🎉 You Win!"}
                    {room.winner === "player1" && room.player1Id !== player?.id && "Checkmate - You Lose"}
                    {room.winner === "player2" && room.player2Id !== player?.id && "Checkmate - You Lose"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {room.secretRevealed && room.winner === "player2" && (
                    <div className="bg-black/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-yellow-400 mb-2 font-semibold">🔓 Secret Revealed:</p>
                      <p className="text-white italic text-sm sm:text-base break-words">{room.secret}</p>
                    </div>
                  )}
                  {!room.secretRevealed && room.winner === "player1" && (
                    <p className="text-center text-xs sm:text-sm">The secret remains hidden! White defended it successfully.</p>
                  )}
                  <Button onClick={handleLeave} className="w-full">
                    Return to Menu
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Black Player Info - Desktop */}
          <Card className="hidden lg:block bg-slate-800/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4" />
                {room.player2Id === player?.id ? "You" : "Opponent"}
                <Badge variant="outline" className="text-xs">Black</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {room.currentTurn === "black" && (
                  <Badge className="bg-green-500 text-xs">Current Turn</Badge>
                )}
                {room.status === "check" && room.currentTurn === "black" && (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    In Check!
                  </Badge>
                )}
                <div className="text-xs text-muted-foreground mt-4">
                  Win to reveal White's secret!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Move History */}
        <Card className="mt-4 sm:mt-6 bg-slate-800/50 max-w-4xl mx-auto">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Move History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {room.moveHistory.map((move, i) => (
                <div key={i} className="text-xs sm:text-sm font-mono bg-slate-900/30 p-1 rounded">
                  {i + 1}. {move.from}→{move.to}
                  {move.captured && ` ×${move.captured.substring(0, 1)}`}
                  {move.isCheck && " ✓"}
                  {move.isCheckmate && " ✓✓"}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
