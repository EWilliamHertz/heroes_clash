import React from 'react';
import './HeroInfo.css';

function HeroInfo({ player, opponent }) {
  if (!player) return <div className="hero-info">Loading...</div>;

  return (
    <div className="hero-info">
      <div className="hero-card your-hero-card">
        <h4>👑 Your Hero</h4>
        <div className="hero-stat">
          <span>Health:</span>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{ width: `${(player.heroHealth / 100) * 100}%` }}
            ></div>
          </div>
          <span>{player.heroHealth}/100</span>
        </div>
        <div className="hero-stat">
          <span>Position:</span>
          <span>({player.heroX}, {player.heroY})</span>
        </div>
      </div>

      {opponent && (
        <div className="hero-card opponent-hero-card">
          <h4>⚔️ Opponent's Hero</h4>
          <div className="hero-stat">
            <span>Health:</span>
            <div className="health-bar">
              <div
                className="health-fill opponent"
                style={{ width: `${(opponent.heroHealth / 100) * 100}%` }}
              ></div>
            </div>
            <span>{opponent.heroHealth}/100</span>
          </div>
          <div className="hero-stat">
            <span>Position:</span>
            <span>({opponent.heroX}, {opponent.heroY})</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroInfo;
