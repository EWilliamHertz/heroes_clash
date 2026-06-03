import React from 'react';
import './Objectives.css';

function Objectives({ objectives }) {
  if (!objectives) return <div className="objectives">Loading...</div>;

  const playerObjectives = Object.values(objectives)[0];
  if (!playerObjectives) return <div className="objectives">No objectives</div>;

  const objectivesList = [
    {
      id: 'gold',
      name: 'Gather Gold',
      icon: '💰',
      target: 500,
      current: playerObjectives.gold,
      completed: playerObjectives.gold >= 500
    },
    {
      id: 'units',
      name: 'Recruit Units',
      icon: '⚔️',
      target: 20,
      current: playerObjectives.units,
      completed: playerObjectives.units >= 20
    },
    {
      id: 'castle',
      name: 'Build Castle',
      icon: '🏯',
      target: 1,
      current: playerObjectives.castle ? 1 : 0,
      completed: playerObjectives.castle
    },
    {
      id: 'defeated',
      name: 'Defeat Enemy',
      icon: '⚔️',
      target: 1,
      current: playerObjectives.defeated ? 1 : 0,
      completed: playerObjectives.defeated
    }
  ];

  const completedCount = objectivesList.filter(o => o.completed).length;

  return (
    <div className="objectives">
      <div className="objectives-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / objectivesList.length) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">{completedCount}/{objectivesList.length}</span>
      </div>

      <div className="objectives-list">
        {objectivesList.map((objective) => (
          <div
            key={objective.id}
            className={`objective-item ${objective.completed ? 'completed' : 'pending'}`}
          >
            <span className="objective-icon">{objective.icon}</span>
            <div className="objective-info">
              <span className="objective-name">{objective.name}</span>
              {objective.completed ? (
                <span className="objective-status completed-badge">✓ Completed</span>
              ) : (
                <span className="objective-progress">
                  {objective.current}/{objective.target}
                </span>
              )}
            </div>
            {objective.completed && <span className="checkmark">✅</span>}
          </div>
        ))}
      </div>

      <div className="objectives-footer">
        <p>Complete objectives to strengthen your position!</p>
      </div>
    </div>
  );
}

export default Objectives;
