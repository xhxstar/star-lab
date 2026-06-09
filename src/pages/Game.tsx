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

  const handleRestart = () => {
    initGame(gameMode);
  };

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="font-serif text-3xl font-bold text-wood-800 mb-6">五子棋</h1>

      <GameInfo />

      <div className="mb-6">
        <Board />
      </div>

      <div className="flex gap-4">
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
