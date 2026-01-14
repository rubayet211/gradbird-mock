'use client';

import { useExam } from '../contexts/ExamContext';

export default function ExamFooter() {
    const {
        currentQuestionIndex,
        questionStatus,
        totalQuestions,
        goToQuestion,
        goToNextQuestion,
        goToPrevQuestion,
        toggleFlag,
    } = useExam();

    const currentQuestionId = currentQuestionIndex + 1;

    // Get status color for a question
    const getStatusColor = (status, isActive) => {
        if (isActive) {
            return 'bg-blue-600 text-white border-blue-600';
        }
        switch (status) {
            case 'answered':
                return 'bg-green-600 text-white border-green-600';
            case 'flagged':
                return 'bg-amber-500 text-white border-amber-500';
            default:
                return 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600';
        }
    };

    return (
        <footer className="bg-gray-900 text-white px-4 py-3 select-none">
            {/* Question Numbers - Scrollable */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="flex gap-2 pb-2">
                        {questionStatus.map((question, index) => (
                            <button
                                key={question.id}
                                onClick={() => goToQuestion(index)}
                                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg border-2 font-medium
                  transition-all duration-200 flex items-center justify-center
                  ${getStatusColor(question.status, index === currentQuestionIndex)}
                `}
                            >
                                {question.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                {/* Left: Review Button */}
                <button
                    onClick={() => toggleFlag(currentQuestionId)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${questionStatus[currentQuestionIndex]?.status === 'flagged'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }
          `}
                >
                    <svg
                        className="w-5 h-5"
                        fill={questionStatus[currentQuestionIndex]?.status === 'flagged' ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                    </svg>
                    <span>Review</span>
                </button>

                {/* Center: Question Indicator */}
                <div className="text-gray-400">
                    Question <span className="text-white font-bold">{currentQuestionId}</span> of{' '}
                    <span className="text-white">{totalQuestions}</span>
                </div>

                {/* Right: Navigation Arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        <span>Prev</span>
                    </button>

                    <button
                        onClick={goToNextQuestion}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <span>Next</span>
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
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </footer>
    );
}
