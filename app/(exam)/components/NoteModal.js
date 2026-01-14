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
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>📝</span>
                        Add Note
                    </h3>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Selected text preview */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Selected Text
                        </label>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700 max-h-24 overflow-y-auto">
                            "{selectedText}"
                        </div>
                    </div>

                    {/* Note input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Your Note
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your note here..."
                            className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                            Press Ctrl+Enter to save
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
