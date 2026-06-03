# ⚔️ Heroes Clash v3.0

A **turn-based multiplayer strategy game** inspired by Heroes of Might and Magic III, featuring a cloud-based game lobby system and asynchronous gameplay.

## 🎮 Features

### Core Gameplay
- **16×16 Procedurally Generated Maps** - Unique terrain each game
- **Turn-based Strategy** - Take turns moving heroes and recruiting units
- **Fog of War** - 4-tile visibility radius hides the map
- **Hero Encounters** - Battle when heroes get adjacent to each other
- **Base Building** - Construct 5 types of buildings to boost your economy

### Lobby System ✨ NEW
- **Game Lobby** - Create and join games easily
- **Auto-cleanup** - Games auto-remove after:
  - **7 days** of inactivity (2-player games)
  - **24 hours** of inactivity (1-player games)
- **Game List** - See all active games with player info
- **Asynchronous Play** - Play from anywhere, whenever you want!

### Multi-Window Support ✨ NEW
- Open different game panels in separate tabs/windows
- Share game state via localStorage
- Play on multiple monitors
- Each component can run independently

## 🏗️ Architecture

### Backend (Node.js + Express + WebSocket)
- **server.js** - Main server with WebSocket handling
- **GameState Class** - Game logic and state management
- **Game Lobby** - REST API for game management
- **Auto-cleanup** - Removes inactive games every 6 hours

### Frontend (React)
- **Lobby.js** - Game creation/joining interface
- **Game.js** - Main game coordinator
- **GameBoard.js** - Map rendering with fog of war
- **HeroInfo.js** - Hero status display
- **ResourcePanel.js** - Gold, units, buildings tracker
- **ActionPanel.js** - Recruit/build interface
- **Objectives.js** - Quest tracking

## 🚀 Getting Started

### Local Development

**Terminal 1 - Backend:**
```bash
npm install
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm start
# Client opens http://localhost:3000
```

### Play Locally
1. Open http://localhost:3000 in two browser windows (or tabs)
2. Each player creates/joins a game in the lobby
3. Both connect to the same game
4. Take turns moving heroes and managing your kingdom!

## ☁️ Cloud Deployment

### Deploy to Render.com (Recommended)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **On Render.com:**
   - Create new Web Service
   - Connect your GitHub repo
   - Set build command:
     ```
     cd client && npm install && npm run build && cd .. && npm install
     ```
   - Set start command:
     ```
     npm start
     ```
   - Deploy!

3. **Share URL** with your friend
4. Both play from separate computers!

### Why Render.com?
- ✅ Supports WebSocket (multiplayer)
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Auto-deploys on push

## 🎯 Game Mechanics

### Turn Flow
1. **Start of Turn** - Earn gold (20 + 5 per building)
2. **Action Phase** - Do one of:
   - Move hero (1-3 tiles)
   - Recruit units
   - Build a structure
3. **End Turn** - Pass to opponent

### Units
| Unit | Cost | Type | Effect |
|------|------|------|--------|
| 👥 Militia | 10 💰 | Basic | Standard attack |
| 🏹 Archer | 15 💰 | Ranged | Range bonus |
| ⚔️ Knight | 30 💰 | Heavy | Defense bonus |
| ✨ Mage | 40 💰 | Magic | Special damage |

### Buildings
| Building | Cost | Effect |
|----------|------|--------|
| 🗼 Tower | 50 💰 | +5 Defense |
| 🏹 Barracks | 60 💰 | -10% Unit cost |
| 🏭 Mill | 40 💰 | +5 Gold/turn |
| ⛪ Shrine | 80 💰 | Special power |
| 🏯 Castle | 200 💰 | Win condition |

### Objectives
- 💰 Gather 500 Gold
- ⚔️ Recruit 20 Units
- 🏯 Build a Castle
- 👑 Defeat Enemy Hero

### Combat System
- Both heroes attack simultaneously
- Damage = Sum of all unit attacks
- Loser's units are destroyed
- Hero dies at 0 health

### Map Terrain
- 🌾 **Grass** - Passable, normal movement
- 💧 **Water** - Impassable, blocks movement
- ⛰️ **Mountain** - Scenic, no special effect
- 🌲 **Forest** - Dense terrain
- ❓ **Fog of War** - Unknown until explored

## 📱 Multi-Window Setup

You can open separate browser windows for each component:

1. **Main Window** - Map + sidebar with all controls
2. **Map Window** - Full-screen map view
3. **Hero Window** - Hero stats and opponent info
4. **Resources Window** - Units and buildings
5. **Actions Window** - Recruit/build interface

Click the "🪟 Windows" section in the game to open separate panels!

## 🔧 Configuration

### Inactivity Cleanup (server.js)
```javascript
// Adjust these timings:
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000; // 2-player games
const oneDayMs = 24 * 60 * 60 * 1000;        // 1-player games
setInterval(cleanupInactiveGames, 6 * 60 * 60 * 1000); // Check every 6 hours
```

### Visibility Radius (server.js)
```javascript
const radius = 4; // Fog of war range (GameState.getFogOfWar)
```

### Movement Range (server.js)
```javascript
const maxDistance = 3; // Max tiles per move
```

## 📊 Database

Games are stored in memory during the session. For production, add persistent storage:

```javascript
// Future: Replace with MongoDB/PostgreSQL
const gamesDb = new Database('games.json');
```

## 🎨 Customization

### Change Theme
Edit colors in `App.css`:
```css
--primary-gold: #ffd700
--dark-bg: #1a1a2e
--accent: #16213e
```

### Adjust Game Balance
- Unit costs → `ActionPanel.js`
- Building costs → `ActionPanel.js`
- Unit health → `server.js` (GameState class)
- Map size → `server.js` (16x16 grid)

## 🐛 Troubleshooting

### "Not connecting to server"
- Check that backend is running: `npm start` in root
- Verify port 5000 is not blocked
- Check browser console for WebSocket errors

### "Game not loading"
- Refresh the page
- Check localStorage isn't full: `localStorage.clear()`
- Clear browser cache

### "Opponent doesn't see my moves"
- Make sure you clicked "End Turn"
- Check both players are in the same game (same Game ID)
- Verify WebSocket connection in browser DevTools

## 🚀 Future Features

- [ ] Hero special abilities
- [ ] Different hero classes
- [ ] Artifacts & equipment
- [ ] Creature morale system
- [ ] AI opponent
- [ ] Global leaderboard
- [ ] Spell system
- [ ] Sound & music
- [ ] Mobile app
- [ ] Chat system

## 📝 License

MIT License - See LICENSE file

## 👥 Contributing

Found a bug or have a feature idea? Open an issue or submit a pull request!

---

**Happy strategizing, heroes!** 🎮⚔️👑
