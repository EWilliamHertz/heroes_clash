import React from 'react';
import './ResourcePanel.css';

function ResourcePanel({ player }) {
  if (!player) return <div className="resource-panel">Loading...</div>;

  const unitSymbols = {
    militia: '👥',
    archer: '🏹',
    knight: '⚔️',
    mage: '✨'
  };

  const buildingSymbols = {
    tower: '🗼',
    barracks: '🏹',
    castle: '🏯',
    mill: '🏭',
    shrine: '⛪'
  };

  return (
    <div className="resource-panel">
      {/* Gold */}
      <div className="resource-item gold">
        <span className="resource-icon">💰</span>
        <span className="resource-label">Gold</span>
        <span className="resource-value">{player.gold}</span>
      </div>

      {/* Units */}
      <div className="resource-section">
        <h4>⚔️ Units ({Object.values(player.units).reduce((a, b) => a + b, 0)})</h4>
        <div className="units-list">
          {Object.entries(player.units).map(([type, count]) => (
            <div key={type} className="unit-item">
              <span className="unit-icon">{unitSymbols[type]}</span>
              <span className="unit-name">{type}</span>
              <span className="unit-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buildings */}
      {player.buildings.length > 0 && (
        <div className="resource-section">
          <h4>🏢 Buildings ({player.buildings.length})</h4>
          <div className="buildings-list">
            {player.buildings.map((building, idx) => (
              <div key={idx} className="building-item">
                <span className="building-icon">{buildingSymbols[building.type]}</span>
                <span className="building-name">{building.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Economy Info */}
      <div className="economy-info">
        <p>💵 Income per turn: <strong>20 + {player.buildings.length * 5}</strong></p>
      </div>
    </div>
  );
}

export default ResourcePanel;
