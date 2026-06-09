import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function WinModal() {
  const navigate = useNavigate();
  const winner = useGameStore(state => state.winner);
  const isGameOver = useGameStore(state => state.isGameOver);
  const gameMode = useGameStore(state => state.gameMode);
  const initGame = useGameStore(state => state.initGame);
  const resetGame = useGameStore(state => state.resetGame);

  if (!isGameOver || winner === null) return null;

  const getWinnerText = () => {
    if (gameMode === 'ai') {
      return winner === 'black' ? '恭喜你，你赢了！' : 'AI获胜！';
    }
    return winner === 'black' ? '黑棋获胜！' : '白棋获胜！';
  };

  const handleRestart = () => {
    initGame(gameMode);
  };

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-wood-50 rounded-xl shadow-2xl p-8 text-center max-w-sm mx-4 animate-modal-appear">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full shadow-lg ${
            winner === 'black' ? 'bg-piece-black' : 'bg-piece-white border-2 border-gray-200'
          }`}
        />

        <h2 className="font-serif text-2xl font-bold text-wood-800 mb-2">
          游戏结束
        </h2>

        <p className="font-sans text-xl text-wood-600 mb-6">
          {getWinnerText()}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-wood-600 text-white font-sans font-medium rounded-lg
                       hover:bg-wood-700 hover:shadow-lg transition-all duration-200
                       active:scale-95"
          >
            再来一局
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-wood-300 text-wood-700 font-sans font-medium rounded-lg
                       hover:bg-wood-400 hover:shadow-lg transition-all duration-200
                       active:scale-95"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}
