import React, { useEffect, useRef, useState } from 'react';

// Audio file imports
import backgroundMusic from '../assets/audio/background.mp3';
import cardFlipSound from '../assets/audio/card_flip.mp3';
import drawingCardsSound from '../assets/audio/drawing_cards.mp3';
import winSound from '../assets/audio/win.mp3';
import loseSound from '../assets/audio/lose.mp3';
import startGameSound from '../assets/audio/start_game.mp3';

const AudioPlayer = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    
    // Audio refs
    const backgroundMusicRef = useRef(null);
    const cardFlipRef = useRef(null);
    const drawingCardsRef = useRef(null);
    const winRef = useRef(null);
    const loseRef = useRef(null);
    const startGameRef = useRef(null);

    // Initialize audio elements
    useEffect(() => {
        // Background music setup
        backgroundMusicRef.current = new Audio(backgroundMusic);
        backgroundMusicRef.current.loop = true;
        
        // Sound effects setup
        cardFlipRef.current = new Audio(cardFlipSound);
        drawingCardsRef.current = new Audio(drawingCardsSound);
        winRef.current = new Audio(winSound);
        loseRef.current = new Audio(loseSound);
        startGameRef.current = new Audio(startGameSound);

        // Set initial volume for all audio elements
        const audioElements = [
            backgroundMusicRef,
            cardFlipRef,
            drawingCardsRef,
            winRef,
            loseRef,
            startGameRef
        ];

        audioElements.forEach(audioRef => {
            if (audioRef.current) {
                audioRef.current.volume = volume;
            }
        });

        // Cleanup function
        return () => {
            audioElements.forEach(audioRef => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            });
        };
    }, []);

    // Handle volume changes
    useEffect(() => {
        const audioElements = [
            backgroundMusicRef,
            cardFlipRef,
            drawingCardsRef,
            winRef,
            loseRef,
            startGameRef
        ];

        audioElements.forEach(audioRef => {
            if (audioRef.current) {
                audioRef.current.volume = isMuted ? 0 : volume;
            }
        });
    }, [volume, isMuted]);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && backgroundMusicRef.current) {
                backgroundMusicRef.current.pause();
            } else if (!document.hidden && backgroundMusicRef.current && !isMuted) {
                backgroundMusicRef.current.play().catch(() => {});
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isMuted]);

    // Audio control functions
    const playSound = (audioRef) => {
        if (audioRef.current && !isMuted) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            backgroundMusicRef.current?.pause();
        } else {
            backgroundMusicRef.current?.play().catch(() => {});
        }
    };

    const adjustVolume = (newVolume) => {
        setVolume(newVolume);
    };

    // Game sound functions
    const playBackgroundMusic = () => {
        if (backgroundMusicRef.current && !isMuted) {
            backgroundMusicRef.current.play().catch(() => {});
        }
    };

    const playCardFlip = () => playSound(cardFlipRef);
    const playDrawingCards = () => playSound(drawingCardsRef);
    const playWin = () => playSound(winRef);
    const playLose = () => playSound(loseRef);
    const playStartGame = () => playSound(startGameRef);

    return {
        playCardFlip,
        playDrawingCards,
        playWin,
        playLose,
        playStartGame,
        playBackgroundMusic,
        toggleMute,
        adjustVolume,
        isMuted,
        volume
    };
};

export default AudioPlayer;