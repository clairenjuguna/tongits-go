// Configuration for backend server connection
export const SERVER_URL = 'http://localhost:3001';
export const WEBSOCKET_URL = 'ws://localhost:3001';

// Game settings
export const GAME_SETTINGS = {
    maxPlayers: 2,
    initialCards: 12,  // Standard Tongits rules
    maxCards: 13,      // Maximum hand size
    turnTimeout: 30000, // 30 seconds per turn
    minMeldSize: 3,    // Minimum cards for a meld
    pointValues: {     // Card point values
        'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13
    }
};