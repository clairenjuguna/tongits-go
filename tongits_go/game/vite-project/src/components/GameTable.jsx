import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import BettingSystem from './BettingSystem';
import './GameTable.css';

const GameTable = ({
    gameState,
    playerHand,
    opponentHand,
    discardPile,
    currentPlayer,
    playerBalance,
    onCardClick,
    onBetPlaced
}) => {
    const tableVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const getCardPosition = (index, total, isPlayer) => {
        const arc = isPlayer ? 30 : 20; // degrees
        const radius = isPlayer ? 300 : 280; // px
        const startAngle = -arc / 2;
        const angleStep = arc / (total - 1);
        const angle = startAngle + (index * angleStep);
        const radian = (angle * Math.PI) / 180;

        return {
            x: radius * Math.sin(radian),
            y: isPlayer ? -radius * Math.cos(radian) : -radius * Math.cos(radian) - 320
        };
    };

    return (
        <motion.div
            className="game-table"
            variants={tableVariants}
            initial="initial"
            animate="animate"
        >
            <div className="opponent-area">
                {opponentHand.map((_, index) => (
                    <Card
                        key={`opponent-${index}`}
                        card="back"
                        position={getCardPosition(index, opponentHand.length, false)}
                    />
                ))}
            </div>

            <div className="table-center">
                <div className="deck-area">
                    <Card card="back" />
                </div>
                <div className="discard-pile">
                    {discardPile.length > 0 && (
                        <Card
                            card={discardPile[discardPile.length - 1]}
                            isPlayable={currentPlayer === 0}
                            onClick={() => onCardClick('discard')}
                        />
                    )}
                </div>
            </div>

            <div className="player-area">
                {playerHand.map((card, index) => (
                    <Card
                        key={`player-${card}`}
                        card={card}
                        isPlayable={currentPlayer === 0}
                        position={getCardPosition(index, playerHand.length, true)}
                        onClick={() => onCardClick('hand', index)}
                    />
                ))}
            </div>

            <BettingSystem
                gameState={gameState}
                playerBalance={playerBalance}
                onBetPlaced={onBetPlaced}
            />
        </motion.div>
    );
};

export default GameTable;