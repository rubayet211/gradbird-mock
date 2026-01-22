'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * useExamAudio - Custom hook for strict audio playback in IELTS Listening
 * 
 * Features:
 * - Auto-play on mount
 * - Seeking DISABLED (forces currentTime back to tracked position)
 * - Volume control via external state
 * - onEnded callback for review phase transition
 * 
 * @param {Object} options
 * @param {string} options.audioUrl - URL of the audio file
 * @param {number} options.volume - Volume level (0.0 to 1.0)
 * @param {Function} options.onEnded - Callback when audio playback ends
 * @param {boolean} options.disabled - Whether audio controls are disabled
 */
export function useExamAudio({ audioUrl, volume = 1, onEnded, disabled = false }) {
    const audioRef = useRef(null);
    const trackedTimeRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Create audio element on mount
    useEffect(() => {
        const normalizedUrl = typeof audioUrl === 'string' ? audioUrl.trim() : '';

        setError(null);
        setIsLoaded(false);
        setDuration(0);
        setCurrentTime(0);
        trackedTimeRef.current = 0;

        if (!normalizedUrl) return;

        const audio = new Audio(normalizedUrl);
        audioRef.current = audio;

        // Event handlers
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoaded(true);
        };

        const handleTimeUpdate = () => {
            trackedTimeRef.current = audio.currentTime;
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (onEnded) {
                onEnded();
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleError = () => {
            const mediaError = audio.error;
            const code = mediaError?.code;
            const message = code === 1
                ? 'Audio loading was aborted'
                : code === 2
                    ? 'Network error while loading audio'
                    : code === 3
                        ? 'Audio decoding failed'
                        : code === 4
                            ? 'Audio format not supported'
                            : 'Failed to load audio';
            setError(message);
            setIsLoaded(false);
        };

        // CRITICAL: Prevent seeking by forcing time back to tracked position
        const handleSeeking = () => {
            // If the user somehow tries to seek, force the time back
            if (Math.abs(audio.currentTime - trackedTimeRef.current) > 0.5) {
                audio.currentTime = trackedTimeRef.current;
            }
        };

        // Attach event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);
        audio.addEventListener('seeking', handleSeeking);

        // Auto-play when loaded
        audio.addEventListener('canplaythrough', () => {
            if (!disabled) {
                audio.play().catch(err => {
                    console.error('Autoplay failed:', err);
                    // Browsers may block autoplay; user interaction required
                });
            }
        });

        // Cleanup
        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('seeking', handleSeeking);
            audioRef.current = null;
        };
    }, [audioUrl, disabled, onEnded]);

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    }, [volume]);

    // Manual play trigger (for user interaction requirement)
    const play = useCallback(() => {
        if (audioRef.current && !disabled && !error) {
            audioRef.current.play().catch(err => {
                console.error('Play failed:', err);
            });
        }
    }, [disabled, error]);

    // Pause is NOT exposed to users, but used internally
    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    // Format time helper
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        isLoaded,
        error,
        formattedCurrentTime: formatTime(currentTime),
        formattedDuration: formatTime(duration),
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
        play,
        // Note: pause and seek are intentionally NOT exposed for exam security
    };
}

export default useExamAudio;
