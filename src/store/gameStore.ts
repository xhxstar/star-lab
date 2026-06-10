import { create } from 'zustand';
import { GameState, GameMode, Position, Difficulty, MoveRecord, TimerState } from '../types';
import { createEmptyBoard, checkWin, getAIMove } from '../utils/ai';

const TIME_LIMIT = 30;

interface GameStore extends GameState {
  difficulty: Difficulty;
  moveHistory: MoveRecord[];
  timer: TimerState;
  initGame: (mode: GameMode, difficulty?: Difficulty) => void;
  makeMove: (position: Position) => void;
  resetGame: () => void;
  undoMove: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
}

const getInitialState = (): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  winner: null,
  gameMode: 'pvp',
  isGameOver: false,
  gameOverReason: null,
});

const getInitialTimer = (): TimerState => ({
  blackTime: TIME_LIMIT,
  whiteTime: TIME_LIMIT,
  isRunning: false,
});

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),
  difficulty: 'medium',
  moveHistory: [],
  timer: getInitialTimer(),

  initGame: (mode: GameMode, difficulty: Difficulty = 'medium') => {
    set({
      ...getInitialState(),
      gameMode: mode,
      difficulty,
      moveHistory: [],
      timer: getInitialTimer(),
    });
  },

  makeMove: (position: Position) => {
    const { board, currentPlayer, gameMode, isGameOver: gameOver, difficulty } = get();

    if (gameOver || board[position.row][position.col] !== null) return;

    const newBoard = board.map(row => [...row]);
    newBoard[position.row][position.col] = currentPlayer;

    const winner = checkWin(newBoard, currentPlayer) ? currentPlayer : null;
    const isGameOver = winner !== null;

    const moveRecord: MoveRecord = {
      row: position.row,
      col: position.col,
      player: currentPlayer,
    };

    set(state => ({
      board: newBoard,
      winner,
      isGameOver,
      gameOverReason: isGameOver ? 'win' : null,
      currentPlayer: isGameOver ? currentPlayer : (currentPlayer === 'black' ? 'white' : 'black'),
      moveHistory: [...state.moveHistory, moveRecord],
      timer: {
        ...state.timer,
        isRunning: !isGameOver,
      },
    }));

    if (!isGameOver && gameMode === 'ai' && get().currentPlayer === 'white') {
      setTimeout(() => {
        const aiMove = getAIMove(get().board, difficulty);
        if (aiMove) {
          get().makeMove(aiMove);
        }
      }, 500);
    }
  },

  undoMove: () => {
    const { moveHistory, gameMode } = get();

    if (moveHistory.length === 0) return;

    const newHistory = [...moveHistory];
    const lastMove = newHistory.pop()!;

    const newBoard = createEmptyBoard();
    for (const move of newHistory) {
      newBoard[move.row][move.col] = move.player;
    }

    const currentPlayer = lastMove.player;

    set({
      board: newBoard,
      currentPlayer,
      moveHistory: newHistory,
      winner: null,
      isGameOver: false,
      timer: {
        ...getInitialTimer(),
        isRunning: true,
      },
    });

    if (gameMode === 'ai' && currentPlayer === 'white') {
      setTimeout(() => {
        const aiMove = getAIMove(get().board, get().difficulty);
        if (aiMove) {
          get().makeMove(aiMove);
        }
      }, 500);
    }
  },

  resetGame: () => {
    set({
      ...getInitialState(),
      difficulty: 'medium',
      moveHistory: [],
      timer: getInitialTimer(),
    });
  },

  startTimer: () => {
    set(state => ({
      timer: { ...state.timer, isRunning: true },
    }));
  },

  stopTimer: () => {
    set(state => ({
      timer: { ...state.timer, isRunning: false },
    }));
  },

  tickTimer: () => {
    const { timer, currentPlayer, isGameOver } = get();

    if (!timer.isRunning || isGameOver || currentPlayer === null) return;

    const playerTimeKey = currentPlayer === 'black' ? 'blackTime' : 'whiteTime';
    const newTime = timer[playerTimeKey] - 1;

    if (newTime <= 0) {
      const winner = currentPlayer === 'black' ? 'white' : 'black';
      set({
        timer: {
          ...timer,
          [playerTimeKey]: 0,
          isRunning: false,
        },
        winner,
        isGameOver: true,
        gameOverReason: 'timeout',
      });
      return;
    }

    set(state => ({
      timer: {
        ...state.timer,
        [playerTimeKey]: newTime,
      },
    }));
  },
}));
