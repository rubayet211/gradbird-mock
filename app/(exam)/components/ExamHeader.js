'use client';

import { useExam, formatTime } from '../contexts/ExamContext';

export default function ExamHeader() {
    const { timeLeft } = useExam();

    return (
        <header className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between select-none">
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
                <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <svg
                        className="w-5 h-5 text-amber-400"
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
                    <span className="font-mono text-lg font-bold text-amber-400">
                        {formatTime(timeLeft)}
                    </span>
                </div>

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
                    onClick={() => alert('Hide clicked')}
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
                    <span>Hide</span>
                </button>
            </div>
        </header>
    );
}
