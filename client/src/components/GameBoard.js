import React from 'react';
import './GameBoard.css';

function GameBoard({ gameState, onTileClick }) {
  const getTileSymbol = (terrain) => {
    const symbols = {
      grass: '🌾',
      water: '💧',
      mountain: '⛰️',
      forest: '🌲',
      unknown: '❓'
    };
    return symbols[terrain] || '?';
  };

  const getTileColor = (terrain) => {
    const colors = {
      grass: '#2ecc71',
      water: '#3498db',
      mountain: '#95a5a6',
      forest: '#27ae60',
      unknown: '#555'
    };
    return colors[terrain] || '#333';
  };

  if (!gameState || !gameState.map || gameState.map.length === 0) {
    return <div className="game-board-empty">Loading map...</div>;
  }

  return (
    <div className="game-board">
      <div className="board-title">🗺️ Game Map (16×16)</div>
      <div className="board-grid">
        {gameState.map.map((row, y) => (
          <div key={y} className="board-row">
            {row.map((terrain, x) => (
              <div
                key={`${x}-${y}`}
                className="board-tile"
                style={{ backgroundColor: getTileColor(terrain) }}
                onClick={() => onTileClick(x, y)}
                title={`(${x}, ${y}) - ${terrain}`}
              >
                <span className="tile-symbol">{getTileSymbol(terrain)}</span>

                {/* Your Hero */}
                {gameState.yourPlayer &&
                  gameState.yourPlayer.heroX === x &&
                  gameState.yourPlayer.heroY === y && (
                  <div className="hero your-hero" title="Your Hero">
                    👑
                  </div>
                )}

                {/* Opponent Hero */}
                {gameState.opponent &&
                  gameState.opponent.heroX === x &&
                  gameState.opponent.heroY === y && (
                  <div className="hero opponent-hero" title="Opponent Hero">
                    ⚔️
                  </div>
                )}

                {/* Buildings */}
                {gameState.yourPlayer &&
                  gameState.yourPlayer.buildings.map((building, idx) => (
                    building.x === x &&
                    building.y === y && (
                      <div key={idx} className="building" title={building.type}>
                        {getBuildingSymbol(building.type)}
                      </div>
                    )
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="board-legend">
        <div className="legend-item">🌾 Grass (passable)</div>
        <div className="legend-item">💧 Water (blocked)</div>
        <div className="legend-item">⛰️ Mountain (terrain)</div>
        <div className="legend-item">🌲 Forest (dense)</div>
        <div className="legend-item">❓ Fog of War</div>
      </div>
    </div>
  );
}

function getBuildingSymbol(type) {
  const symbols = {
    tower: '🗼',
    barracks: '🏹',
    castle: '🏯',
    mill: '🏭',
    shrine: '⛪'
  };
  return symbols[type] || '🏢';
}

export default GameBoard;
