'use client';

import { useExam } from '../contexts/ExamContext';

export default function PrivacyScreen() {
    const { isHidden, toggleHideScreen } = useExam();

    if (!isHidden) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={toggleHideScreen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    toggleHideScreen();
                }
            }}
            aria-label="Privacy screen enabled. Click or press Enter to resume."
        >
            <div className="text-white text-center animate-pulse">
                <svg
                    className="w-20 h-20 mx-auto mb-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                </svg>
                <h2 className="text-3xl font-bold mb-3 tracking-wide">Screen Hidden</h2>
                <p className="text-gray-400 text-lg">Click anywhere to resume exam</p>
                <div className="mt-8 text-xs text-gray-600 uppercase tracking-widest">
                    Privacy Mode Active
                </div>
            </div>
        </div>
    );
}
