import { useGameStore } from '../store/gameStore';

interface CellProps {
  row: number;
  col: number;
  cellSize: number;
}

export default function Cell({ row, col, cellSize }: CellProps) {
  const makeMove = useGameStore(state => state.makeMove);
  const isGameOver = useGameStore(state => state.isGameOver);
  const gameMode = useGameStore(state => state.gameMode);
  const currentPlayer = useGameStore(state => state.currentPlayer);

  const handleClick = () => {
    if (isGameOver) return;
    if (gameMode === 'ai' && currentPlayer === 'white') return;
    makeMove({ row, col });
  };

  return (
    <div
      onClick={handleClick}
      className="absolute cursor-pointer"
      style={{
        left: (col + 1) * cellSize - cellSize / 2,
        top: (row + 1) * cellSize - cellSize / 2,
        width: cellSize,
        height: cellSize,
      }}
    />
  );
}
