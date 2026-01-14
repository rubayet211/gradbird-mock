'use client';

/**
 * Highlight Storage Utility
 * Handles localStorage persistence for exam highlights and notes
 */

const STORAGE_KEY_PREFIX = 'exam-highlights-';
const NOTES_KEY_PREFIX = 'exam-notes-';

/**
 * Get the localStorage key for a session's highlights
 * @param {string} sessionId - The exam session ID
 * @returns {string} The localStorage key
 */
function getHighlightsKey(sessionId) {
    return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

/**
 * Get the localStorage key for a session's notes
 * @param {string} sessionId - The exam session ID
 * @returns {string} The localStorage key
 */
function getNotesKey(sessionId) {
    return `${NOTES_KEY_PREFIX}${sessionId}`;
}

/**
 * Retrieve all highlights for a session
 * @param {string} sessionId - The exam session ID
 * @returns {Array} Array of highlight objects
 */
export function getHighlights(sessionId) {
    if (typeof window === 'undefined' || !sessionId) return [];

    try {
        const stored = localStorage.getItem(getHighlightsKey(sessionId));
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading highlights from localStorage:', error);
        return [];
    }
}

/**
 * Save highlights for a session
 * @param {string} sessionId - The exam session ID
 * @param {Array} highlights - Array of highlight objects
 */
export function saveHighlights(sessionId, highlights) {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
        localStorage.setItem(getHighlightsKey(sessionId), JSON.stringify(highlights));
    } catch (error) {
        console.error('Error saving highlights to localStorage:', error);
    }
}

/**
 * Remove a specific highlight
 * @param {string} sessionId - The exam session ID
 * @param {number} highlightId - The ID of the highlight to remove
 * @returns {Array} Updated highlights array
 */
export function removeHighlightFromStorage(sessionId, highlightId) {
    const highlights = getHighlights(sessionId);
    const updatedHighlights = highlights.filter(h => h.id !== highlightId);
    saveHighlights(sessionId, updatedHighlights);
    return updatedHighlights;
}

/**
 * Retrieve all notes for a session
 * @param {string} sessionId - The exam session ID
 * @returns {Array} Array of note objects
 */
export function getNotes(sessionId) {
    if (typeof window === 'undefined' || !sessionId) return [];

    try {
        const stored = localStorage.getItem(getNotesKey(sessionId));
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading notes from localStorage:', error);
        return [];
    }
}

/**
 * Save notes for a session
 * @param {string} sessionId - The exam session ID
 * @param {Array} notes - Array of note objects
 */
export function saveNotes(sessionId, notes) {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
        localStorage.setItem(getNotesKey(sessionId), JSON.stringify(notes));
    } catch (error) {
        console.error('Error saving notes to localStorage:', error);
    }
}

/**
 * Remove a specific note
 * @param {string} sessionId - The exam session ID
 * @param {number} noteId - The ID of the note to remove
 * @returns {Array} Updated notes array
 */
export function removeNoteFromStorage(sessionId, noteId) {
    const notes = getNotes(sessionId);
    const updatedNotes = notes.filter(n => n.id !== noteId);
    saveNotes(sessionId, updatedNotes);
    return updatedNotes;
}

/**
 * Clear all highlights and notes for a session
 * @param {string} sessionId - The exam session ID
 */
export function clearSessionData(sessionId) {
    if (typeof window === 'undefined' || !sessionId) return;

    try {
        localStorage.removeItem(getHighlightsKey(sessionId));
        localStorage.removeItem(getNotesKey(sessionId));
    } catch (error) {
        console.error('Error clearing session data from localStorage:', error);
    }
}
