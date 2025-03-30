import React from 'react';

export interface LeaderboardEntry {
  nickname: string;
  clicks: number;
  timeElapsed: number;
  date: string;
}

interface LeaderboardProps {
  onNavigateToGame: () => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ onNavigateToGame }) => {
  const entries = JSON.parse(localStorage.getItem('leaderboard') || '[]') as LeaderboardEntry[];
  const sortedEntries = [...entries].sort((a, b) => b.clicks - a.clicks).slice(0, 10);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button className="back-to-game" onClick={onNavigateToGame}>
          🎮 Back to Game
        </button>
        <h1>🏆 Top 10 Clickers</h1>
      </div>

      <div className="leaderboard">
        <div className="leaderboard-entries">
          {sortedEntries.map((entry, index) => (
            <div key={index} className="leaderboard-entry">
              <span className="rank">#{index + 1}</span>
              <span className="nickname">{entry.nickname || 'Anonymous'}</span>
              <span className="clicks">{entry.clicks.toLocaleString()}</span>
              <span className="time">{formatTime(entry.timeElapsed)}</span>
              <span className="date">{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          ))}
          {sortedEntries.length === 0 && (
            <div className="no-entries">No records yet. Keep clicking!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 