'use client';

/**
 * Writing Storage Utility
 * Handles localStorage persistence for exam writing responses
 */

const STORAGE_KEY_PREFIX = 'exam-writing-';

/**
 * Get the localStorage key for a session's writing responses
 * @param {string} sessionId - The exam session ID
 * @returns {string} The localStorage key
 */
function getWritingKey(sessionId) {
    return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

/**
 * Retrieve writing responses for a session
 * @param {string} sessionId - The exam session ID
 * @returns {Object} Object containing task1Text and task2Text
 */
export function getWritingResponses(sessionId) {
    if (typeof window === 'undefined' || !sessionId) {
        return { task1Text: '', task2Text: '' };
    }

    try {
        const stored = localStorage.getItem(getWritingKey(sessionId));
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                task1Text: parsed.task1Text || '',
                task2Text: parsed.task2Text || ''
            };
        }
        return { task1Text: '', task2Text: '' };
    } catch (error) {
        console.error('Error reading writing responses from localStorage:', error);
        return { task1Text: '', task2Text: '' };
    }
}

/**
 * Save writing responses for a session
 * @param {string} sessionId - The exam session ID
 * @param {Object} responses - Object containing task1Text and task2Text
 */
export function saveWritingResponses(sessionId, responses) {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
        localStorage.setItem(getWritingKey(sessionId), JSON.stringify(responses));
    } catch (error) {
        console.error('Error saving writing responses to localStorage:', error);
    }
}

/**
 * Clear writing responses for a session
 * @param {string} sessionId - The exam session ID
 */
export function clearWritingData(sessionId) {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
        localStorage.removeItem(getWritingKey(sessionId));
    } catch (error) {
        console.error('Error clearing writing data from localStorage:', error);
    }
}
