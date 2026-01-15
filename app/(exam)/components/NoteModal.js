'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Modal dialog for adding notes to selected text
 */
export default function NoteModal({ selectedText, onSave, onClose }) {
    const [noteText, setNoteText] = useState('');
    const textareaRef = useRef(null);

    // Focus textarea on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSave = () => {
        if (noteText.trim()) {
            onSave(noteText.trim());
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-150"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                        <span>📝</span>
                        Add Note
                    </h3>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Selected text preview */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                            Selected Text
                        </label>
                        <div className="border rounded-lg p-3 text-sm max-h-24 overflow-y-auto" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                            "{selectedText}"
                        </div>
                    </div>

                    {/* Note input */}
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                            Your Note
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your note here..."
                            className="w-full h-28 px-4 py-3 border rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-color)',
                                borderColor: 'var(--border-color)'
                            }}
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                            Press Ctrl+Enter to save
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-gray-100/10 rounded-lg transition-colors"
                        style={{ color: 'var(--text-color)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!noteText.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Note
                    </button>
                </div>
            </div>
        </div>
    );
}
