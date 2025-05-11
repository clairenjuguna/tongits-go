import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ card, onClick, isSelected, isPlayable, position }) => {
    const getCardImagePath = (card) => {
        const cardExtensions = {
            '7D': 'jpg',
            '5C': 'jpg'
        };
        const extension = cardExtensions[card] || 'svg';
        return `/images/${card}.${extension}`;
    };
    const cardImage = getCardImagePath(card);
    
    const variants = {
        initial: { scale: 0, rotate: 180 },
        animate: { 
            scale: 1, 
            rotate: 0,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        hover: { 
            y: -10,
            scale: 1.1,
            transition: { type: 'spring', stiffness: 300 }
        },
        tap: { scale: 0.95 },
        selected: {
            y: -20,
            scale: 1.1,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
        }
    };

    return (
        <motion.div
            className={`card ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''}`}
            variants={variants}
            initial="initial"
            animate={isSelected ? 'selected' : 'animate'}
            whileHover={isPlayable ? 'hover' : {}}
            whileTap={isPlayable ? 'tap' : {}}
            onClick={() => isPlayable && onClick()}
            style={{
                position: position ? 'absolute' : 'relative',
                ...position
            }}
        >
            <img src={cardImage} alt={card} />
            {isPlayable && (
                <motion.div
                    className="card-highlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                />
            )}
        </motion.div>
    );
};

export default Card;