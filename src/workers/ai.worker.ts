import { Board, Player, Position, Difficulty } from '../types';

const BOARD_SIZE = 15;

// 中心位置权重矩阵
const POSITION_WEIGHT: number[][] = [];
for (let i = 0; i < BOARD_SIZE; i++) {
  POSITION_WEIGHT[i] = [];
  for (let j = 0; j < BOARD_SIZE; j++) {
    const distFromCenter = Math.abs(i - 7) + Math.abs(j - 7);
    POSITION_WEIGHT[i][j] = Math.max(0, 14 - distFromCenter * 1.5);
  }
}

// 棋子连线评估分数
const SCORES = {
  five: 1000000,
  live_four: 100000,
  rush_four: 10000,
  dead_four: 8000,
  live_three: 8000,
  sleep_three: 500,
  live_two: 200,
  sleep_two: 50,
  live_one: 10,
};

const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

const MAX_SEARCH_TIME = 7000; // 7秒

function getLineInfo(line: Player[], player: Player): { count: number; empty: number; blocks: number } {
  let count = 0;
  let empty = 0;
  let blocks = 0;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === player) {
      count++;
    } else if (line[i] === null) {
      empty++;
    } else {
      blocks++;
    }
  }

  return { count, empty, blocks };
}

function evaluateLine(line: Player[], player: Player): number {
  const info = getLineInfo(line, player);
  const { count, empty, blocks } = info;

  if (blocks === 2) return 0;
  if (count >= 5) return SCORES.five;
  if (count === 4) {
    if (empty === 1) {
      return blocks === 0 ? SCORES.live_four : SCORES.rush_four;
    }
    if (empty === 2) {
      return blocks === 0 ? SCORES.live_three : SCORES.sleep_three;
    }
  }
  if (count === 3) {
    if (empty === 1) {
      return blocks === 1 ? SCORES.sleep_three : SCORES.live_three;
    }
    if (empty === 2) {
      return blocks === 0 ? SCORES.live_two : SCORES.sleep_two;
    }
  }
  if (count === 2) {
    if (empty === 1) {
      return blocks === 1 ? SCORES.sleep_two : SCORES.live_two;
    }
    if (empty === 2) {
      return SCORES.live_two;
    }
    if (empty === 3) {
      return SCORES.live_one;
    }
  }
  if (count === 1 && empty === 4) {
    return SCORES.live_one;
  }

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

  // 只评估有棋子的邻近区域
  const activeCells = new Set<string>();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              activeCells.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  if (activeCells.size === 0) return 0;

  // 评估每个活跃位置
  for (const key of activeCells) {
    const [row, col] = key.split(",").map(Number);
    score += POSITION_WEIGHT[row][col];

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

// 检测必杀棋（威胁检测）
function findThreats(board: Board, player: Player): Position[] {
  const threats: Position[] = [];
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) continue;

      let isThreat = false;
      for (const [dr, dc] of directions) {
        board[row][col] = player;
        const info = getLineInfo([board[row - dr]?.[col - dc], board[row][col], board[row + dr]?.[col + dc], board[row + dr * 2]?.[col + dc * 2], board[row + dr * 3]?.[col + dc * 3]], player);
        board[row][col] = null;

        if (info.count >= 4 && info.empty === 1) {
          isThreat = true;
          break;
        }
      }

      if (isThreat) {
        threats.push({ row, col });
      }
    }
  }

  return threats;
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

// 快速评估位置价值（用于排序）
function quickEvaluate(board: Board, pos: Position, player: Player): number {
  let score = POSITION_WEIGHT[pos.row][pos.col];
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    const line: Player[] = [];
    for (let i = -4; i <= 4; i++) {
      const r = pos.row + dr * i;
      const c = pos.col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        line.push(board[r][c]);
      }
    }
    score += evaluateLine(line, player) * 0.5;
  }

  return score;
}

interface SearchResult {
  score: number;
  position: Position | null;
  timeLimitReached: boolean;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  startTime: number,
  aiPlayer: Player,
  humanPlayer: Player
): SearchResult {
  if (Date.now() - startTime > MAX_SEARCH_TIME) {
    return { score: 0, position: null, timeLimitReached: true };
  }

  if (checkWin(board, humanPlayer)) return { score: -SCORES.five, position: null, timeLimitReached: false };
  if (checkWin(board, aiPlayer)) return { score: SCORES.five, position: null, timeLimitReached: false };
  if (depth === 0) {
    return { 
      score: evaluatePosition(board, aiPlayer) - evaluatePosition(board, humanPlayer), 
      position: null, 
      timeLimitReached: false 
    };
  }

  const positions = getNeighbors(board);
  if (positions.length === 0) {
    return { score: 0, position: { row: 7, col: 7 }, timeLimitReached: false };
  }

  // 预排序：优先检查威胁位置
  const opponent = isMaximizing ? humanPlayer : aiPlayer;
  const threats = findThreats(board, opponent);
  
  positions.sort((a, b) => {
    const aIsThreat = threats.some(t => t.row === a.row && t.col === a.col);
    const bIsThreat = threats.some(t => t.row === b.row && t.col === b.col);
    if (aIsThreat && !bIsThreat) return -1;
    if (!aIsThreat && bIsThreat) return 1;

    const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
    const scoreA = quickEvaluate(board, a, currentPlayer);
    const scoreB = quickEvaluate(board, b, currentPlayer);
    return scoreB - scoreA;
  });

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestPosition: Position | null = null;
  let timeLimitReached = false;

  for (const pos of positions) {
    board[pos.row][pos.col] = isMaximizing ? aiPlayer : humanPlayer;

    const result = minimax(board, depth - 1, alpha, beta, !isMaximizing, startTime, aiPlayer, humanPlayer);

    board[pos.row][pos.col] = null;

    if (result.timeLimitReached) {
      timeLimitReached = true;
      break;
    }

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

  return { score: bestScore, position: bestPosition, timeLimitReached };
}

function calculateAIMove(board: Board, difficulty: Difficulty): Position | null {
  const depth = DEPTH_BY_DIFFICULTY[difficulty];
  const aiPlayer: Player = 'white';
  const humanPlayer: Player = 'black';

  const positions = getNeighbors(board);
  if (positions.length === 0) {
    return { row: 7, col: 7 };
  }

  if (positions.length === 1) {
    return positions[0];
  }

  // 先检查必杀棋
  const aiThreats = findThreats(board, aiPlayer);
  if (aiThreats.length > 0) {
    return aiThreats[0];
  }

  const humanThreats = findThreats(board, humanPlayer);
  if (humanThreats.length > 0) {
    return humanThreats[0];
  }

  let bestPosition: Position | null = positions[0];
  const startTime = Date.now();

  for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
    const result = minimax(board, currentDepth, -Infinity, Infinity, true, startTime, aiPlayer, humanPlayer);

    if (result.position !== null) {
      bestPosition = result.position;
    }

    if (result.timeLimitReached) {
      break;
    }

    if (result.score >= SCORES.five) {
      return result.position;
    }

    if (Date.now() - startTime > MAX_SEARCH_TIME - 500) {
      break;
    }
  }

  return bestPosition;
}

self.onmessage = (e: MessageEvent) => {
  const { board, difficulty } = e.data;
  const result = calculateAIMove(board, difficulty);
  self.postMessage(result);
};
