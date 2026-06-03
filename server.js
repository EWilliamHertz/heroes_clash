const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client', 'build')));

// ============ GAME STATE & STORAGE ============

class GameState {
  constructor(gameId, player1Id, player2Id = null) {
    this.gameId = gameId;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.player1Name = 'Player 1';
    this.player2Name = player2Id ? 'Player 2' : 'Waiting...';
    this.status = player2Id ? 'active' : 'waiting'; // waiting, active, completed, archived
    this.createdAt = Date.now();
    this.lastMoveAt = Date.now();
    this.currentTurn = player1Id;
    
    // Map
    this.map = this.generateMap(16, 16);
    
    // Player States
    this.players = {
      [player1Id]: {
        heroX: 2,
        heroY: 2,
        heroHealth: 100,
        gold: 100,
        units: { militia: 5, archer: 2, knight: 1, mage: 0 },
        buildings: [],
        name: 'Player 1'
      },
      [player2Id || 'pending']: {
        heroX: 13,
        heroY: 13,
        heroHealth: 100,
        gold: 100,
        units: { militia: 5, archer: 2, knight: 1, mage: 0 },
        buildings: [],
        name: 'Player 2'
      }
    };

    // Objectives
    this.objectives = {
      [player1Id]: { gold: 0, units: 0, castle: false, defeated: false },
      [player2Id || 'pending']: { gold: 0, units: 0, castle: false, defeated: false }
    };
  }

  generateMap(width, height) {
    const map = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const rand = Math.random();
        let terrain = 'grass';
        if (rand < 0.15) terrain = 'water';
        else if (rand < 0.3) terrain = 'mountain';
        else if (rand < 0.45) terrain = 'forest';
        row.push(terrain);
      }
      map.push(row);
    }
    return map;
  }

  getFogOfWar(playerId) {
    const player = this.players[playerId];
    if (!player) return null;

    const fogMap = this.map.map(row => row.map(() => 'unknown'));
    const radius = 4;

    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[0].length; x++) {
        const dx = x - player.heroX;
        const dy = y - player.heroY;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          fogMap[y][x] = this.map[y][x];
        }
      }
    }

    return fogMap;
  }

  getGameState(playerId) {
    return {
      gameId: this.gameId,
      player1Id: this.player1Id,
      player2Id: this.player2Id,
      status: this.status,
      currentTurn: this.currentTurn,
      map: this.getFogOfWar(playerId),
      yourPlayer: this.players[playerId] || null,
      opponent: this.players[this.player1Id === playerId ? this.player2Id : this.player1Id] || null,
      objectives: this.objectives[playerId] || null,
      gameTime: {
        createdAt: this.createdAt,
        lastMoveAt: this.lastMoveAt
      }
    };
  }

  makeMove(playerId, action) {
    if (this.currentTurn !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    const player = this.players[playerId];
    if (!player) return { success: false, error: 'Player not found' };

    const opponentId = playerId === this.player1Id ? this.player2Id : this.player1Id;
    const opponent = this.players[opponentId];

    switch (action.type) {
      case 'move':
        return this.moveHero(playerId, action.x, action.y);
      case 'recruit':
        return this.recruitUnit(playerId, action.unitType);
      case 'build':
        return this.buildStructure(playerId, action.buildingType, action.x, action.y);
      case 'endTurn':
        this.lastMoveAt = Date.now();
        this.currentTurn = opponentId;
        this.addGoldIncome(playerId);
        return { success: true, message: 'Turn ended' };
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  moveHero(playerId, x, y) {
    const player = this.players[playerId];
    const dx = Math.abs(x - player.heroX);
    const dy = Math.abs(y - player.heroY);
    const distance = Math.max(dx, dy);

    if (distance > 3) return { success: false, error: 'Move too far (max 3 tiles)' };
    if (this.map[y] && this.map[y][x] === 'water') return { success: false, error: 'Cannot cross water' };

    player.heroX = x;
    player.heroY = y;

    // Check for encounters
    const opponentId = playerId === this.player1Id ? this.player2Id : this.player1Id;
    const opponent = this.players[opponentId];
    const dx2 = Math.abs(opponent.heroX - player.heroX);
    const dy2 = Math.abs(opponent.heroY - player.heroY);
    if (Math.max(dx2, dy2) === 1) {
      return { success: true, encounter: true, message: 'You encountered the enemy hero!' };
    }

    return { success: true, message: 'Hero moved' };
  }

  recruitUnit(playerId, unitType) {
    const costs = { militia: 10, archer: 15, knight: 30, mage: 40 };
    const player = this.players[playerId];

    if (!costs[unitType]) return { success: false, error: 'Invalid unit type' };
    if (player.gold < costs[unitType]) return { success: false, error: 'Not enough gold' };

    player.gold -= costs[unitType];
    player.units[unitType] = (player.units[unitType] || 0) + 1;
    this.objectives[playerId].units += 1;

    return { success: true, message: `Recruited 1 ${unitType}` };
  }

  buildStructure(playerId, buildingType, x, y) {
    const costs = { tower: 50, barracks: 60, castle: 200, mill: 40, shrine: 80 };
    const player = this.players[playerId];

    if (!costs[buildingType]) return { success: false, error: 'Invalid building type' };
    if (player.gold < costs[buildingType]) return { success: false, error: 'Not enough gold' };

    player.gold -= costs[buildingType];
    player.buildings.push({ type: buildingType, x, y });

    if (buildingType === 'castle') {
      this.objectives[playerId].castle = true;
    }

    return { success: true, message: `Built a ${buildingType}` };
  }

  addGoldIncome(playerId) {
    const player = this.players[playerId];
    const buildingBonus = player.buildings.length * 5;
    const income = 20 + buildingBonus;
    player.gold += income;
    this.objectives[playerId].gold += income;
  }
}

// ============ LOBBY MANAGEMENT ============

const games = new Map();
const playerSessions = new Map(); // playerId -> { gameId, ws }
const activeConnections = new Map(); // ws -> playerId

function createGame(playerId, playerName) {
  const gameId = uuidv4().substring(0, 8);
  const game = new GameState(gameId, playerId);
  game.player1Name = playerName;
  games.set(gameId, game);
  return gameId;
}

function joinGame(gameId, playerId, playerName) {
  const game = games.get(gameId);
  if (!game) return { success: false, error: 'Game not found' };
  if (game.status !== 'waiting') return { success: false, error: 'Game already started' };
  if (game.player2Id) return { success: false, error: 'Game is full' };

  game.player2Id = playerId;
  game.player2Name = playerName;
  game.status = 'active';
  game.players[playerId] = game.players['pending'];
  delete game.players['pending'];
  game.objectives[playerId] = game.objectives['pending'];
  delete game.objectives['pending'];
  game.currentTurn = game.player1Id;
  game.lastMoveAt = Date.now();

  return { success: true, gameId, game };
}

function listGames() {
  const gamesList = [];
  games.forEach((game, gameId) => {
    gamesList.push({
      gameId,
      player1: { id: game.player1Id, name: game.player1Name },
      player2: game.player2Id ? { id: game.player2Id, name: game.player2Name } : null,
      status: game.status,
      createdAt: game.createdAt,
      lastMoveAt: game.lastMoveAt,
      playerCount: game.player2Id ? 2 : 1
    });
  });
  return gamesList;
}

function cleanupInactiveGames() {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const oneDayMs = 24 * 60 * 60 * 1000;

  games.forEach((game, gameId) => {
    const timeSinceLastMove = now - game.lastMoveAt;

    // Remove 1-player games after 24 hours
    if (game.status === 'waiting' && timeSinceLastMove > oneDayMs) {
      games.delete(gameId);
      console.log(`[CLEANUP] Removed waiting game ${gameId}`);
    }

    // Remove 2-player games after 7 days of inactivity
    if (game.status === 'active' && timeSinceLastMove > sevenDaysMs) {
      games.delete(gameId);
      console.log(`[CLEANUP] Removed inactive game ${gameId}`);
    }
  });
}

// Run cleanup every 6 hours
setInterval(cleanupInactiveGames, 6 * 60 * 60 * 1000);

// ============ WEBSOCKET HANDLERS ============

wss.on('connection', (ws) => {
  console.log('[WS] New connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const playerId = message.playerId;

      switch (message.type) {
        case 'join': {
          const { gameId, playerName } = message;
          const game = games.get(gameId);

          if (!game) {
            ws.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
            break;
          }

          // Determine which player they are
          let isPlayer1 = false;
          let isPlayer2 = false;

          if (game.player1Id === playerId) {
            isPlayer1 = true;
          } else if (game.player2Id === playerId) {
            isPlayer2 = true;
          } else if (game.status === 'waiting') {
            // Try to join as player 2
            const result = joinGame(gameId, playerId, playerName);
            if (!result.success) {
              ws.send(JSON.stringify({ type: 'error', error: result.error }));
              break;
            }
            isPlayer2 = true;
          }

          activeConnections.set(ws, playerId);
          playerSessions.set(playerId, { gameId, ws });

          ws.send(JSON.stringify({
            type: 'joined',
            gameId,
            gameState: game.getGameState(playerId),
            isPlayer1,
            isPlayer2
          }));

          // Notify opponent
          const opponentId = isPlayer1 ? game.player2Id : game.player1Id;
          const opponentSession = playerSessions.get(opponentId);
          if (opponentSession && opponentSession.ws) {
            opponentSession.ws.send(JSON.stringify({
              type: 'opponentConnected',
              gameState: game.getGameState(opponentId)
            }));
          }

          break;
        }

        case 'move': {
          const session = playerSessions.get(playerId);
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', error: 'Not in a game' }));
            break;
          }

          const game = games.get(session.gameId);
          if (!game) {
            ws.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
            break;
          }

          const result = game.makeMove(playerId, message.action);
          ws.send(JSON.stringify({ type: 'moveResult', ...result }));

          if (result.success) {
            // Notify opponent
            const opponentId = playerId === game.player1Id ? game.player2Id : game.player1Id;
            const opponentSession = playerSessions.get(opponentId);
            if (opponentSession && opponentSession.ws) {
              opponentSession.ws.send(JSON.stringify({
                type: 'opponentMoved',
                gameState: game.getGameState(opponentId)
              }));
            }
          }

          break;
        }

        case 'listGames': {
          ws.send(JSON.stringify({ type: 'gamesList', games: listGames() }));
          break;
        }

        default:
          ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
      }
    } catch (err) {
      console.error('[WS] Error:', err);
      ws.send(JSON.stringify({ type: 'error', error: 'Server error' }));
    }
  });

  ws.on('close', () => {
    const playerId = activeConnections.get(ws);
    if (playerId) {
      playerSessions.delete(playerId);
      activeConnections.delete(ws);
      console.log(`[WS] Player ${playerId} disconnected`);
    }
  });
});

// ============ REST API ============

app.post('/api/games', (req, res) => {
  const { playerName, playerId } = req.body;

  if (!playerName || !playerId) {
    return res.status(400).json({ error: 'playerName and playerId required' });
  }

  const gameId = createGame(playerId, playerName);
  res.json({ gameId, message: 'Game created' });
});

app.get('/api/games', (req, res) => {
  res.json({ games: listGames() });
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json({
    gameId: game.gameId,
    player1: { id: game.player1Id, name: game.player1Name },
    player2: game.player2Id ? { id: game.player2Id, name: game.player2Name } : null,
    status: game.status
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// ============ SERVER START ============

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🎮 Heroes Clash v3.0 Server       ║
║   Multiplayer Strategy Game Engine    ║
╠════════════════════════════════════════╣
║ WebSocket: ws://localhost:${PORT}         ║
║ HTTP: http://localhost:${PORT}           ║
║ Cleanup: Every 6 hours                ║
╚════════════════════════════════════════╝
  `);
});

module.exports = { GameState, games, playerSessions };
