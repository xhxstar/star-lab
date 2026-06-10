import { Board, Player, Position, Difficulty } from '../types';

const BOARD_SIZE = 15;

const SCORES: Record<string, number> = {
  five: 100000,
  live_four: 10000,
  rush_four: 3000,
  live_three: 2000,
  sleep_three: 500,
  live_two: 200,
  sleep_two: 50,
};

const DEPTH_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const MAX_SEARCH_TIME = 4000;

function getLineInfo(line: Player[]): { count: number; empty: number; blocks: number } {
  let count = 0;
  let empty = 0;
  let blocks = 0;
  
  for (const piece of line) {
    if (piece === null) empty++;
    else count++;
  }
  
  if (line[0] !== null && line[0] !== undefined) blocks++;
  if (line[line.length - 1] !== null && line[line.length - 1] !== undefined) blocks++;
  
  return { count, empty, blocks };
}

function evaluateLine(line: Player[], player: Player): number {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  
  if (line.some(p => p === opponent)) return 0;
  
  const info = getLineInfo(line);
  
  if (info.count === 5) return SCORES.five;
  if (info.count === 4 && info.empty === 1 && info.blocks === 0) return SCORES.live_four;
  if (info.count === 4 && info.empty >= 1) return SCORES.rush_four;
  if (info.count === 3 && info.empty === 2 && info.blocks === 0) return SCORES.live_three;
  if (info.count === 3 && info.empty >= 2) return SCORES.sleep_three;
  if (info.count === 2 && info.empty === 3 && info.blocks === 0) return SCORES.live_two;
  if (info.count === 2 && info.empty >= 3) return SCORES.sleep_two;
  
  return 0;
}

function evaluatePosition(board: Board, player: Player): number {
  let score = 0;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) continue;
      
      for (const [dr, dc] of directions) {
        const line: Player[] = [];
        for (let i = -4; i <= 4; i++) {
          const r = row + dr * i;
          const c = col + dc * i;
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            line.push(board[r][c]);
          }
        }
        
        for (let i = 0; i <= line.length - 5; i++) {
          const window = line.slice(i, i + 5);
          score += evaluateLine(window, player);
        }
      }
    }
  }
  
  return score;
}

function getNeighbors(board: Board): Position[] {
  const visited = new Set<string>();
  const neighbors: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
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
  
  if (neighbors.length === 0) {
    return [{ row: 7, col: 7 }];
  }
  
  return neighbors;
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
          } else {
            break;
          }
        }
        if (count === 5) return true;
      }
    }
  }
  
  return false;
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
      timeLimitReached: false,
    };
  }
  
  const positions = getNeighbors(board);
  if (positions.length === 0) {
    return { score: 0, position: { row: 7, col: 7 }, timeLimitReached: false };
  }
  
  const maxCandidates = Math.min(positions.length, depth <= 1 ? 6 : depth <= 2 ? 10 : 12);
  
  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
  positions.sort((a, b) => {
    const testBoardA = board.map(r => [...r]);
    testBoardA[a.row][a.col] = currentPlayer;
    const scoreA = evaluatePosition(testBoardA, currentPlayer);
    
    const testBoardB = board.map(r => [...r]);
    testBoardB[b.row][b.col] = currentPlayer;
    const scoreB = evaluatePosition(testBoardB, currentPlayer);
    
    return scoreB - scoreA;
  });
  
  const candidates = positions.slice(0, maxCandidates);
  
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestPosition: Position | null = null;
  let timeLimitReached = false;
  
  for (const pos of candidates) {
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
  
  for (const pos of positions) {
    board[pos.row][pos.col] = aiPlayer;
    if (checkWin(board, aiPlayer)) {
      board[pos.row][pos.col] = null;
      return pos;
    }
    board[pos.row][pos.col] = null;
  }
  
  for (const pos of positions) {
    board[pos.row][pos.col] = humanPlayer;
    if (checkWin(board, humanPlayer)) {
      board[pos.row][pos.col] = null;
      return pos;
    }
    board[pos.row][pos.col] = null;
  }
  
  let bestPosition: Position | null = positions[0];
  const startTime = Date.now();
  
  for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
    if (Date.now() - startTime > MAX_SEARCH_TIME - 500) {
      break;
    }
    
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
  }
  
  return bestPosition;
}

self.onmessage = (e: MessageEvent) => {
  const { board, difficulty } = e.data;
  const result = calculateAIMove(board, difficulty);
  self.postMessage(result);
};
