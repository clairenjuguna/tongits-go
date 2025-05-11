// Core game logic for Tongits Go

// Constants for game rules
const INITIAL_CARDS = 12;
const MIN_MELD_SIZE = 3;
const DECK_SIZE = 52;

// Card point values
const CARD_POINTS = {
    'A': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13
};

// Initialize a new game state
export function initializeGame() {
    return {
        deck: generateDeck(),
        players: [
            { hand: [], melds: [], points: 0 },
            { hand: [], melds: [], points: 0 }
        ],
        discardPile: [],
        currentPlayer: 0,
        gamePhase: 'draw' // draw, discard, action
    };
}

// Generate and shuffle a new deck with win rate adjustment
function generateDeck() {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(rank + suit);
        }
    }
    
    // Shuffle with bias towards player advantage
    return biasedShuffle(deck);
}

// Biased shuffle to favor player
function biasedShuffle(deck) {
    const halfDeck = Math.floor(deck.length / 2);
    const firstHalf = deck.slice(0, halfDeck);
    const secondHalf = deck.slice(halfDeck);
    
    // Sort cards by value for potential manipulation
    firstHalf.sort((a, b) => CARD_POINTS[b[0]] - CARD_POINTS[a[0]]);
    secondHalf.sort((a, b) => CARD_POINTS[a[0]] - CARD_POINTS[b[0]]);
    
    // Combine and shuffle with slight bias
    return [...firstHalf, ...secondHalf].sort(() => Math.random() - 0.4); // Slight bias towards keeping high cards early
}

// Calculate hand strength
function calculateHandStrength(cards) {
    let strength = 0;
    const ranks = cards.map(card => card[0]);
    
    // Calculate basic point value
    strength += cards.reduce((sum, card) => sum + CARD_POINTS[card[0]], 0);
    
    // Bonus for potential melds
    const rankCounts = {};
    ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });
    
    // Bonus for pairs and three of a kind
    Object.values(rankCounts).forEach(count => {
        if (count >= 2) strength += 10;
        if (count >= 3) strength += 20;
    });
    
    return strength;
}

// Find index of worst card in hand
function findWorstCardIndex(cards) {
    let worstIdx = -1;
    let worstValue = Infinity;
    
    cards.forEach((card, idx) => {
        const value = CARD_POINTS[card[0]];
        if (value < worstValue) {
            worstValue = value;
            worstIdx = idx;
        }
    });
    
    return worstIdx;
}

// Find index of best card in hand
function findBestCardIndex(cards) {
    let bestIdx = -1;
    let bestValue = -1;
    
    cards.forEach((card, idx) => {
        const value = CARD_POINTS[card[0]];
        if (value > bestValue) {
            bestValue = value;
            bestIdx = idx;
        }
    });
    
    return bestIdx;
}

// Deal initial cards with win rate adjustment
export function dealInitialCards(gameState) {
    const playerCards = [];
    const opponentCards = [];
    
    // Deal all cards first to analyze them
    for (let i = 0; i < INITIAL_CARDS * 2; i++) {
        const card = gameState.deck.pop();
        if (i < INITIAL_CARDS) {
            playerCards.push(card);
        } else {
            opponentCards.push(card);
        }
    }
    
    // Analyze and potentially swap cards to favor player (80% win rate)
    if (Math.random() < 0.8) { // 80% chance to give player better cards
        const playerValue = calculateHandStrength(playerCards);
        const opponentValue = calculateHandStrength(opponentCards);
        
        if (playerValue < opponentValue) {
            // Swap some high-value cards to favor player
            for (let i = 0; i < 3; i++) {
                const playerWorstIdx = findWorstCardIndex(playerCards);
                const opponentBestIdx = findBestCardIndex(opponentCards);
                
                if (playerWorstIdx !== -1 && opponentBestIdx !== -1) {
                    const temp = playerCards[playerWorstIdx];
                    playerCards[playerWorstIdx] = opponentCards[opponentBestIdx];
                    opponentCards[opponentBestIdx] = temp;
                }
            }
        }
    }
    
    // Assign the cards to players
    gameState.players[0].hand = playerCards;
    gameState.players[1].hand = opponentCards;
    
    // Add one card to discard pile
    gameState.discardPile.push(gameState.deck.pop());
    return gameState;
}

// Check if cards form a valid meld (set or run)
export function isValidMeld(cards) {
    if (cards.length < MIN_MELD_SIZE) return false;
    
    // Check for set (same rank, different suits)
    const isSet = cards.every(card => cards[0][0] === card[0]) &&
                  new Set(cards.map(card => card.slice(-1))).size === cards.length;
    if (isSet) return true;
    
    // Check for run (same suit, consecutive ranks)
    const suit = cards[0].slice(-1);
    const sameSuit = cards.every(card => card.slice(-1) === suit);
    
    if (sameSuit) {
        const ranks = cards.map(card => {
            const rank = card.slice(0, -1);
            return rank === 'A' ? 1 : CARD_POINTS[rank];
        });
        ranks.sort((a, b) => a - b);
        
        // Allow Ace as both low (1) and high (14)
        if (ranks.includes(1) && ranks.includes(13)) {
            const withAceHigh = [...ranks.filter(r => r !== 1), 14];
            withAceHigh.sort((a, b) => a - b);
            const isSequentialWithAceHigh = withAceHigh.every((r, i) => 
                i === 0 || r === withAceHigh[i-1] + 1
            );
            if (isSequentialWithAceHigh) return true;
        }
        
        // Check normal sequence
        return ranks.every((r, i) => i === 0 || r === ranks[i-1] + 1);
    }
    
    return false;
}

// Calculate hand points
export function calculatePoints(cards) {
    return cards.reduce((total, card) => {
        const rank = card.slice(0, -1);
        return total + CARD_POINTS[rank];
    }, 0);
}

// Check if player has won
export function checkWinCondition(playerState) {
    // Win by going out (melding all cards)
    if (playerState.hand.length === 0 && playerState.melds.length > 0) {
        return true;
    }
    
    // Win by having lowest points when deck is exhausted
    const handPoints = calculatePoints(playerState.hand);
    const meldPoints = playerState.melds.reduce((total, meld) => total + calculatePoints(meld), 0);
    return handPoints + meldPoints <= 10; // Win if total points are 10 or less
}

// Handle drawing a card
export const drawCard = (gameState, fromDiscard) => {
    if (!gameState) return null;
    
    const player = gameState.players[0];
    if (fromDiscard) {
        // Draw from discard pile
        const drawnCard = gameState.discardPile.pop();
        return {
            ...gameState,
            players: [
                { ...player, hand: [...player.hand, drawnCard] },
                gameState.players[1]
            ]
        };
    } else {
        // Draw from deck
        const drawnCard = gameState.deck.pop();
        return {
            ...gameState,
            players: [
                { ...player, hand: [...player.hand, drawnCard] },
                gameState.players[1]
            ]
        };
    }
};

// Handle discarding a card
export const discardCard = (gameState, selectedIndex) => {
    if (!gameState) return null;
    
    const player = gameState.players[0];
    const discardedCard = player.hand[selectedIndex];
    
    // Remove card from hand
    const newHand = player.hand.filter((_, index) => index !== selectedIndex);
    
    return {
        ...gameState,
        players: [
            { ...player, hand: newHand },
            gameState.players[1]
        ],
        discardPile: [...gameState.discardPile, discardedCard]
    };
};

export const createMeld = (gameState, selectedIndices) => {
    if (!gameState || selectedIndices.length < 3) return null;
    
    const player = gameState.players[0];
    const selectedCards = selectedIndices.map(index => player.hand[index]);
    
    // Check if cards form a valid meld (same rank or sequence)
    if (!isValidMeld(selectedCards)) return null;
    
    // Remove selected cards from hand
    const newHand = player.hand.filter((_, index) => !selectedIndices.includes(index));
    
    // Add cards to melds
    const newMelds = [...player.melds];
    newMelds.push(selectedCards);
    
    return {
        ...gameState,
        players: [
            { ...player, hand: newHand, melds: newMelds },
            gameState.players[1]
        ]
    };
};

export const fight = (gameState, selectedIndices) => {
    if (!gameState || selectedIndices.length === 0) return null;
    
    const player = gameState.players[0];
    const selectedCards = selectedIndices.map(index => player.hand[index]);
    
    // Remove selected cards from hand
    const newHand = player.hand.filter((_, index) => !selectedIndices.includes(index));
    
    return {
        ...gameState,
        players: [
            {
                ...player,
                hand: newHand,
                fightPile: [...(player.fightPile || []), ...selectedCards]
            },
            gameState.players[1]
        ]
    };
};

