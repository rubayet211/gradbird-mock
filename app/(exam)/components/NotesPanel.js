'use client';

import { useState, useRef, useEffect } from 'react';
import { useExam } from '../contexts/ExamContext';

/**
 * Slide-out panel for viewing and managing all notes
 */
export default function NotesPanel({ isOpen, onClose }) {
    const { notes, removeNote, updateNote } = useExam();
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editText, setEditText] = useState('');
    const panelRef = useRef(null);
    const textareaRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (editingNoteId) {
                    setEditingNoteId(null);
                    setEditText('');
                } else {
                    onClose();
                }
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, editingNoteId]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            // Delay adding listener to prevent immediate close
            const timeout = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timeout);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    // Focus textarea when editing
    useEffect(() => {
        if (editingNoteId && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editingNoteId]);

    const handleEdit = (note) => {
        setEditingNoteId(note.id);
        setEditText(note.note);
    };

    const handleSaveEdit = () => {
        if (editingNoteId && editText.trim()) {
            updateNote(editingNoteId, { note: editText.trim() });
        }
        setEditingNoteId(null);
        setEditText('');
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditText('');
    };

    const handleDelete = (noteId) => {
        removeNote(noteId);
        if (editingNoteId === noteId) {
            setEditingNoteId(null);
            setEditText('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            {/* Panel */}
            <div
                ref={panelRef}
                className="absolute right-0 top-0 h-full w-full max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            >
                {/* Header */}
                <div
                    className="px-5 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
                            My Notes
                        </h2>
                        <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                            {notes.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close notes panel"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📋</span>
                            </div>
                            <h3 className="text-gray-600 font-medium mb-2">No notes yet</h3>
                            <p className="text-sm text-gray-400 max-w-xs">
                                Select text in the passage and right-click to add a note.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)' }}
                                >
                                    {/* Selected text */}
                                    <div className="mb-3">
                                        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                            Highlighted Text
                                        </span>
                                        <p className="mt-1 text-sm italic line-clamp-2 rounded px-2 py-1" style={{ backgroundColor: 'rgba(128,128,128,0.1)', color: 'var(--text-color)' }}>
                                            "{note.text}"
                                        </p>
                                    </div>

                                    {/* Note content */}
                                    <div className="mb-3">
                                        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                                            Your Note
                                        </span>
                                        {editingNoteId === note.id ? (
                                            <div className="mt-1">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full h-24 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                                    placeholder="Enter your note..."
                                                    style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-sm" style={{ color: 'var(--text-color)' }}>
                                                {note.note}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {editingNoteId !== note.id && (
                                        <div className="flex gap-2 pt-2 border-t border-amber-200">
                                            <button
                                                onClick={() => handleEdit(note)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
                    <p className="text-xs text-center" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                        Tip: Right-click on text to add new notes
                    </p>
                </div>
            </div>
        </div>
    );
}
