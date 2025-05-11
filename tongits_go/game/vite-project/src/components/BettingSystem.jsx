import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './BettingSystem.css';

const BettingSystem = ({ onBetPlaced, gameState, playerBalance }) => {
    const [currentBet, setCurrentBet] = useState(0);
    const [isPlacingBet, setIsPlacingBet] = useState(true);
    const betOptions = [10, 20, 50, 100, 200, 500];

    useEffect(() => {
        if (gameState === 'roundEnd') {
            setIsPlacingBet(true);
        }
    }, [gameState]);

    const handleBetSelect = (amount) => {
        if (amount <= playerBalance) {
            setCurrentBet(amount);
        }
    };

    const handleConfirmBet = () => {
        if (currentBet > 0 && currentBet <= playerBalance) {
            onBetPlaced(currentBet);
            setIsPlacingBet(false);
        }
    };

    return (
        <motion.div 
            className="betting-system"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {isPlacingBet ? (
                <>
                    <h3>Place Your Bet</h3>
                    <div className="bet-options">
                        {betOptions.map((amount) => (
                            <motion.button
                                key={amount}
                                className={`bet-option ${currentBet === amount ? 'selected' : ''}`}
                                onClick={() => handleBetSelect(amount)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={amount > playerBalance}
                            >
                                ${amount}
                            </motion.button>
                        ))}
                    </div>
                    <motion.button
                        className="confirm-bet"
                        onClick={handleConfirmBet}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentBet === 0}
                    >
                        Confirm Bet
                    </motion.button>
                </>
            ) : (
                <div className="current-bet-display">
                    <h4>Current Bet</h4>
                    <p>${currentBet}</p>
                </div>
            )}
        </motion.div>
    );
};

export default BettingSystem;