import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameMode } from '../types';

export default function Home() {
  const navigate = useNavigate();
  const initGame = useGameStore(state => state.initGame);

  const handleStartGame = (mode: GameMode) => {
    initGame(mode);
    navigate('/game');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-wood-800 mb-4 tracking-wider">
          五子棋
        </h1>
        <p className="font-sans text-wood-600 text-lg mb-12">古典策略游戏</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleStartGame('pvp')}
            className="px-8 py-4 bg-wood-600 text-white font-sans font-medium text-lg rounded-lg
                       hover:bg-wood-700 hover:shadow-lg transition-all duration-200
                       active:scale-95"
          >
            双人对战
          </button>
          <button
            onClick={() => handleStartGame('ai')}
            className="px-8 py-4 bg-wood-500 text-white font-sans font-medium text-lg rounded-lg
                       hover:bg-wood-600 hover:shadow-lg transition-all duration-200
                       active:scale-95"
          >
            与AI对战
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-wood-400 text-sm font-sans">
        点击开始游戏
      </div>
    </div>
  );
}
