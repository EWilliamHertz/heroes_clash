import React, { useState, useEffect, useRef } from 'react';
import './Game.css';
import GameBoard from '../components/GameBoard';
import HeroInfo from '../components/HeroInfo';
import ResourcePanel from '../components/ResourcePanel';
import ActionPanel from '../components/ActionPanel';
import Objectives from '../components/Objectives';

function Game({ gameId, playerId, playerName, onBack }) {
  const [gameState, setGameState] = useState(null);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const ws = useRef(null);
  const messageTimeoutRef = useRef(null);

  // Open separate windows for different components
  const openWindow = (component) => {
    const width = component === 'map' ? 1000 : 600;
    const height = component === 'map' ? 800 : 600;
    const url = `${window.location.origin}?gameId=${gameId}&component=${component}`;
    window.open(url, `heroes-clash-${component}`, `width=${width},height=${height}`);
  };

  useEffect(() => {
    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('[WS] Connected');
      ws.current.send(JSON.stringify({
        type: 'join',
        gameId,
        playerId,
        playerName
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[WS] Message:', data.type);

      switch (data.type) {
        case 'joined':
          setGameState(data.gameState);
          setIsYourTurn(data.gameState.currentTurn === playerId);
          setLoading(false);
          localStorage.setItem(`gameState_${gameId}`, JSON.stringify(data.gameState));
          break;

        case 'opponentMoved':
          setGameState(data.gameState);
          setIsYourTurn(data.gameState.currentTurn === playerId);
          localStorage.setItem(`gameState_${gameId}`, JSON.stringify(data.gameState));
          showMessage('Opponent moved!');
          break;

        case 'opponentConnected':
          setGameState(data.gameState);
          setIsYourTurn(data.gameState.currentTurn === playerId);
          localStorage.setItem(`gameState_${gameId}`, JSON.stringify(data.gameState));
          showMessage('Opponent connected!');
          break;

        case 'moveResult':
          if (data.success) {
            showMessage(data.message || 'Action completed');
          } else {
            showMessage('❌ ' + (data.error || 'Action failed'), 'error');
          }
          break;

        case 'error':
          setError(data.error);
          break;

        default:
          break;
      }
    };

    ws.current.onerror = (error) => {
      console.error('[WS] Error:', error);
      setError('Connection error');
    };

    ws.current.onclose = () => {
      console.log('[WS] Disconnected');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [gameId, playerId, playerName]);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => setMessage(''), 3000);
  };

  const handleAction = (action) => {
    if (!isYourTurn) {
      showMessage('❌ Not your turn', 'error');
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'move',
        playerId,
        action
      }));
    } else {
      showMessage('❌ Connection lost', 'error');
    }
  };

  if (loading) {
    return (
      <div className="game-loading">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-error">
        <h2>⚠️ Connection Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={onBack}>Back to Lobby</button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-loading">
        <p>Waiting for game data...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>⚔️ Heroes Clash</h1>
        <div className="turn-indicator">
          {isYourTurn ? (
            <span className="your-turn">🎮 Your Turn</span>
          ) : (
            <span className="opponent-turn">⏳ Opponent's Turn</span>
          )}
        </div>
        <button className="btn-back" onClick={onBack}>← Back</button>
      </div>

      {message && (
        <div className={`message ${message.startsWith('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="game-layout">
        {/* Main Game Board */}
        <div className="main-panel">
          <GameBoard gameState={gameState} onTileClick={(x, y) => {
            if (isYourTurn) {
              handleAction({ type: 'move', x, y });
            }
          }} />
        </div>

        {/* Right Sidebar - Game Info */}
        <div className="sidebar">
          {/* Hero Info */}
          <div className="sidebar-section">
            <h3>⚔️ Hero</h3>
            <HeroInfo player={gameState.yourPlayer} opponent={gameState.opponent} />
          </div>

          {/* Resources */}
          <div className="sidebar-section">
            <h3>💰 Resources</h3>
            <ResourcePanel player={gameState.yourPlayer} />
          </div>

          {/* Objectives */}
          <div className="sidebar-section">
            <h3>🎯 Objectives</h3>
            <Objectives objectives={gameState.objectives} />
          </div>

          {/* Actions */}
          <div className="sidebar-section">
            <h3>⚡ Actions</h3>
            <ActionPanel
              player={gameState.yourPlayer}
              isYourTurn={isYourTurn}
              onRecruit={(unitType) => handleAction({ type: 'recruit', unitType })}
              onBuild={(buildingType) => handleAction({ type: 'build', buildingType, x: gameState.yourPlayer.heroX, y: gameState.yourPlayer.heroY })}
              onEndTurn={() => handleAction({ type: 'endTurn' })}
            />
          </div>

          {/* Multi-Window Controls */}
          <div className="sidebar-section">
            <h3>🪟 Windows</h3>
            <div className="window-buttons">
              <button className="window-btn" onClick={() => openWindow('map')}>
                🗺️ Map
              </button>
              <button className="window-btn" onClick={() => openWindow('hero')}>
                ⚔️ Hero
              </button>
              <button className="window-btn" onClick={() => openWindow('resources')}>
                💰 Resources
              </button>
              <button className="window-btn" onClick={() => openWindow('actions')}>
                ⚡ Actions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
