import React, { useState } from 'react';
import './ActionPanel.css';

function ActionPanel({ player, isYourTurn, onRecruit, onBuild, onEndTurn }) {
  const [activeTab, setActiveTab] = useState('recruit');

  if (!player) return <div className="action-panel">Loading...</div>;

  const units = [
    { type: 'militia', icon: '👥', cost: 10, desc: 'Basic unit' },
    { type: 'archer', icon: '🏹', cost: 15, desc: 'Ranged' },
    { type: 'knight', icon: '⚔️', cost: 30, desc: 'Heavy' },
    { type: 'mage', icon: '✨', cost: 40, desc: 'Magic' }
  ];

  const buildings = [
    { type: 'tower', icon: '🗼', cost: 50, desc: 'Defense' },
    { type: 'barracks', icon: '🏹', cost: 60, desc: 'Recruit' },
    { type: 'mill', icon: '🏭', cost: 40, desc: 'Income' },
    { type: 'shrine', icon: '⛪', cost: 80, desc: 'Powers' },
    { type: 'castle', icon: '🏯', cost: 200, desc: 'Main' }
  ];

  const canAfford = (cost) => player.gold >= cost;

  return (
    <div className={`action-panel ${!isYourTurn ? 'disabled' : ''}`}>
      {!isYourTurn && <div className="panel-disabled">Not your turn</div>}

      <div className="action-tabs">
        <button
          className={`tab ${activeTab === 'recruit' ? 'active' : ''}`}
          onClick={() => setActiveTab('recruit')}
        >
          ⚔️ Recruit
        </button>
        <button
          className={`tab ${activeTab === 'build' ? 'active' : ''}`}
          onClick={() => setActiveTab('build')}
        >
          🏢 Build
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'recruit' && (
          <div className="recruit-section">
            {units.map((unit) => (
              <button
                key={unit.type}
                className={`action-button unit-btn ${!canAfford(unit.cost) ? 'disabled' : ''}`}
                onClick={() => onRecruit(unit.type)}
                disabled={!canAfford(unit.cost) || !isYourTurn}
                title={`${unit.desc} - Cost: ${unit.cost} gold`}
              >
                <span className="unit-icon">{unit.icon}</span>
                <span className="unit-info">
                  <span className="unit-name">{unit.type}</span>
                  <span className="unit-cost">💰 {unit.cost}</span>
                </span>
                {!canAfford(unit.cost) && <span className="no-afford">❌</span>}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'build' && (
          <div className="build-section">
            {buildings.map((building) => (
              <button
                key={building.type}
                className={`action-button building-btn ${!canAfford(building.cost) ? 'disabled' : ''}`}
                onClick={() => onBuild(building.type)}
                disabled={!canAfford(building.cost) || !isYourTurn}
                title={`${building.desc} - Cost: ${building.cost} gold`}
              >
                <span className="building-icon">{building.icon}</span>
                <span className="building-info">
                  <span className="building-name">{building.type}</span>
                  <span className="building-cost">💰 {building.cost}</span>
                </span>
                {!canAfford(building.cost) && <span className="no-afford">❌</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="action-footer">
        <button
          className="btn-end-turn"
          onClick={onEndTurn}
          disabled={!isYourTurn}
        >
          ✓ End Turn
        </button>
      </div>
    </div>
  );
}

export default ActionPanel;
