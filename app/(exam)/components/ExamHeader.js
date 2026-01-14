'use client';

import { useState } from 'react';
import { useExam, formatTime } from '../contexts/ExamContext';
import NotesPanel from './NotesPanel';

import SettingsMenu from './SettingsMenu';

export default function ExamHeader() {
    const { timeLeft, notes, toggleHideScreen, isHidden } = useExam();
    const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

    return (
        <>
            <header
                className="px-6 py-3 flex items-center justify-between select-none shadow-md z-40 relative"
                style={{ backgroundColor: 'var(--header-bg)', color: 'var(--header-text)' }}
            >
                {/* Left: Candidate Details */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Candidate</span>
                        <span className="font-medium">John Doe</span>
                    </div>
                    <div className="h-8 w-px bg-gray-700" />
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Test</span>
                        <span className="font-medium">IELTS Reading</span>
                    </div>
                </div>

                {/* Right: Timer and Controls */}
                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                        <svg
                            className={`w-5 h-5 ${timeLeft <= 300
                                ? 'text-red-500 animate-pulse'
                                : timeLeft <= 600
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span
                            className={`font-mono text-lg font-bold ${timeLeft <= 300
                                ? 'text-red-500 animate-pulse'
                                : timeLeft <= 600
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                }`}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Settings Menu */}
                    <SettingsMenu />

                    {/* Notes Button */}
                    <button
                        className="relative flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-sm"
                        onClick={() => setIsNotesPanelOpen(true)}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h8.586l3.707-3.707A1 1 0 0016.586 12H17a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
                        </svg>
                        <span>Notes</span>
                        {notes.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-amber-600 text-xs font-bold rounded-full flex items-center justify-center">
                                {notes.length}
                            </span>
                        )}
                    </button>

                    {/* Help Button */}
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => alert('Help clicked')}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Help</span>
                    </button>

                    {/* Hide Button */}
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={toggleHideScreen}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                        </svg>
                        <span>{isHidden ? 'Resume' : 'Hide'}</span>
                    </button>
                </div>
            </header>

            {/* Notes Panel */}
            <NotesPanel
                isOpen={isNotesPanelOpen}
                onClose={() => setIsNotesPanelOpen(false)}
            />
        </>
    );
}

