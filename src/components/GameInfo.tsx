import { useGameStore } from '../store/gameStore';

export default function GameInfo() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const gameMode = useGameStore(state => state.gameMode);

  const getModeText = () => {
    return gameMode === 'pvp' ? '双人对战' : '与AI对战';
  };

  const getCurrentText = () => {
    if (currentPlayer === 'black') {
      return '黑棋';
    }
    return '白棋';
  };

  return (
    <div className="flex items-center gap-6 mb-4">
      <span className="font-sans text-wood-600">
        模式：{getModeText()}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-sans text-wood-600">当前落子：</span>
        <div
          className={`w-5 h-5 rounded-full shadow-md ${
            currentPlayer === 'black' ? 'bg-piece-black' : 'bg-piece-white border border-gray-300'
          }`}
        />
        <span className="font-sans text-wood-700 font-medium">{getCurrentText()}</span>
      </div>
    </div>
  );
}
