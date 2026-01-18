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
        answers,
    } = useExam();

    const currentQuestionId = currentQuestionIndex + 1;

    return (
        <footer className="bg-gray-900 text-white px-4 py-3 select-none">
            {/* Question Numbers - Scrollable */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="flex gap-2 pb-2">
                        {questionStatus.map((question, index) => {
                            const isAnswered = !!answers[question.id];
                            const isFlagged = question.status === 'flagged';
                            const isActive = index === currentQuestionIndex;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => goToQuestion(index)}
                                    className={`
                                        flex-shrink-0 w-10 h-10 rounded border font-medium relative
                                        transition-all duration-200 flex items-center justify-center
                                        ${isActive
                                            ? 'bg-blue-700 border-blue-500 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900 z-10'
                                            : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                                        }
                                        ${isAnswered ? '!border-b-4 !border-b-blue-500' : ''}
                                    `}
                                >
                                    {isFlagged && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-0.5 shadow-sm z-20">
                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                                            </svg>
                                        </div>
                                    )}
                                    {question.id}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                {/* Left: Flag and Review Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleFlag(currentQuestionId)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border
                            ${questionStatus[currentQuestionIndex]?.status === 'flagged'
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300'
                            }
                        `}
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                        </svg>
                        <span>{questionStatus[currentQuestionIndex]?.status === 'flagged' ? 'Flagged' : 'Flag'}</span>
                    </button>

                    <button
                        onClick={useExam().toggleReviewScreen}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Review</span>
                    </button>
                </div>

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
