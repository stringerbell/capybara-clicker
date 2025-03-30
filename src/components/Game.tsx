import { useEffect } from 'react'
import capybaraImage from '../assets/capybara-transparent.png'
import { LeaderboardEntry } from './Leaderboard'

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

function Capybara() {
  return (
    <img 
      src={capybaraImage}
      alt="Cute Capybara"
      className="capybara-image"
    />
  );
}

interface GameProps {
  gameState: GameState;
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  onNavigateToLeaderboard: () => void;
  onResetGame: () => void;
}

function Game({ gameState, setGameState, onNavigateToLeaderboard, onResetGame }: GameProps) {
  const handleClick = () => {
    const totalClickValue = gameState.upgrades.reduce((sum, upgrade) => sum + (upgrade.owned * upgrade.clickValue), 1);
    setGameState(prev => ({
      ...prev,
      clicks: prev.clicks + totalClickValue
    }));
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || gameState.clicks < upgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      clicks: prev.clicks - upgrade.cost,
      upgrades: prev.upgrades.map(u => {
        if (u.id === upgradeId) {
          return { ...u, owned: u.owned + 1 };
        }
        return u;
      })
    }));
  };

  const handleSpamPenalty = (nickname: string) => {
    const leaderboardEntries = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const filteredEntries = leaderboardEntries.filter((entry: LeaderboardEntry) => entry.nickname !== nickname);
    localStorage.setItem('leaderboard', JSON.stringify(filteredEntries));
    alert(`⚠️ Save button spam detected!\nAll records for "${nickname}" have been deleted as a penalty.`);
  };

  const saveRecord = () => {
    if (!gameState.isGameActive) {
      alert("This game is already finished! Start a new game to save more records.");
      return;
    }

    const currentTime = Date.now();
    if (currentTime - gameState.lastSaveTime < 2000) { // If less than 2 seconds between saves
      handleSpamPenalty(gameState.nickname.trim() || 'Anonymous');
      return;
    }

    if (!gameState.nickname.trim()) {
      const newNickname = prompt('Enter your nickname:') || 'Anonymous';
      setGameState(prev => ({ ...prev, nickname: newNickname }));
      localStorage.setItem('nickname', newNickname);
    }

    const confirmSave = confirm(
      "Are you sure you want to end your turn and save your score?\n" +
      "This will end your current game."
    );

    if (!confirmSave) return;

    const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const newEntry: LeaderboardEntry = {
      nickname: gameState.nickname.trim() || 'Anonymous',
      clicks: gameState.clicks,
      timeElapsed,
      date: new Date().toISOString()
    };

    const leaderboardEntries = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const newEntries = [...leaderboardEntries, newEntry]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    localStorage.setItem('leaderboard', JSON.stringify(newEntries));
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      lastSaveTime: currentTime
    }));
    onNavigateToLeaderboard();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const totalClicksPerSecond = gameState.upgrades.reduce((sum, upgrade) => sum + (upgrade.owned * upgrade.clickValue), 0);
      setGameState(prev => ({
        ...prev,
        clicksPerSecond: totalClicksPerSecond,
        clicks: prev.clicks + totalClicksPerSecond
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.upgrades]);

  const highestOwnedUpgrade = gameState.upgrades.reduce((highest, current) => 
    current.owned > highest.owned ? current : highest
  );

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Capybara Clicker</h1>
        <button className="view-leaderboard" onClick={onNavigateToLeaderboard}>
          🏆 View Leaderboard
        </button>
      </div>

      <div className="stats">
        <p>Clicks: {gameState.clicks.toLocaleString()}</p>
        <p>Clicks per second: {gameState.clicksPerSecond.toLocaleString()}</p>
        <div className="nickname-container">
          <input
            type="text"
            placeholder="Enter nickname"
            value={gameState.nickname}
            onChange={(e) => {
              setGameState(prev => ({ ...prev, nickname: e.target.value }));
              localStorage.setItem('nickname', e.target.value);
            }}
            className="nickname-input"
            disabled={!gameState.isGameActive}
          />
          {gameState.isGameActive ? (
            <button className="save-record" onClick={saveRecord}>
              📝 Save Record
            </button>
          ) : (
            <button className="new-game" onClick={onResetGame}>
              🎮 New Game
            </button>
          )}
        </div>
      </div>
      
      <div className="capybara-container">
        <button 
          className="capybara"
          onClick={handleClick}
          disabled={!gameState.isGameActive}
        >
          {highestOwnedUpgrade.owned > 0 ? (
            <div className="capybara-with-upgrade">
              <Capybara />
              <span className="upgrade-emoji">{highestOwnedUpgrade.emoji}</span>
            </div>
          ) : (
            <Capybara />
          )}
        </button>
      </div>

      <div className="upgrades-shop">
        <h2>Upgrades</h2>
        {gameState.upgrades.map(upgrade => (
          <div key={upgrade.id} className="upgrade-item">
            <span>
              {upgrade.emoji} {upgrade.name} ({upgrade.owned})
            </span>
            <button 
              onClick={() => buyUpgrade(upgrade.id)}
              disabled={gameState.clicks < upgrade.cost || !gameState.isGameActive}
            >
              Buy for {upgrade.cost.toLocaleString()} clicks
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Game; 