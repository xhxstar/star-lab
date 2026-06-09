import { useGameStore } from '../store/gameStore';
import { BOARD_SIZE } from '../utils/ai';
import Cell from './Cell';

export default function Board() {
  const board = useGameStore(state => state.board);

  const cellSize = Math.min(32, Math.floor((window.innerWidth * 0.85) / BOARD_SIZE));
  const boardSize = cellSize * (BOARD_SIZE - 1);

  return (
    <div
      className="relative bg-gradient-to-br from-wood-200 to-wood-100 rounded-lg shadow-2xl p-4"
      style={{ width: boardSize + cellSize * 2, height: boardSize + cellSize * 2 }}
    >
      <div
        className="relative"
        style={{ width: boardSize, height: boardSize }}
      >
        {Array(BOARD_SIZE).fill(null).map((_, row) =>
          Array(BOARD_SIZE).fill(null).map((_, col) => (
            <Cell key={`${row}-${col}`} row={row} col={col} cellSize={cellSize} />
          ))
        )}

        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={boardSize}
          height={boardSize}
        >
          {Array(BOARD_SIZE - 1).fill(null).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={0}
                y1={(i + 1) * cellSize}
                x2={boardSize}
                y2={(i + 1) * cellSize}
                stroke="#5D4037"
                strokeWidth="1"
              />
              <line
                x1={(i + 1) * cellSize}
                y1={0}
                x2={(i + 1) * cellSize}
                y2={boardSize}
                stroke="#5D4037"
                strokeWidth="1"
              />
            </g>
          ))}

          {[3, 7, 11].map((pos, i) =>
            [3, 7, 11].map((pos2, j) => (
              <circle
                key={`dot-${i}-${j}`}
                cx={(pos + 1) * cellSize}
                cy={(pos2 + 1) * cellSize}
                r="4"
                fill="#5D4037"
              />
            ))
          )}
        </svg>

        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (cell === null) return null;
            return (
              <div
                key={`piece-${rowIndex}-${colIndex}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-piece-drop"
                style={{
                  left: (colIndex + 1) * cellSize,
                  top: (rowIndex + 1) * cellSize,
                  width: cellSize * 0.85,
                  height: cellSize * 0.85,
                }}
              >
                <div
                  className={`w-full h-full rounded-full shadow-lg ${
                    cell === 'black'
                      ? 'bg-piece-black'
                      : 'bg-piece-white border border-gray-200'
                  }`}
                  style={{
                    boxShadow: cell === 'black'
                      ? 'inset -2px -2px 4px rgba(255,255,255,0.2), inset 2px 2px 4px rgba(0,0,0,0.3), 2px 2px 8px rgba(0,0,0,0.3)'
                      : 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(0,0,0,0.1), 2px 2px 8px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
