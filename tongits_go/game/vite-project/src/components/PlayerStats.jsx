import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PlayerStats.css';

const PlayerStats = ({ playerName, balance, wins, losses, currentBet, isWinning }) => {
    const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

    return (
        <motion.div
            className="player-stats-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="player-info">
                <h3>{playerName}</h3>
                <motion.div 
                    className="balance"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                >
                    ${balance}
                </motion.div>
            </div>

            <div className="stats-grid">
                <div className="stat-item">
                    <label>Wins</label>
                    <span className="wins">{wins}</span>
                </div>
                <div className="stat-item">
                    <label>Losses</label>
                    <span className="losses">{losses}</span>
                </div>
                <div className="stat-item">
                    <label>Win Rate</label>
                    <span>{winRate}%</span>
                </div>
            </div>

            <AnimatePresence>
                {currentBet > 0 && (
                    <motion.div
                        className="current-bet"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <label>Current Bet</label>
                        <span className="bet-amount">${currentBet}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {isWinning && (
                <motion.div
                    className="winning-indicator"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity
                    }}
                >
                    Winning!
                </motion.div>
            )}
        </motion.div>
    );
};

export default PlayerStats;