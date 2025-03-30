import { useState } from 'react'
import './App.css'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  clickValue: number;
  owned: number;
  emoji: string;
}

interface GameState {
  clicks: number;
  clicksPerSecond: number;
  startTime: number;
  isGameActive: boolean;
  lastSaveTime: number;
  nickname: string;
  upgrades: Upgrade[];
}

const initialGameState: GameState = {
  clicks: 0,
  clicksPerSecond: 0,
  startTime: Date.now(),
  isGameActive: true,
  lastSaveTime: 0,
  nickname: localStorage.getItem('nickname') || '',
  upgrades: [
    { id: 'orange', name: 'Orange', cost: 10, clickValue: 1, owned: 0, emoji: '🍊' },
    { id: 'lemon', name: 'Lemon', cost: 50, clickValue: 2, owned: 0, emoji: '🍋' },
    { id: 'sombrero', name: 'Sombrero', cost: 200, clickValue: 5, owned: 0, emoji: '👒' },
    { id: 'bird', name: 'Bird', cost: 1000, clickValue: 10, owned: 0, emoji: '🐦' },
    { id: 'crown', name: 'Crown', cost: 5000, clickValue: 25, owned: 0, emoji: '👑' },
    { id: 'rainbow', name: 'Rainbow', cost: 25000, clickValue: 50, owned: 0, emoji: '🌈' },
    { id: 'unicorn', name: 'Unicorn', cost: 100000, clickValue: 100, owned: 0, emoji: '🦄' },
    { id: 'dragon', name: 'Dragon', cost: 500000, clickValue: 250, owned: 0, emoji: '🐉' },
  ]
};

function App() {
  const [currentPage, setCurrentPage] = useState<'game' | 'leaderboard'>('game');
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      startTime: Date.now(),
      nickname: gameState.nickname // Preserve the nickname
    });
  };

  return (
    <div className="app">
      {currentPage === 'game' ? (
        <Game 
          gameState={gameState}
          setGameState={setGameState}
          onNavigateToLeaderboard={() => setCurrentPage('leaderboard')}
          onResetGame={resetGame}
        />
      ) : (
        <Leaderboard 
          onNavigateToGame={() => setCurrentPage('game')}
        />
      )}
    </div>
  );
}

export default App
