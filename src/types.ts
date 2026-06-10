export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type GameMode = 'pvp' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameOverReason = 'win' | 'timeout' | null;

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  gameMode: GameMode;
  isGameOver: boolean;
  gameOverReason: GameOverReason;
}

export interface Position {
  row: number;
  col: number;
}

export interface MoveRecord {
  row: number;
  col: number;
  player: Player;
}

export interface TimerState {
  blackTime: number;
  whiteTime: number;
  isRunning: boolean;
}
