import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameState.css';

const GameState = ({ gamePhase, currentPlayer, playerBalance, opponentBalance, roundNumber }) => {
    const [showPhaseIndicator, setShowPhaseIndicator] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowPhaseIndicator(false), 2000);
        return () => clearTimeout(timer);
    }, [gamePhase]);

    const getPhaseText = () => {
        switch (gamePhase) {
            case 'betting': return 'Place Your Bets';
            case 'dealing': return 'Dealing Cards';
            case 'draw': return `${currentPlayer === 0 ? 'Your' : 'Opponent\'s'} Turn to Draw`;
            case 'action': return `${currentPlayer === 0 ? 'Your' : 'Opponent\'s'} Turn to Play`;
            case 'roundEnd': return 'Round Complete';
            default: return '';
        }
    };

    return (
        <div className="game-state">
            <AnimatePresence>
                {showPhaseIndicator && (
                    <motion.div
                        className="phase-indicator"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {getPhaseText()}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="balance-display">
                <motion.div 
                    className="player-balance"
                    animate={{
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.3 }
                    }}
                >
                    Your Balance: ${playerBalance}
                </motion.div>
                <motion.div 
                    className="opponent-balance"
                    animate={{
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.3 }
                    }}
                >
                    Opponent Balance: ${opponentBalance}
                </motion.div>
            </div>

            <motion.div 
                className="round-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Round {roundNumber}
            </motion.div>

            {currentPlayer === 0 && gamePhase === 'action' && (
                <motion.div
                    className="turn-prompt"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    Your Turn
                </motion.div>
            )}
        </div>
    );
};

export default GameState;