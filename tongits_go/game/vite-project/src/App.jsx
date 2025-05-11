import React, { useState, useEffect } from 'react';
import GameFlow from './components/GameFlow';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/results`)
      .then(response => response.json())
      .then(data => {
        console.log('Game results:', data);
        setResults(data);
      });

    fetch(`http://localhost:3001/leaderboard`)
      .then(response => response.json())
      .then(data => {
        console.log('Leaderboard:', data);
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error('Invalid leaderboard data:', data);
        }
      });
  }, []);

  const fetchPlayerStats = (username) => {
    fetch(`http://localhost:3001/player-stats/${username}`)
      .then(response => response.json())
      .then(data => {
        console.log('Player stats:', data);
        setPlayerStats(data);
      });
  };

  return (
    <>
      <div>
        <h1>Tongits Game</h1>
        <GameFlow fetchPlayerStats={fetchPlayerStats} />
      </div>
      <div>
        <h2>Game Results</h2>
        <ul>
          {results.map(result => (
            <li key={result.id}>{result.player}: {result.result}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map(player => (
            <li key={player.username}>{player.username}: {player.wins} wins</li>
          ))}
        </ul>
      </div>
      {playerStats && (
        <div>
          <h2>Player Stats</h2>
          <p>Username: {playerStats.username}</p>
          <p>Wins: {playerStats.wins}</p>
          <p>Losses: {playerStats.losses}</p>
        </div>
      )}
    </>
  );
}

export default App;
