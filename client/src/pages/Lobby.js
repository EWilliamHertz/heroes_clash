import React, { useState, useEffect } from 'react';
import './Lobby.css';

function Lobby({ playerId, playerName, onPlayerNameChange, onGameSelected }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data.games || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load games: ' + err.message);
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!nameInput.trim()) {
      setError('Please enter a player name');
      return;
    }

    try {
      onPlayerNameChange(nameInput);
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: nameInput,
          playerId
        })
      });

      const data = await response.json();
      if (data.gameId) {
        onGameSelected(data.gameId);
      }
    } catch (err) {
      setError('Failed to create game: ' + err.message);
    }
  };

  const handleJoinGame = (gameId) => {
    if (!nameInput.trim()) {
      setError('Please enter a player name');
      return;
    }
    onPlayerNameChange(nameInput);
    onGameSelected(gameId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getGameAge = (createdAt) => {
    const hours = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>⚔️ Heroes Clash</h1>
        <p>Turn-based Multiplayer Strategy Game</p>
      </div>

      {/* Player Setup */}
      <div className="player-setup">
        <input
          type="text"
          placeholder="Enter your hero name..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          maxLength="20"
          className="player-name-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create Game Button */}
      <div className="create-game-section">
        {!showCreateForm ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Create New Game
          </button>
        ) : (
          <div className="create-game-form">
            <p>Starting a new game as <strong>{nameInput || 'Unknown'}</strong></p>
            <button className="btn btn-success" onClick={handleCreateGame}>
              ✓ Create Game
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              ✗ Cancel
            </button>
          </div>
        )}
      </div>

      {/* Games List */}
      <div className="games-section">
        <h2>Active Games</h2>

        {loading ? (
          <p className="loading">Loading games...</p>
        ) : games.length === 0 ? (
          <p className="no-games">No games available. Create one to get started!</p>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <div key={game.gameId} className={`game-card ${game.status}`}>
                <div className="game-card-header">
                  <h3>{game.status === 'waiting' ? '⏳ Waiting' : '🎮 Active'}</h3>
                  <span className="game-id">{game.gameId}</span>
                </div>

                <div className="game-details">
                  <div className="player-info">
                    <span className="label">👤 Creator:</span>
                    <strong>{game.player1.name}</strong>
                  </div>

                  {game.player2 && (
                    <div className="player-info">
                      <span className="label">👤 Opponent:</span>
                      <strong>{game.player2.name}</strong>
                    </div>
                  )}

                  <div className="game-meta">
                    <span>Created: {getGameAge(game.createdAt)}</span>
                    <span>Players: {game.playerCount}/2</span>
                  </div>
                </div>

                {game.status === 'waiting' && (
                  <button
                    className="btn btn-join"
                    onClick={() => handleJoinGame(game.gameId)}
                  >
                    🎯 Join Game
                  </button>
                )}

                {game.status === 'active' && playerId === game.player1.id && (
                  <button
                    className="btn btn-resume"
                    onClick={() => handleJoinGame(game.gameId)}
                  >
                    ▶️ Resume Game
                  </button>
                )}

                {game.status === 'active' && game.player2 && playerId === game.player2.id && (
                  <button
                    className="btn btn-resume"
                    onClick={() => handleJoinGame(game.gameId)}
                  >
                    ▶️ Resume Game
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lobby-footer">
        <p>💡 Tip: Games close after 7 days of inactivity (2 players) or 24 hours (1 player)</p>
      </div>
    </div>
  );
}

export default Lobby;
