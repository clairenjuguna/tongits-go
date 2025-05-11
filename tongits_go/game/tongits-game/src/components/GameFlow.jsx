import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { SERVER_URL, GAME_SETTINGS } from '../config';
import * as TongitsLogic from '../logic/TongitsGameLogic';

// Import images
import gameBackgroundImage from '../assets/graphics/background.jpeg';
import jiliStartImage from '../assets/graphics/graphics/jili_start.png';
import playButtonImage from '../assets/graphics/graphics/play_button_orange.png';
import gameTableImage from '../assets/graphics/graphics/gaming_table_with_pie_chart.png';
import winBoardImage from '../assets/graphics/graphics/win_board.png';
import loseBoardImage from '../assets/graphics/graphics/lose.png';
const cardImages = {};

const cardNames = [
  '2C', '2D', '2H', '2S',
  '3C', '3D', '3H', '3S',
  '4C', '4D', '4H', '4S',
  '5C', '5D', '5H', '5S',
  '6C', '6D', '6H', '6S',
  '7C', '7D', '7H', '7S',
  '8C', '8D', '8H', '8S',
  '9C', '9D', '9H', '9S',
  '10C', '10D', '10H', '10S',
  'JC', 'JD', 'JH', 'JS',
  'QC', 'QD', 'QH', 'QS',
  'KC', 'KD', 'KH', 'KS',
  'AC', 'AD', 'AH', 'AS',
  'Joker', 'Joker_1'
];

// Initialize card images with public URL paths
cardNames.forEach(card => {
  const cardPath = `/images/${card}`;
  if (['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S',
       '5D', '5H', '5S', '6C', '6D', '6H', '6S', '7C', '10C', '10D', '10H', '10S',
       'QC', 'QD', 'QH', 'QS', 'KS'].includes(card)) {
    cardImages[card] = `${cardPath}.jpg`;
  } else {
    cardImages[card] = `${cardPath}.png`;
  }
});

// Import audio
import startGameSound from '../assets/audio/start_game.mp3';
import winnerSound from '../assets/audio/winner.mp3';
import cashSound from '../assets/audio/cash.mp3';
import audioManager from '../utils/AudioManager';

const socket = io(SERVER_URL);

const GameFlow = ({ fetchPlayerStats }) => {
    const [screen, setScreen] = useState('start');
    const [gameState, setGameState] = useState(null);
    const [selectedCards, setSelectedCards] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [turnArrowAngle, setTurnArrowAngle] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [username, setUsername] = useState('');
    const [opponentCards, setOpponentCards] = useState(7);

    useEffect(() => {
        // Initialize audio
        audioManager.loadSound('start', startGameSound);
        audioManager.loadSound('winner', winnerSound);
        audioManager.loadSound('cash', cashSound);

        return () => {
            audioManager.cleanup();
        };
    }, []);

    useEffect(() => {
        if (screen === 'loading') {
            const timer = setTimeout(() => setScreen('character'), 3000);
            return () => clearTimeout(timer);
        } else if (screen === 'character') {
            const timer = setTimeout(() => startGame(), 3000);
            return () => clearTimeout(timer);
        }
    }, [screen, startGame]); // Add startGame to dependencies

useEffect(() => {
    socket.on('matchFound', ({ player1, player2, room, playerAdvantage }) => {
        console.log(`Match found: ${player1} vs ${player2}`);
        setScreen('game');
        startGame(playerAdvantage);
    });

    socket.on('updateGame', (data) => {
        console.log('Game update:', data);
    });

    socket.on('gameHistoryUpdated', (data) => {
        console.log('Game history updated:', data);
        fetchPlayerStats(username);
    });

    return () => {
        socket.off('matchFound');
        socket.off('updateGame');
        socket.off('gameHistoryUpdated');
    };
}, [username, fetchPlayerStats]);

// Keep only the first implementation of startGame
const startGame = (playerAdvantage) => {
    setScreen('game');
    playSound('start');
    const initialState = TongitsLogic.initializeGame();
    const gameStateWithCards = TongitsLogic.dealInitialCards(initialState, playerAdvantage);
    setGameState(gameStateWithCards);
    setOpponentCards(gameStateWithCards.players[1].hand.length || 7);
    playSound('cash');
    setTimeout(() => spinArrow(playerAdvantage), 2000);
};

// Remove this duplicate implementation
// setScreen('game');
// playSound('start');
// ...
const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

const playSound = (soundKey) => {
    audioManager.play(soundKey);
};

const spinArrow = (playerAdvantage) => {
    const nextPlayer = playerAdvantage ? 0 : 1;
    setCurrentPlayer(nextPlayer);
    setTurnArrowAngle(nextPlayer === 0 ? 0 : 180);

    if (nextPlayer === 0) {
        setAutoplayTimer(setTimeout(autoPlay, 10000));
    } else {
        setTimeout(opponentTurn, 2000);
    }
};

const autoPlay = () => {
    drawCard();
};

const clearAutoplayTimer = () => {
    if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        setAutoplayTimer(null);
    }
};

const drawCard = (fromDiscard = false) => {
    if (gameOver || currentPlayer !== 0 || !gameState) return;

    clearAutoplayTimer();
    playSound('cash');

    const updatedState = TongitsLogic.drawCard(gameState, fromDiscard);
    if (updatedState) {
        setGameState(updatedState);
        checkForGameEnd();
        if (!fromDiscard) {
            setTimeout(spinArrow, 1500);
        }
    }
};

const opponentTurn = () => {
    setOpponentCards((prev) => Math.max(0, prev - 1)); // Ensure it never goes below 0
    checkForGameEnd();
    setTimeout(spinArrow, 1500);
};

const checkForGameEnd = () => {
    if (!gameState) return;
    
    const playerState = gameState.players[0];
    const opponentState = gameState.players[1];
    
    if (TongitsLogic.checkWinCondition(playerState)) {
        endGame('player');
    } else if (TongitsLogic.checkWinCondition(opponentState)) {
        endGame('opponent');
    }
};

const endGame = (winner) => {
    setWinner(winner);
    setGameOver(true);
    playSound(winner === 'player' ? 'winner' : 'cash');
    socket.emit('gameOver', { player1: username, player2: 'opponent', winner });
};

const resetGame = () => {
    setOpponentCards(7); // Set to initial hand size
    setGameOver(false);
    setWinner(null);
    setScreen('loading');
    setGameState(null);
    setSelectedCards([]);
    setCurrentPlayer(0);
    setTurnArrowAngle(0);
};

const handleStartClick = () => {
    playSound('start');
    setScreen('loading');
    socket.emit('findMatch', username);
};

return (
    <div style={styles.container}>
        {screen === 'start' && (
            <>
                <img src={jiliStartImage} alt="Start" style={styles.fullscreenImage} />
                
                <button onClick={handleStartClick} style={styles.playButton}>
                    <img src={playButtonImage} alt="Play" />
                </button>
            </>
        )}

        {screen === 'loading' && (
            <div style={styles.loading}>
                <img src={gameBackgroundImage} alt="Loading" style={styles.fullscreenImage} />
                <div style={styles.loadingText}></div>
            </div>
        )}

        {screen === 'character' && (
            <img src={gameBackgroundImage} alt="Character Selection" style={styles.fullscreenImage} />
        )}

        {screen === 'game' && (
            <div style={styles.gameContainer}>
                <img src={gameTableImage} alt="Table" style={styles.fullscreenImage} />
                <motion.div style={styles.arrow} animate={{ rotate: turnArrowAngle }}>
                    ⬆
                </motion.div>

                {/* Opponent's cards */}
                <div style={{...styles.cardContainer, top: '5%', transform: 'translateX(-50%) rotate(180deg)'}}>
                    {Array.from({length: Math.max(0, opponentCards)}).map((_, index) => (
                        <img
                            key={index}
                            src="/images/card_back.png"
                            alt="Card Back"
                            style={styles.card}
                        />
                    ))}
                </div>

                {/* Meld Groups */}
                <div style={styles.groupContainer}>
                    <div style={styles.meldGroup}>
                        {gameState?.players[0].melds[0]?.map((card, index) => (
                            <img
                                key={index}
                                src={cardImages[card]}
                                alt={card}
                                style={styles.card}
                            />
                        ))}
                    </div>
                    <div style={styles.meldGroup}>
                        {gameState?.players[0].melds[1]?.map((card, index) => (
                            <img
                                key={index}
                                src={cardImages[card]}
                                alt={card}
                                style={styles.card}
                            />
                        ))}
                    </div>
                </div>

                {/* Player's cards */}
                <div style={styles.cardContainer}>
                    {gameState?.players[0].hand.map((card, index) => (
                        <motion.img
                            key={index}
                            src={cardImages[card]}
                            alt={card}
                            style={{
                                ...styles.card,
                                border: selectedCards.includes(index) ? '2px solid #FFD700' : 'none',
                                cursor: 'pointer',
                                filter: selectedCards.includes(index) ? 'brightness(1.2)' : 'brightness(1)'
                            }}
                            whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            onClick={() => {
                                if (currentPlayer === 0) {
                                    setSelectedCards(prev =>
                                        prev.includes(index)
                                            ? prev.filter(i => i !== index)
                                            : [...prev, index]
                                    );
                                    playSound('cash');
                                }
                            }}
                        />
                    ))}
                </div>
                
                {/* Discard Pile */}
                {gameState?.discardPile.length > 0 && (
                    <motion.div 
                        style={styles.discardPile}
                        whileHover={{ scale: 1.05 }}
                    >
                        <img
                            src={cardImages[gameState.discardPile[gameState.discardPile.length - 1]]}
                            alt="Discard Pile"
                            style={styles.card}
                            onClick={() => drawCard(true)}
                        />
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div style={styles.buttonRow}>
                    <motion.button 
                        onClick={() => drawCard(false)} 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Draw
                    </motion.button>
                    <motion.button 
                        onClick={() => {
                            if (selectedCards.length >= 3 && currentPlayer === 0) {
                                const updatedState = TongitsLogic.createMeld(gameState, selectedCards);
                                if (updatedState) {
                                    setGameState(updatedState);
                                    setSelectedCards([]);
                                    checkForGameEnd();
                                    playSound('cash');
                                }
                            }
                        }} 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Group
                    </motion.button>
                    <motion.button 
                        onClick={() => {
                            if (selectedCards.length === 1 && currentPlayer === 0) {
                                const updatedState = TongitsLogic.discardCard(gameState, selectedCards[0]);
                                if (updatedState) {
                                    setGameState(updatedState);
                                    setSelectedCards([]);
                                    setTimeout(spinArrow, 1500);
                                    playSound('cash');
                                }
                            }
                        }} 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Discard
                    </motion.button>
                    <motion.button 
                        onClick={() => {
                            if (currentPlayer === 0 && selectedCards.length > 0) {
                                const updatedState = TongitsLogic.fight(gameState, selectedCards);
                                if (updatedState) {
                                    setGameState(updatedState);
                                    setSelectedCards([]);
                                    playSound('cash');
                                    setTimeout(spinArrow, 1500);
                                }
                            }
                        }} 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Fight
                    </motion.button>
                </div>

                {gameOver && (
                    <div style={styles.resultScreen}>
                        <img
                            src={winner === 'player' ? winBoardImage : loseBoardImage}
                            alt={winner === 'player' ? 'You Win' : 'You Lose'}
                            style={styles.resultImage}
                        />
                        <button onClick={resetGame} style={styles.playAgainButton}>Play Again</button>
                    </div>
                )}
            </div>
        )}
    </div>
);
};

const styles = {
    container: { position: 'relative', width: '100%', height: '100vh', backgroundColor: '#1a1a1a', overflow: 'hidden' },
    fullscreenImage: { width: '100%', height: '100%', objectFit: 'cover' },
    playButton: { position: 'absolute', top: '60%', left: '35%', transform: 'translate(-50%, -50%)', cursor: 'pointer', width: '2px', height: 'auto' },
    loadingScreen: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'rgba(0,0,0,0.8)' },
    loading: { 
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.8)'
    },
    loadingText: { 
        color: '#FFD700', 
        fontSize: '32px', 
        fontWeight: 'bold', 
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
    },
    gameContainer: { position: 'relative', height: '100%', background: 'radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%)' },
    arrow: { position: 'absolute', top: '45%', left: '50%', fontSize: '48px', color: '#FFD700', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))', transition: 'transform 0.5s ease' },
    cardContainer: { position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', flexWrap: 'nowrap', // Ensure cards are arranged in a single line
    overflowX: 'auto', // Allow horizontal scrolling if needed
    padding: '10px',
    borderRadius: '15px',
    background: 'rgba(0,0,0,0.3)',
},
    discardPile: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' },
    card: { width: '70px', height: '100px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', ':hover': { transform: 'translateY(-10px)', boxShadow: '0 5px 15px rgba(255,215,0,0.3)' } },
    buttonRow: { position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', zIndex: 10 },
    actionButton: { padding: '12px 24px', fontSize: '18px', fontWeight: 'bold', color: '#fff', background: 'linear-gradient(45deg, #FFD700, #FFA500)', border: 'none', borderRadius: '25px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,215,0,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', ':hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(255,215,0,0.4)' } },
    resultScreen: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', background: 'rgba(0,0,0,0.9)', padding: '40px', borderRadius: '20px', boxShadow: '0 0 30px rgba(255,215,0,0.5)' },
    resultImage: { width: '300px', marginBottom: '30px' },
    playAgainButton: { padding: '15px 30px', fontSize: '20px', fontWeight: 'bold', color: '#fff', background: 'linear-gradient(45deg, #FFD700, #FFA500)', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,215,0,0.3)', transition: 'all 0.3s ease' },
    usernameInput: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', padding: '15px 25px', fontSize: '18px', color: '#fff', background: 'rgba(0,0,0,0.7)', border: '2px solid #FFD700', borderRadius: '30px', outline: 'none', width: '300px', textAlign: 'center' },
    groupContainer: { position: 'absolute', top: '20%', width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0 50px' },
    meldGroup: { background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', minWidth: '100px', minHeight: '120px', display: 'flex', gap: '2px', flexWrap: 'wrap' }
};

export default GameFlow;