'use client';

import { useState, useRef, useEffect } from 'react';
import { useExam } from '../contexts/ExamContext';

export default function SettingsMenu() {
    const { theme, setTheme } = useExam();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themes = [
        { id: 'standard', name: 'Standard', bg: 'bg-white', text: 'text-black' },
        { id: 'inverted', name: 'Inverted', bg: 'bg-black', text: 'text-white' },
        { id: 'high-contrast', name: 'High Contrast', bg: 'bg-black', text: 'text-yellow-400' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
                title="Settings"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 border overflow-hidden"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                >
                    <div
                        className="px-4 py-3 border-b"
                        style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}
                    >
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>Display Settings</h3>
                    </div>

                    <div className="p-2">
                        <p className="px-2 py-1 text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Color Theme</p>
                        <div className="space-y-1">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all ${theme === t.id
                                        ? 'font-medium ring-1 ring-blue-200'
                                        : ''
                                        }`}
                                    style={{
                                        backgroundColor: theme === t.id ? 'var(--panel-bg)' : 'transparent',
                                        color: theme === t.id ? 'var(--text-color)' : 'var(--text-color)',
                                        borderColor: theme === t.id ? 'var(--border-color)' : undefined
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border border-gray-300 ${t.bg} shadow-sm`}></div>
                                        <span>{t.name}</span>
                                    </div>
                                    {theme === t.id && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
