import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

// Import images
import gameBackgroundImage from '../assets/graphics/background.jpeg';
import jiliStartImage from '../assets/graphics/jili_start.png';
import playButtonImage from '../assets/graphics/play_button_orange.png';
import gameTableImage from "../assets/graphics/gaming_table_with_pie_chart.png";
import winBoardImage from '../assets/graphics/win_board.png';
import loseBoardImage from '../assets/graphics/lose.png';

// Import audio
import startGameSound from '../assets/audio/start_game.mp3';
import winnerSound from '../assets/audio/winner.mp3';
import cashSound from '../assets/audio/cash.mp3';

const cardBasePath = '/images/';
const cardExtensions = {
    '7D': 'jpg',
    '5C': 'jpg',
    // Add other cards with different extensions if needed
};

const getCardImagePath = (card) => {
    const extension = cardExtensions[card] || 'svg';
    return `${cardBasePath}${card}.${extension}`;
};
const cardNames = ['5C', '7D', '7H', '7S', '8C', '8D', '8H', '8S', '9C', '9D', 'AC', 'AD', 'AH', 'AS'];

const socket = io('http://localhost:3001');

const GameFlow = ({ fetchPlayerStats }) => {
    const [screen, setScreen] = useState('start');
    const [cards, setCards] = useState([]);
    const [opponentCards, setOpponentCards] = useState(7);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [turnArrowAngle, setTurnArrowAngle] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [username, setUsername] = useState('');
    const [selectedCards, setSelectedCards] = useState([]);
    const [groups, setGroups] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);

    useEffect(() => {
        if (screen === 'loading') {
            setTimeout(() => setScreen('character'), 3000);
        } else if (screen === 'character') {
            setTimeout(() => startGame(), 3000);
        }
    }, [screen]);

    useEffect(() => {
        socket.on('matchFound', ({ player1, player2, room, playerAdvantage }) => {
            console.log(`Match found: ${player1} vs ${player2}`);
            setScreen('game');
            startGame(playerAdvantage);
        });

        socket.on('updateGame', (data) => {
            if (data.type === 'cardPlayed') {
                setOpponentCards(prev => prev - 1);
                setDiscardPile(prev => [...prev, data.card]);
            } else if (data.type === 'cardDrawn') {
                setOpponentCards(prev => prev + 1);
            }
            spinArrow();
        });

        socket.on('gameHistoryUpdated', (data) => {
            console.log('Game history updated:', data);
            fetchPlayerStats(username);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setScreen('start');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setScreen('start');
        });

        return () => {
            socket.off('matchFound');
            socket.off('updateGame');
            socket.off('gameHistoryUpdated');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, [username, fetchPlayerStats]);

    useEffect(() => {
        if (currentPlayer === 1) {
            const timer = setTimeout(() => {
                socket.emit('gameMove', { type: 'opponentTurn', room: `match_${socket.id}` });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer]);

    const startGame = (playerAdvantage = true) => {
        setScreen('game');
        playSound(startGameSound);
        const shuffledCards = shuffleCards(cardNames);
        const playerCardCount = playerAdvantage ? 8 : 7;
        const opponentCardCount = playerAdvantage ? 7 : 8;
    
        // Ensure valid array slicing
        setCards(shuffledCards.slice(0, playerCardCount));
        setOpponentCards(opponentCardCount);
        setCurrentPlayer(playerAdvantage ? 0 : 1);
        setTurnArrowAngle(playerAdvantage ? 0 : 180);
        setGroups([]); // Initialize groups
        setDiscardPile([]);
        setSelectedCards([]);
        setGameOver(false);
        setWinner(null);
        playSound(cashSound);
        
        if (playerAdvantage) {
            setAutoplayTimer(setTimeout(autoPlay, 10000));
        } else {
            setTimeout(opponentTurn, 2000);
        }
    };

    const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

    const [activeAudio, setActiveAudio] = useState(null);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && activeAudio) {
                activeAudio.pause();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (activeAudio) {
                activeAudio.pause();
            }
        };
    }, [activeAudio]);

    const playSound = (sound) => {
        if (activeAudio) {
            activeAudio.pause();
        }
        const audio = new Audio(sound);
        setActiveAudio(audio);
        audio.play().catch((err) => console.error('Audio Play Error:', err));
    };

    const spinArrow = () => {
        const nextPlayer = (currentPlayer + 1) % 2;
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

    const drawCard = () => {
        if (gameOver || currentPlayer !== 0) {
            console.log('Not your turn or game is over');
            return;
        }

        clearAutoplayTimer();
        playSound(cashSound);

        const newCard = cardNames[Math.floor(Math.random() * cardNames.length)];
        setCards((prev) => [...prev, newCard]);
        setSelectedCards([]);

        checkForGameEnd();
        setTimeout(spinArrow, 1500);
    };

    const toggleCardSelection = (index) => {
        if (currentPlayer !== 0 || gameOver) return;
        
        setSelectedCards((prev) => {
            const isSelected = prev.includes(index);
            return isSelected ? prev.filter(i => i !== index) : [...prev, index];
        });
    };

    const groupCards = () => {
        if (selectedCards.length < 3 || currentPlayer !== 0 || gameOver) {
            console.log('Invalid group operation');
            return;
        }

        const selectedCardValues = selectedCards.map(index => cards[index]);
        setGroups(prev => [...prev, selectedCardValues]);
        
        setCards(prev => prev.filter((_, index) => !selectedCards.includes(index)));
        setSelectedCards([]);
        playSound(cashSound);
    };

    const discardCard = () => {
        if (currentPlayer !== 0 || gameOver || selectedCards.length !== 1) {
            console.log('Invalid discard operation');
            return;
        }

        const cardToDiscard = cards[selectedCards[0]];
        setDiscardPile(prev => [...prev, cardToDiscard]);
        setCards(prev => prev.filter((_, i) => i !== selectedCards[0]));
        setSelectedCards([]);
        playSound(cashSound);
        
        setTimeout(spinArrow, 1500);
    };

    const opponentTurn = () => {
        if (currentPlayer !== 1) {
            console.log('Not opponent\'s turn');
            return;
        }
        const newOpponentCards = opponentCards - 1;
        setOpponentCards(newOpponentCards);
        checkForGameEnd();
        setTimeout(spinArrow, 1500);
    };

    const checkForGameEnd = () => {
        if (cards.length >= 14) {
            endGame('player');
        } else if (opponentCards <= 0) {
            endGame('opponent');
        }
    };

    const endGame = (winner) => {
        setWinner(winner);
        setGameOver(true);
        playSound(winner === 'player' ? winnerSound : cashSound);
        socket.emit('gameOver', { player1: username, player2: 'opponent', winner });
    };

    const resetGame = () => {
        setCards([]);
        setOpponentCards(7);
        setGameOver(false);
        setWinner(null);
        setScreen('loading');
    };

    const handleStartClick = () => {
        playSound(startGameSound);
        setScreen('loading');
        socket.emit('findMatch', username);
    };

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [fightResult, setFightResult] = useState(null);

    const handleFight = () => {
        if (currentPlayer !== 0 || gameOver || !selectedGroup || selectedCards.length === 0) {
            console.log('Invalid fight attempt');
            return;
        }

        const selectedCardValues = selectedCards.map(index => cards[index]);
        const targetGroup = groups[selectedGroup];

        const isFightValid = selectedCardValues.every(card => {
            const cardValue = card.slice(0, -1);
            return targetGroup.some(groupCard => groupCard.slice(0, -1) === cardValue);
        });

        if (isFightValid) {
            setFightResult('success');
            setGroups(prev => prev.filter((_, index) => index !== selectedGroup));
            setCards(prev => [...prev, ...targetGroup]);
            playSound(winnerSound);
        } else {
            setFightResult('fail');
            playSound(cashSound);
        }

        setSelectedGroup(null);
        setSelectedCards([]);
        setTimeout(() => setFightResult(null), 2000);
        setTimeout(spinArrow, 1500);
    };

    const handleGroupClick = (groupIndex) => {
        if (currentPlayer !== 0 || gameOver) return;
        setSelectedGroup(selectedGroup === groupIndex ? null : groupIndex);
    };

    const fightCard = () => {
        if (!canFight || !lastDiscardedCard || currentPlayer !== 0) {
            console.log('Cannot fight now');
            return;
        }
        setIsFighting(true);
        setCards(prev => [...prev, lastDiscardedCard]);
        setDiscardPile(prev => prev.slice(0, -1));
        setLastDiscardedCard(null);
        setCanFight(false);
        playSound(cashSound);
    };

    return (
        <div style={styles.container}>
            {screen === 'start' && (
                <div>
                    <img src={gameBackgroundImage} alt="Game Background" style={styles.fullscreenImage} />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        style={styles.usernameInput}
                    />
                    <img
                        src={playButtonImage}
                        alt="Play"
                        style={styles.playButton}
                        onClick={handleStartClick}
                    />
                </div>
            )}

            {screen === 'loading' && (
                <div style={styles.loadingScreen}>
                    <p style={styles.loadingText}>Finding opponent...</p>
                </div>
            )}

            {screen === 'game' && (
                <div style={styles.gameContainer}>
                    <img src={gameTableImage} alt="Game Table" style={styles.fullscreenImage} />
                    
                    <motion.div
                        style={styles.arrow}
                        animate={{ rotate: turnArrowAngle }}
                        transition={{ duration: 0.5 }}
                    >
                        →
                    </motion.div>

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

                    <div style={styles.buttonRow}>
                        <button
                            style={styles.actionButton}
                            onClick={drawCard}
                            disabled={currentPlayer !== 0 || gameOver}
                        >
                            Draw
                        </button>
                        <button
                            style={styles.actionButton}
                            onClick={groupCards}
                            disabled={selectedCards.length < 3 || currentPlayer !== 0 || gameOver}
                        >
                            Group
                        </button>
                        <button
                            style={styles.actionButton}
                            onClick={handleFight}
                            disabled={!selectedGroup || selectedCards.length === 0 || currentPlayer !== 0 || gameOver}
                        >
                            Fight
                        </button>
                        <button
                            style={styles.actionButton}
                            onClick={discardCard}
                            disabled={selectedCards.length !== 1 || currentPlayer !== 0 || gameOver}
                        >
                            Discard
                        </button>
                    </div>

                    {groups.length > 0 && (
                        <div style={styles.groupsContainer}>
                            {groups.map((group, groupIndex) => (
                                <div 
                                    key={groupIndex} 
                                    style={{
                                        ...styles.group,
                                        transform: selectedGroup === groupIndex ? 'scale(1.1)' : 'none',
                                        border: selectedGroup === groupIndex ? '2px solid yellow' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => handleGroupClick(groupIndex)}
                                >
                                    {group.map((card, cardIndex) => (
                                        <img
                                            key={cardIndex}
                                            src={`${cardBasePath}${card}.svg`}
                                            alt={card}
                                            style={styles.groupCard}
                                            onError={(e) => {
                                                console.error(`Failed to load card image: ${card}`);
                                                e.target.src = `${cardBasePath}back.svg`;
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {fightResult && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: fightResult === 'success' ? '#4CAF50' : '#f44336',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: '20px',
                            borderRadius: '10px'
                        }}>
                            {fightResult === 'success' ? 'Fight Won!' : 'Fight Failed!'}
                        </div>
                    )}
                    {discardPile.length > 0 && (
                        <div style={styles.discardPile}>
                            <img
                                src={`${cardBasePath}${discardPile[discardPile.length - 1]}.svg`}
                                alt="Discard Pile"
                                style={styles.card}
                                onError={(e) => {
                                    console.error(`Failed to load discard pile image`);
                                    e.target.src = `${cardBasePath}back.svg`;
                                }}
                            />
                        </div>
                    )}

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
)}

const styles = {
    container: { position: 'relative', width: '100%', height: '100vh', backgroundColor: '#222', overflow: 'hidden' },
    fullscreenImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 },
    playButton: { position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer', width: '200px', height: 'auto', zIndex: 1 },
    loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 10 },
    loadingText: { color: 'white', fontSize: '24px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
    gameContainer: { position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    arrow: { position: 'absolute', top: '45%', left: '50%', fontSize: '36px', color: '#fff', transform: 'translateX(-50%)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', zIndex: 2 },
    cardContainer: {
        position: 'fixed',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'row', // Ensure cards are arranged in a single line
        gap: '10px',
        padding: '20px',
        borderRadius: '15px',
        background: 'rgba(0,0,0,0.3)',
        zIndex: 3,
        overflowX: 'auto', // Allow horizontal scrolling if needed
    },
    card: { width: '80px', height: '112px', transition: 'all 0.3s ease-in-out', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    buttonRow: { position: 'fixed', bottom: '3%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', padding: '15px 25px', borderRadius: '20px', background: 'rgba(0,0,0,0.5)', zIndex: 4 },
    actionButton: { padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', border: 'none', background: '#f39c12', color: 'white', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', ':hover': { background: '#e67e22', transform: 'translateY(-2px)' }, ':disabled': { background: '#95a5a6', cursor: 'not-allowed', transform: 'none' } },
    resultScreen: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 20, background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '20px' },
    resultImage: { width: '400px', maxWidth: '80%', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' },
    playAgainButton: { marginTop: '20px', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '10px', border: 'none', background: '#2ecc71', color: 'white', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', ':hover': { background: '#27ae60', transform: 'translateY(-2px)' } },
    usernameInput: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', padding: '15px', fontSize: '18px', borderRadius: '10px', border: '2px solid #3498db', width: '250px', background: 'rgba(255,255,255,0.9)', zIndex: 1 },
    groupsContainer: { position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90%', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', zIndex: 2 },
    group: { background: 'rgba(255, 255, 255, 0.15)', padding: '10px', borderRadius: '10px', display: 'flex', gap: '5px', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    groupCard: { width: '60px', height: '84px', transition: 'transform 0.2s ease' },
    discardPile: { position: 'fixed', top: '40%', right: '5%', transform: 'translateY(-50%)', background: 'rgba(0, 0, 0, 0.4)', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 2 }
};

export default GameFlow;