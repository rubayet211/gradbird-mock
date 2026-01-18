'use client';

import { useExam } from '../contexts/ExamContext';

export default function ReviewScreen() {
    const {
        questionStatus,
        answers,
        currentQuestionIndex,
        goToQuestion,
        toggleReviewScreen,
        isReviewOpen,
        toggleFlag,
    } = useExam();

    if (!isReviewOpen) return null;

    // Calculate stats
    const totalQuestions = questionStatus.length;
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = questionStatus.filter(q => q.status === 'flagged').length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800">
                <h2 className="text-xl font-bold">Review Your Answers</h2>
                <button
                    onClick={toggleReviewScreen}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Close review screen"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-6 mb-8 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded"></div>
                            <span className="text-sm text-gray-400">Unanswered ({unansweredCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border border-blue-600 rounded relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">Answered ({answeredCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 relative">
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center">
                                    <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                                        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">Flagged ({flaggedCount})</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 mb-12">
                        {questionStatus.map((question, index) => {
                            const isAnswered = !!answers[question.id];
                            const isFlagged = question.status === 'flagged';
                            const isCurrent = index === currentQuestionIndex;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => {
                                        goToQuestion(index);
                                        toggleReviewScreen();
                                    }}
                                    className={`
                                        relative group flex items-center justify-center h-12 rounded-lg border-2 font-medium transition-all
                                        ${isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 border-blue-500' : ''}
                                        ${isAnswered
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                                        }
                                    `}
                                >
                                    {/* Flag Indicator */}
                                    {isFlagged && (
                                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md z-10">
                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Answered Indicator (Blue Dot) */}
                                    {isAnswered && (
                                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    )}

                                    <span className="text-lg">{index + 1}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end">
                <button
                    onClick={submitExam}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all text-lg flex items-center gap-2"
                >
                    <span>Submit & End Test</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
