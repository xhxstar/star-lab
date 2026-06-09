import { create } from 'zustand';
import { Board, GameState, Player, GameMode, Position } from '../types';
import { createEmptyBoard, checkWin, getAIMove, BOARD_SIZE } from '../utils/ai';

interface GameStore extends GameState {
  initGame: (mode: GameMode) => void;
  makeMove: (position: Position) => void;
  resetGame: () => void;
}

const getInitialState = (): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  winner: null,
  gameMode: 'pvp',
  isGameOver: false,
});

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),

  initGame: (mode: GameMode) => {
    set({
      ...getInitialState(),
      gameMode: mode,
    });
  },

  makeMove: (position: Position) => {
    const { board, currentPlayer, gameMode, isGameOver: gameOver } = get();

    if (gameOver || board[position.row][position.col] !== null) return;

    const newBoard = board.map(row => [...row]);
    newBoard[position.row][position.col] = currentPlayer;

    const winner = checkWin(newBoard, currentPlayer) ? currentPlayer : null;
    const isGameOver = winner !== null;

    set({
      board: newBoard,
      winner,
      isGameOver,
      currentPlayer: isGameOver ? currentPlayer : (currentPlayer === 'black' ? 'white' : 'black'),
    });

    if (!isGameOver && gameMode === 'ai' && get().currentPlayer === 'white') {
      setTimeout(() => {
        const aiMove = getAIMove(get().board);
        if (aiMove) {
          get().makeMove(aiMove);
        }
      }, 500);
    }
  },

  resetGame: () => {
    set(getInitialState());
  },
}));
