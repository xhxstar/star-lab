import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import WinModal from '../components/WinModal';

export default function Game() {
  const navigate = useNavigate();
  const resetGame = useGameStore(state => state.resetGame);
  const initGame = useGameStore(state => state.initGame);
  const gameMode = useGameStore(state => state.gameMode);
  const undoMove = useGameStore(state => state.undoMove);
  const moveHistory = useGameStore(state => state.moveHistory);
  const timer = useGameStore(state => state.timer);
  const tickTimer = useGameStore(state => state.tickTimer);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const isGameOver = useGameStore(state => state.isGameOver);

  useEffect(() => {
    if (timer.isRunning && !isGameOver) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.isRunning, tickTimer, isGameOver, currentPlayer]);

  useEffect(() => {
    if (!isGameOver && moveHistory.length === 0) {
      const startTimer = useGameStore.getState().startTimer;
      startTimer();
    }
  }, []);

  const handleRestart = () => {
    initGame(gameMode);
  };

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  const handleUndo = () => {
    undoMove();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 10) return 'text-red-500';
    if (seconds <= 20) return 'text-yellow-500';
    return 'text-wood-600';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="font-serif text-3xl font-bold text-wood-800 mb-4">五子棋</h1>

      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-gray-900 shadow-md"></div>
            <span className="font-sans text-sm text-wood-600">黑方</span>
          </div>
          <div className={`font-mono text-2xl font-bold ${getTimeColor(timer.blackTime)}`}>
            {formatTime(timer.blackTime)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 shadow-md"></div>
            <span className="font-sans text-sm text-wood-600">白方</span>
          </div>
          <div className={`font-mono text-2xl font-bold ${getTimeColor(timer.whiteTime)}`}>
            {formatTime(timer.whiteTime)}
          </div>
        </div>
      </div>

      <GameInfo />

      <div className="mb-6">
        <Board />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0}
          className="px-6 py-2 bg-wood-500 text-white font-sans font-medium rounded-lg
                     hover:bg-wood-600 hover:shadow-md transition-all duration-200
                     active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          悔棋
        </button>
        <button
          onClick={handleRestart}
          className="px-6 py-2 bg-wood-600 text-white font-sans font-medium rounded-lg
                     hover:bg-wood-700 hover:shadow-md transition-all duration-200
                     active:scale-95"
        >
          重新开始
        </button>
        <button
          onClick={handleGoHome}
          className="px-6 py-2 bg-wood-400 text-white font-sans font-medium rounded-lg
                     hover:bg-wood-500 hover:shadow-md transition-all duration-200
                     active:scale-95"
        >
          返回主页
        </button>
      </div>

      <WinModal />
    </div>
  );
}
