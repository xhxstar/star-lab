import { Board, Player, Position, Difficulty } from '../types';

const BOARD_SIZE = 15;

const SCORES: Record<string, number> = {
  'five': 100000,
  'live_four': 10000,
  'rush_four': 1000,
  'live_three': 1000,
  'sleep_three': 100,
  'live_two': 100,
  'sleep_two': 10,
  'live_one': 1,
};

const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

function createEmptyBoard(): Board {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function getPieceCount(line: Player[]): { black: number; white: number; empty: number } {
  return {
    black: line.filter(p => p === 'black').length,
    white: line.filter(p => p === 'white').length,
    empty: line.filter(p => p === null).length,
  };
}

function evaluateLine(line: Player[], player: Player): number {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  const counts = getPieceCount(line);

  const playerKey = player === 'black' ? 'black' : 'white';
  const opponentKey = opponent === 'black' ? 'black' : 'white';

  if (counts[opponentKey] > 0) return 0;
  if (counts[playerKey] === 5) return SCORES['five'];
  if (counts[playerKey] === 4 && counts.empty === 1) return SCORES['live_four'];
  if (counts[playerKey] === 4 && counts.empty === 2) return SCORES['rush_four'];
  if (counts[playerKey] === 3 && counts.empty === 2) return SCORES['live_three'];
  if (counts[playerKey] === 3 && counts.empty === 3) return SCORES['sleep_three'];
  if (counts[playerKey] === 2 && counts.empty === 3) return SCORES['live_two'];
  if (counts[playerKey] === 2 && counts.empty === 4) return SCORES['sleep_two'];
  if (counts[playerKey] === 1) return SCORES['live_one'];
  return 0;
}

function evaluatePosition(board: Board, player: Player): number {
  let score = 0;
  const directions: [number, number][][] = [
    [[0, 1], [0, -1]],
    [[1, 0], [-1, 0]],
    [[1, 1], [-1, -1]],
    [[1, -1], [-1, 1]],
  ];

  // Only evaluate cells near existing pieces
  const activeCells = new Set<string>();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              activeCells.add(nr + "," + nc);
            }
          }
        }
      }
    }
  }

  // Empty board
  if (activeCells.size === 0) return 0;

  for (const key of activeCells) {
    const [row, col] = key.split(",").map(Number);
    for (const [dir1, dir2] of directions) {
      const line: Player[] = [board[row][col]];

      for (let i = 1; i <= 4; i++) {
        const r1 = row + dir1[0] * i;
        const c1 = col + dir1[1] * i;
        if (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE) {
          line.push(board[r1][c1]);
        }
      }

      for (let i = 1; i <= 4; i++) {
        const r2 = row + dir2[0] * i;
        const c2 = col + dir2[1] * i;
        if (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE) {
          line.push(board[r2][c2]);
        }
      }

      score += evaluateLine(line, player);
    }
  }

  return score;
}

function checkWin(board: Board, player: Player): boolean {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== player) continue;

      for (const [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
          } else break;
        }
        if (count >= 5) return true;
      }
    }
  }
  return false;
}

function getNeighbors(board: Board): Position[] {
  const visited = new Set<string>();
  const neighbors: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            const key = `${nr},${nc}`;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE &&
                board[nr][nc] === null && !visited.has(key)) {
              visited.add(key);
              neighbors.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }
  return neighbors;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; position: Position | null } {
  const aiPlayer: Player = 'white';
  const humanPlayer: Player = 'black';

  if (checkWin(board, humanPlayer)) return { score: -SCORES['five'], position: null };
  if (checkWin(board, aiPlayer)) return { score: SCORES['five'], position: null };
  if (depth === 0) {
    return { score: evaluatePosition(board, aiPlayer) - evaluatePosition(board, humanPlayer), position: null };
  }

  const positions = getNeighbors(board);
  if (positions.length === 0) {
    return { score: 0, position: { row: 7, col: 7 } };
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestPosition: Position | null = null;

  for (const pos of positions) {
    board[pos.row][pos.col] = isMaximizing ? aiPlayer : humanPlayer;

    const result = minimax(board, depth - 1, alpha, beta, !isMaximizing);

    board[pos.row][pos.col] = null;

    if (isMaximizing) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestPosition = pos;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestPosition = pos;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) break;
  }

  return { score: bestScore, position: bestPosition };
}

export function getAIMove(board: Board, difficulty: Difficulty = 'medium'): Position | null {
  const depth = DEPTH_BY_DIFFICULTY[difficulty];
  const result = minimax(board, depth, -Infinity, Infinity, true);
  return result.position;
}

export { BOARD_SIZE, checkWin, createEmptyBoard };
