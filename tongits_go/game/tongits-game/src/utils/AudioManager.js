class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.activeAudio = new Set();
        this.isMuted = false;

        // Bind visibility change handler
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    loadSound(key, soundPath) {
        const audio = new Audio(soundPath);
        this.sounds.set(key, audio);
        return audio;
    }

    play(key) {
        if (this.isMuted) return;

        const audio = this.sounds.get(key);
        if (!audio) return;

        // Create a new instance for overlapping sounds
        const soundInstance = new Audio(audio.src);
        this.activeAudio.add(soundInstance);

        soundInstance.addEventListener('ended', () => {
            this.activeAudio.delete(soundInstance);
        });

        soundInstance.play().catch(error => {
            console.error('Audio playback error:', error);
            this.activeAudio.delete(soundInstance);
        });
    }

    stopAll() {
        this.activeAudio.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeAudio.clear();
    }

    pauseAll() {
        this.activeAudio.forEach(audio => audio.pause());
    }

    resumeAll() {
        if (this.isMuted) return;
        this.activeAudio.forEach(audio => audio.play().catch(console.error));
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (muted) {
            this.pauseAll();
        } else {
            this.resumeAll();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAll();
        } else {
            this.resumeAll();
        }
    }

    cleanup() {
        this.stopAll();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.sounds.clear();
    }
}

const audioManager = new AudioManager();
export default audioManager;