import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSound } from "@/hooks/use-sound";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Trophy } from "lucide-react";
import type { ChessPiece, PieceType } from "@shared/schema";

const CHESS_PIECES: Record<string, string> = {
  "white-king": "â™”",
  "white-queen": "â™•",
  "white-rook": "â™–",
  "white-bishop": "â™—",
  "white-knight": "â™˜",
  "white-pawn": "â™™",
  "black-king": "â™š",
  "black-queen": "â™›",
  "black-rook": "â™œ",
  "black-bishop": "â™",
  "black-knight": "â™ž",
  "black-pawn": "â™Ÿ",
};

export default function Game() {
  const [, params] = useRoute("/game/:code");
  const [, navigate] = useLocation();
  const { room, player, isHost, sendMessage, isConnected, resetState } = useWebSocket();
  const { playClick, playMove, isMuted, toggleMute } = useSound();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
      return;
    }

    if (!room) {
      navigate("/");
      return;
    }

    if (params?.code && room.code !== params.code) {
      navigate("/");
      return;
    }
  }, [room, params?.code, isConnected, navigate]);

  useEffect(() => {
    if (room?.status === "checkmate" || room?.status === "won" || room?.status === "draw") {
      playClick();
    }
  }, [room?.status, playClick]);

  const handleLeave = () => {
    resetState();
    navigate("/");
  };

  const handleBack = () => {
    resetState();
    navigate("/");
  };

  if (!room || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = player.id === room.player1Id;
  const isPlayer2 = player.id === room.player2Id;
  const isMyTurn = (room.currentTurn === "player1" && isPlayer1) || (room.currentTurn === "player2" && isPlayer2);

  // Render chess game
  if (room.gameType === "chess") {
    return <ChessGame room={room} player={player} isPlayer1={isPlayer1} isPlayer2={isPlayer2} isMyTurn={isMyTurn} selectedSquare={selectedSquare} setSelectedSquare={setSelectedSquare} validMoves={validMoves} setValidMoves={setValidMoves} sendMessage={sendMessage} playMove={playMove} handleBack={handleBack} isMuted={isMuted} toggleMute={toggleMute} />;
  }

  // Render Connect Four game
  if (room.gameType === "connect-four") {
    return <ConnectFourGame room={room} player={player} isPlayer1={isPlayer1} isPlayer2={isPlayer2} isMyTurn={isMyTurn} sendMessage={sendMessage} playMove={playMove} handleBack={handleBack} isMuted={isMuted} toggleMute={toggleMute} />;
  }

  // Render Tic Tac Toe game
  if (room.gameType === "tic-tac-toe") {
    return <TicTacToeGame room={room} player={player} isPlayer1={isPlayer1} isPlayer2={isPlayer2} isMyTurn={isMyTurn} sendMessage={sendMessage} playMove={playMove} handleBack={handleBack} isMuted={isMuted} toggleMute={toggleMute} />;
  }

  return null;
}

function ChessGame({ room, player, isPlayer1, isPlayer2, isMyTurn, selectedSquare, setSelectedSquare, validMoves, setValidMoves, sendMessage, playMove, handleBack, isMuted, toggleMute }: any) {
  const handleSquareClick = (square: string) => {
    if (!isMyTurn || room.status !== "active" && room.status !== "check") return;

    const piece = room.pieces.find((p: ChessPiece) => p.position === square);
    const myColor = isPlayer1 ? "white" : "black";

    // If clicking on own piece, select it
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      sendMessage({
        type: "select_square",
        roomId: room.id,
        playerId: player.id,
        square,
      });
      return;
    }

    // If a square is selected and clicking on a valid move, make the move
    if (selectedSquare && validMoves.includes(square)) {
      if (playMove && typeof playMove === 'function') {
        playMove();
      }
      sendMessage({
        type: "make_move",
        roomId: room.id,
        playerId: player.id,
        from: selectedSquare,
        to: square,
      });
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Update valid moves when room updates
  useEffect(() => {
    if (room.selectedSquare === selectedSquare) {
      setValidMoves(room.validMoves || []);
    }
  }, [room.selectedSquare, room.validMoves, selectedSquare]);

  const getPieceAtSquare = (square: string): ChessPiece | undefined => {
    return room.pieces.find((p: ChessPiece) => p.position === square);
  };

  const renderSquare = (square: string, isLight: boolean) => {
    const piece = getPieceAtSquare(square);
    const isSelected = selectedSquare === square;
    const isValidMove = validMoves.includes(square);
    const isCapture = isValidMove && piece;

    return (
      <button
        key={square}
        onClick={() => handleSquareClick(square)}
        className={`
          relative aspect-square w-10 xs:w-12 sm:w-14 md:w-16 lg:w-20
          flex items-center justify-center
          transition-all duration-200 touch-manipulation
          ${isLight ? "bg-amber-100 dark:bg-amber-200" : "bg-amber-800 dark:bg-amber-900"}
          ${isSelected ? "ring-4 ring-yellow-400 dark:ring-yellow-500" : ""}
          ${isValidMove && !isCapture ? "after:absolute after:w-3 after:h-3 after:rounded-full after:bg-green-500 after:opacity-60" : ""}
          ${isCapture ? "ring-2 ring-red-500" : ""}
          ${isMyTurn && room.status === "active" || room.status === "check" ? "hover:brightness-110 active:scale-95" : "cursor-default"}
        `}
        disabled={!isMyTurn || (room.status !== "active" && room.status !== "check")}
      >
        {piece && (
          <span className={`text-2xl xs:text-3xl sm:text-4xl lg:text-5xl select-none ${piece.color === "white" ? "text-white" : "text-black"}`}>
            {CHESS_PIECES[`${piece.color}-${piece.type}`]}
          </span>
        )}
      </button>
    );
  };

  const renderBoard = () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = isPlayer1 ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div className="inline-grid grid-cols-8 gap-0 shadow-2xl rounded-lg overflow-hidden border-4 border-amber-700 dark:border-amber-600">
        {ranks.map((rank) =>
          files.map((file) => {
            const square = `${file}${rank}`;
            const isLight = (files.indexOf(file) + rank) % 2 === 0;
            return renderSquare(square, isLight);
          })
        )}
      </div>
    );
  };

  const player1Name = room.player1Id === player.id ? player.name : "Player 1";
  const player2Name = room.player2Id === player.id ? player.name : "Player 2";

  const renderGameOver = () => {
    if (room.status !== "checkmate" && room.status !== "draw") return null;

    const isWinner = 
      (room.winner === "player1" && isPlayer1) || 
      (room.winner === "player2" && isPlayer2);

    return (
      <Card className="absolute inset-0 m-auto w-11/12 max-w-md h-fit z-50 p-6 sm:p-8 text-center animate-slide-up bg-background/95 backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <Trophy className={`h-16 w-16 ${isWinner ? "text-yellow-500" : "text-muted-foreground"}`} />
          <h2 className="text-2xl sm:text-3xl font-bold">
            {room.status === "draw" ? "Draw!" : isWinner ? "You Won! 🎉" : "You Lost"}
          </h2>
          {room.status === "checkmate" && (
            <p className="text-muted-foreground">
              {room.winner === "player1" ? `${player1Name} (White) wins!` : `${player2Name} (Black) wins!`}
            </p>
          )}
          {room.secretRevealed && room.secret && (
            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/30">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">🔔 Secret Revealed:</p>
              <p className="text-sm">{room.secret}</p>
            </div>
          )}
          <Button onClick={handleBack} className="mt-4">
            Back to Home
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white overflow-hidden">
      <header className="flex items-center justify-between p-3 sm:p-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto pt-12 sm:pt-4">
        <div className="text-center mb-3 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Secret Stakes Chess</h1>
          <p className="text-xs sm:text-sm text-purple-300">Room: {room.code}</p>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center gap-3 sm:gap-4 px-2">
          {/* Player 2 Info (Top) */}
          <Card className="w-full max-w-sm p-3 bg-black/30 backdrop-blur border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{player2Name}</p>
                <p className="text-xs text-purple-300">Black Pieces</p>
              </div>
              {room.currentTurn === "player2" && room.status === "active" && (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </Card>

          {/* Board */}
          <div className="flex items-center justify-center">
            {renderBoard()}
          </div>

          {/* Player 1 Info (Bottom) */}
          <Card className="w-full max-w-sm p-3 bg-black/30 backdrop-blur border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{player1Name}</p>
                <p className="text-xs text-purple-300">White Pieces</p>
              </div>
              {room.currentTurn === "player1" && room.status === "active" && (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </Card>

          {/* Status */}
          {room.status === "check" && (
            <p className="text-yellow-400 font-bold animate-pulse">âš ï¸ CHECK!</p>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-[250px_1fr_250px] gap-8 items-start px-4">
          {/* Left Panel - Player 1 */}
          <Card className="p-6 bg-black/30 backdrop-blur border-purple-500/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="font-semibold">{player1Name}</p>
                  <p className="text-sm text-purple-300">White</p>
                </div>
              </div>
              {room.currentTurn === "player1" && room.status === "active" && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Your turn</span>
                </div>
              )}
            </div>
          </Card>

          {/* Center - Board */}
          <div className="flex flex-col items-center gap-4">
            {room.status === "check" && (
              <p className="text-yellow-400 font-bold text-xl animate-pulse">âš ï¸ CHECK!</p>
            )}
            {renderBoard()}
          </div>

          {/* Right Panel - Player 2 */}
          <Card className="p-6 bg-black/30 backdrop-blur border-purple-500/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="font-semibold">{player2Name}</p>
                  <p className="text-sm text-purple-300">Black</p>
                </div>
              </div>
              {room.currentTurn === "player2" && room.status === "active" && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">Your turn</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {renderGameOver()}
    </div>
  );
}

function ConnectFourGame({ room, player, isPlayer1, isPlayer2, isMyTurn, sendMessage, playMove, handleBack, isMuted, toggleMute }: any) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const handleColumnClick = (col: number) => {
    if (!isMyTurn || room.status !== "active") return;

    // Check if column is full
    if (room.connectFourBoard?.grid[0][col] !== null) return;

    if (playMove && typeof playMove === 'function') {
      playMove();
    }
    sendMessage({
      type: "make_move",
      roomId: room.id,
      playerId: player.id,
      column: col,
    });
  };

  const getColor = (cell: null | "red" | "yellow") => {
    if (cell === "red") return "bg-red-500";
    if (cell === "yellow") return "bg-yellow-400";
    return "bg-white/20";
  };

  const player1Name = room.player1Id === player.id ? player.name : "Player 1";
  const player2Name = room.player2Id === player.id ? player.name : "Player 2";
  const myColor = isPlayer1 ? "red" : "yellow";

  const renderGameOver = () => {
    if (room.status !== "won" && room.status !== "draw") return null;

    const isWinner = 
      (room.winner === "player1" && isPlayer1) || 
      (room.winner === "player2" && isPlayer2);

    return (
      <Card className="absolute inset-0 m-auto w-11/12 max-w-md h-fit z-50 p-6 sm:p-8 text-center animate-slide-up bg-background/95 backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <Trophy className={`h-16 w-16 ${isWinner ? "text-yellow-500" : "text-muted-foreground"}`} />
          <h2 className="text-2xl sm:text-3xl font-bold">
            {room.status === "draw" ? "Draw!" : isWinner ? "You Won! 🎉" : "You Lost"}
          </h2>
          {room.status === "won" && (
            <p className="text-muted-foreground">
              {room.winner === "player1" ? `${player1Name} (Red) wins!` : `${player2Name} (Yellow) wins!`}
            </p>
          )}
          {room.secretRevealed && room.secret && (
            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/30">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">🔔 Secret Revealed:</p>
              <p className="text-sm">{room.secret}</p>
            </div>
          )}
          <Button onClick={handleBack} className="mt-4">
            Back to Home
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 text-white overflow-hidden">
      <header className="flex items-center justify-between p-3 sm:p-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto pt-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Connect Four</h1>
          <p className="text-sm text-blue-300">Room: {room.code}</p>
        </div>

        {/* Player Info */}
        <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto">
          <Card className="p-4 bg-black/30 backdrop-blur border-blue-500/30 flex-1 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500" />
              <div>
                <p className="font-semibold text-sm">{player1Name}</p>
                {room.currentTurn === "player1" && room.status === "active" && (
                  <p className="text-xs text-green-400">Your turn</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-black/30 backdrop-blur border-blue-500/30 flex-1 ml-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-400" />
              <div>
                <p className="font-semibold text-sm">{player2Name}</p>
                {room.currentTurn === "player2" && room.status === "active" && (
                  <p className="text-xs text-green-400">Your turn</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Connect Four Board */}
        <div className="flex justify-center">
          <div className="bg-blue-600 p-4 rounded-lg shadow-2xl">
            {/* Column click areas - invisible buttons above each column */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                <button
                  key={`click-${col}`}
                  onClick={() => handleColumnClick(col)}
                  onMouseEnter={() => setHoveredColumn(col)}
                  onMouseLeave={() => setHoveredColumn(null)}
                  disabled={!isMyTurn || room.status !== "active" || room.connectFourBoard?.grid[0][col] !== null}
                  className={`
                    w-12 h-8 sm:w-16 sm:h-10 rounded-t-lg
                    transition-all duration-200
                    ${isMyTurn && room.status === "active" && room.connectFourBoard?.grid[0][col] === null ? "bg-white/10 hover:bg-white/20 cursor-pointer" : "bg-transparent cursor-default"}
                    ${hoveredColumn === col && isMyTurn && room.status === "active" && room.connectFourBoard?.grid[0][col] === null ? "bg-white/30" : ""}
                  `}
                >
                  {hoveredColumn === col && isMyTurn && room.status === "active" && room.connectFourBoard?.grid[0][col] === null && (
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto ${myColor === "red" ? "bg-red-500/50" : "bg-yellow-400/50"}`} />
                  )}
                </button>
              ))}
            </div>
            {/* Display grid */}
            <div className="grid grid-cols-7 gap-2">
              {room.connectFourBoard?.grid.map((row: any, rowIndex: number) =>
                row.map((cell: any, colIndex: number) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-12 h-12 sm:w-16 sm:h-16 rounded-full 
                      transition-all duration-200
                      ${getColor(cell)}
                      ${room.connectFourBoard?.lastMove && room.connectFourBoard.lastMove.row === rowIndex && room.connectFourBoard.lastMove.col === colIndex ? "animate-pulse ring-2 ring-white" : ""}
                    `}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {renderGameOver()}
    </div>
  );
}

function TicTacToeGame({ room, player, isPlayer1, isPlayer2, isMyTurn, sendMessage, playMove, handleBack, isMuted, toggleMute }: any) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const handleCellClick = (position: number) => {
    if (!isMyTurn || room.status !== "active") return;
    if (room.ticTacToeBoard?.grid[position] !== null) return;

    if (playMove && typeof playMove === 'function') {
      playMove();
    }
    sendMessage({
      type: "make_move",
      roomId: room.id,
      playerId: player.id,
      position,
    });
  };

  const renderGameOver = () => {
    if (room.status !== "won" && room.status !== "draw") return null;

    const isWinner = room.winner === player.id;
    const isDraw = !room.winner;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="p-6 max-w-md w-full space-y-4 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur border-purple-500/50">
          <div className="text-center space-y-2">
            <Trophy className="h-12 w-12 mx-auto text-yellow-400" />
            <h2 className="text-2xl font-bold">
              {isDraw ? "Draw!" : isWinner ? "You Won!" : "You Lost!"}
            </h2>
            {room.secretRevealed && room.secret && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Revealed Secret:</p>
                <p className="text-lg font-semibold text-white">{room.secret}</p>
              </div>
            )}
          </div>
          <Button onClick={handleBack} className="w-full">
            Return Home
          </Button>
        </Card>
      </div>
    );
  };

  const player1Name = isPlayer1 ? player.name : room.players?.find((p: any) => p.id !== player.id)?.name || "Player 1";
  const player2Name = isPlayer1 ? room.players?.find((p: any) => p.id !== player.id)?.name || "Player 2" : player.name;

  const getSymbol = (cell: string | null) => {
    if (cell === null) return "";
    return cell === "player1" ? "X" : "O";
  };

  const getColor = (cell: string | null) => {
    if (cell === null) return "bg-gray-800/50";
    return cell === "player1" ? "text-blue-400" : "text-red-400";
  };

  // Show waiting screen if game hasn't started yet
  if (!room.ticTacToeBoard?.grid || room.status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 xs:p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex gap-2">
            <ThemeToggle />
            <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Room Code */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-white/60">Room Code</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wider">{room.code}</p>
          </div>

          <Card className="p-6 text-center">
            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-xl font-bold mb-2">Waiting for Player 2...</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Share the room code with a friend to start playing!
            </p>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(room.code);
              }}
              variant="outline"
              className="w-full"
            >
              Copy Room Code
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 xs:p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex gap-2">
          <ThemeToggle />
          <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Room Code */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-white/60">Room Code</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wider">{room.code}</p>
        </div>

        {/* Player Cards */}
        <div className="flex items-center gap-2">
          <Card className="p-4 bg-black/30 backdrop-blur border-blue-500/30 flex-1 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-400" />
              <div>
                <p className="font-semibold text-sm">{player1Name}</p>
                {room.currentTurn === "player1" && room.status === "active" && (
                  <p className="text-xs text-green-400">Your turn</p>
                )}
              </div>
            </div>
          </Card>

          <div className="text-2xl font-bold text-white">VS</div>

          <Card className="p-4 bg-black/30 backdrop-blur border-red-500/30 flex-1 ml-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-400" />
              <div>
                <p className="font-semibold text-sm">{player2Name}</p>
                {room.currentTurn === "player2" && room.status === "active" && (
                  <p className="text-xs text-green-400">Your turn</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Tic Tac Toe Board */}
        <div className="flex justify-center">
          <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg shadow-2xl">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {room.ticTacToeBoard?.grid.map((cell: string | null, index: number) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  onMouseEnter={() => setHoveredCell(index)}
                  onMouseLeave={() => setHoveredCell(null)}
                  disabled={!isMyTurn || room.status !== "active" || cell !== null}
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                    flex items-center justify-center
                    text-4xl sm:text-5xl md:text-6xl font-bold
                    rounded-lg transition-all duration-200
                    ${cell === null ? (isMyTurn && room.status === "active" ? "bg-gray-800 hover:bg-gray-700 cursor-pointer" : "bg-gray-800/50 cursor-default") : "bg-gray-800/80"}
                    ${room.ticTacToeBoard?.winningLine && room.ticTacToeBoard.winningLine.includes(index) ? "ring-4 ring-yellow-400 animate-pulse" : ""}
                    ${getColor(cell)}
                  `}
                >
                  {cell === null && hoveredCell === index && isMyTurn && room.status === "active" ? (
                    <span className="opacity-30">{isPlayer1 ? "X" : "O"}</span>
                  ) : (
                    getSymbol(cell)
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {renderGameOver()}
    </div>
  );
}
