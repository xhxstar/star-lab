export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type GameMode = 'pvp' | 'ai';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  gameMode: GameMode;
  isGameOver: boolean;
}

export interface Position {
  row: number;
  col: number;
}
