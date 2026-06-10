import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameMode, Difficulty } from '../types';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

export default function Home() {
  const navigate = useNavigate();
  const initGame = useGameStore(state => state.initGame);
  const [showDifficulty, setShowDifficulty] = useState(false);

  const handleStartGame = (mode: GameMode, difficulty?: Difficulty) => {
    initGame(mode, difficulty);
    navigate('/game');
  };

  const handleAIStart = () => {
    setShowDifficulty(true);
  };

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    handleStartGame('ai', difficulty);
  };

  if (showDifficulty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-wood-800 mb-4 tracking-wider">
            选择难度
          </h1>
          <p className="font-sans text-wood-600 mb-8">与AI对战的难度级别</p>

          <div className="flex flex-col gap-4">
            {DIFFICULTY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleSelectDifficulty(value)}
                className="px-8 py-4 bg-wood-500 text-white font-sans font-medium text-lg rounded-lg
                           hover:bg-wood-600 hover:shadow-lg transition-all duration-200
                           active:scale-95"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDifficulty(false)}
            className="mt-8 px-6 py-2 text-wood-500 font-sans hover:text-wood-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

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
            onClick={handleAIStart}
            className="px-8 py-4 bg-wood-500 text-white font-sans font-medium text-lg rounded-lg
                       hover:bg-wood-600 hover:shadow-lg transition-all duration-200
                       active:scale-95"
          >
            与AI对战
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-wood-400 text-sm font-sans">
        点击开始游戏 | 每局限时30秒
      </div>
    </div>
  );
}
