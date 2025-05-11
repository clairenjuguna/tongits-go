const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Game logic moved from frontend
function determineWinner() {
    const randomValue = Math.random(); // 0 to 1
    return randomValue < 0.8 ? 'house' : 'player'; // 80% house win, 20% player win
}

// API to start a game
app.post('/play', (req, res) => {
    const { player } = req.body;
    const result = determineWinner();

    db.run('INSERT INTO game_results (player, result) VALUES (?, ?)', [player, result], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Game played', result });
    });
});

// API to fetch game results
app.get('/results', (req, res) => {
    db.all('SELECT * FROM game_results ORDER BY timestamp DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add a route to serve the front end
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
