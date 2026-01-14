'use client';

import { useState, useRef, useEffect } from 'react';
import { useExam } from '../contexts/ExamContext';

export default function SettingsMenu() {
    const { theme, setTheme, fontSize, setFontSize } = useExam();
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

    const fontSizes = [
        { id: 'standard', name: 'Standard', label: 'A' },
        { id: 'large', name: 'Large', label: 'A+' },
        { id: 'extra-large', name: 'Extra Large', label: 'A++' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300 hover:text-white"
                title="Settings"
                aria-label="Settings"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 border overflow-hidden backdrop-blur-sm"
                    style={{ backgroundColor: 'var(--card-bg, #1f2937)', borderColor: 'var(--border-color, #374151)' }}
                >
                    <div
                        className="px-4 py-3 border-b"
                        style={{ backgroundColor: 'var(--panel-bg, #111827)', borderColor: 'var(--border-color, #374151)' }}
                    >
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-color, #fff)' }}>Accessibility Settings</h3>
                    </div>

                    <div className="p-3 space-y-4">
                        {/* Text Size */}
                        <div>
                            <p className="px-1 text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Text Size</p>
                            <div className="flex bg-gray-900/50 rounded-lg p-1 border border-gray-700">
                                {fontSizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setFontSize(size.id)}
                                        className={`flex-1 py-1.5 px-2 text-sm rounded-md transition-all font-serif ${fontSize === size.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                            }`}
                                        title={size.name}
                                    >
                                        <span className={size.id === 'extra-large' ? 'text-lg' : size.id === 'large' ? 'text-base' : 'text-sm'}>
                                            A
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Theme */}
                        <div>
                            <p className="px-1 text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Color Theme</p>
                            <div className="space-y-1">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTheme(t.id);
                                            // Optional: Close on theme change or keep open?
                                            // Keeping open allows for quick previewing
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-all ${theme === t.id
                                            ? 'bg-white/10 ring-1 ring-white/20'
                                            : 'hover:bg-white/5'
                                            }`}
                                        style={{
                                            color: theme === t.id ? 'var(--text-color, #fff)' : 'var(--text-muted, #9ca3af)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border border-gray-600 ${t.bg} shadow-sm flex items-center justify-center`}>
                                                {t.id === 'high-contrast' && <span className="text-[10px] text-yellow-400 font-bold">HC</span>}
                                                {t.id === 'inverted' && <span className="text-[10px] text-white font-bold">Aa</span>}
                                                {t.id === 'standard' && <span className="text-[10px] text-black font-bold">Aa</span>}
                                            </div>
                                            <span>{t.name}</span>
                                        </div>
                                        {theme === t.id && (
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
