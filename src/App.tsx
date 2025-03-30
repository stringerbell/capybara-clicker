import { useState, useEffect } from 'react'
import './App.css'

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  clickValue: number;
  owned: number;
  emoji: string;
}

function Capybara() {
  return (
    <div className="capybara-body">
      <div className="capybara-head">
        <div className="capybara-ear left"></div>
        <div className="capybara-ear right"></div>
        <div className="capybara-eye"></div>
        <div className="capybara-nose"></div>
        <div className="capybara-mouth"></div>
      </div>
      <div className="capybara-belly"></div>
      <div className="capybara-leg front"></div>
      <div className="capybara-leg back"></div>
      <div className="capybara-arm front"></div>
      <div className="capybara-arm back"></div>
    </div>
  );
}

function App() {
  const [clicks, setClicks] = useState(0);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: 'orange', name: 'Orange', cost: 10, clickValue: 1, owned: 0, emoji: '🍊' },
    { id: 'lemon', name: 'Lemon', cost: 50, clickValue: 2, owned: 0, emoji: '🍋' },
    { id: 'sombrero', name: 'Sombrero', cost: 200, clickValue: 5, owned: 0, emoji: '👒' },
    { id: 'bird', name: 'Bird', cost: 1000, clickValue: 10, owned: 0, emoji: '🐦' },
    { id: 'crown', name: 'Crown', cost: 5000, clickValue: 25, owned: 0, emoji: '👑' },
    { id: 'rainbow', name: 'Rainbow', cost: 25000, clickValue: 50, owned: 0, emoji: '🌈' },
    { id: 'unicorn', name: 'Unicorn', cost: 100000, clickValue: 100, owned: 0, emoji: '🦄' },
    { id: 'dragon', name: 'Dragon', cost: 500000, clickValue: 250, owned: 0, emoji: '🐉' },
  ]);

  const handleClick = () => {
    const totalClickValue = upgrades.reduce((sum, upgrade) => sum + (upgrade.owned * upgrade.clickValue), 1);
    setClicks(prev => prev + totalClickValue);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || clicks < upgrade.cost) return;

    setUpgrades(prev => prev.map(u => {
      if (u.id === upgradeId) {
        return { ...u, owned: u.owned + 1 };
      }
      return u;
    }));
    setClicks(prev => prev - upgrade.cost);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const totalClicksPerSecond = upgrades.reduce((sum, upgrade) => sum + (upgrade.owned * upgrade.clickValue), 0);
      setClicksPerSecond(totalClicksPerSecond);
      setClicks(prev => prev + totalClicksPerSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [upgrades]);

  // Get the highest owned upgrade to determine which capybara image to show
  const highestOwnedUpgrade = upgrades.reduce((highest, current) => 
    current.owned > highest.owned ? current : highest
  );

  return (
    <div className="game-container">
      <h1>Capybara Clicker</h1>
      <div className="stats">
        <p>Clicks: {clicks.toLocaleString()}</p>
        <p>Clicks per second: {clicksPerSecond.toLocaleString()}</p>
      </div>
      
      <div className="capybara-container">
        <button 
          className="capybara"
          onClick={handleClick}
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
        {upgrades.map(upgrade => (
          <div key={upgrade.id} className="upgrade-item">
            <span>
              {upgrade.emoji} {upgrade.name} ({upgrade.owned})
            </span>
            <button 
              onClick={() => buyUpgrade(upgrade.id)}
              disabled={clicks < upgrade.cost}
            >
              Buy for {upgrade.cost.toLocaleString()} clicks
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
