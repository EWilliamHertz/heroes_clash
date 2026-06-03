import React, { useState, useEffect } from 'react';
import './App.css';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

function App() {
  const [currentPage, setCurrentPage] = useState('lobby');
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(() => {
    const stored = localStorage.getItem('heroesClashPlayerId');
    if (stored) return stored;
    const newId = `player_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('heroesClashPlayerId', newId);
    return newId;
  });
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('heroesClashPlayerName') || '';
  });

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('heroesClashPlayerName', playerName);
    }
  }, [playerName]);

  const handleGameSelected = (selectedGameId) => {
    setGameId(selectedGameId);
    setCurrentPage('game');
  };

  const handleBackToLobby = () => {
    setGameId(null);
    setCurrentPage('lobby');
  };

  return (
    <div className="app">
      {currentPage === 'lobby' ? (
        <Lobby
          playerId={playerId}
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onGameSelected={handleGameSelected}
        />
      ) : (
        <Game
          gameId={gameId}
          playerId={playerId}
          playerName={playerName}
          onBack={handleBackToLobby}
        />
      )}
    </div>
  );
}

export default App;
