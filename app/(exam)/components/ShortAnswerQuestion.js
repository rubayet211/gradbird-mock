import React from 'react';

/**
 * Short Answer Question Component
 * 
 * Allows users to answer questions with a short text response, enforcing a word limit.
 * 
 * @param {Object} props
 * @param {Object} props.questionGroup - The group of questions
 * @param {Object} props.answers - Current answers state
 * @param {Function} props.onAnswerChange - Handler for answer changes
 * @param {number} props.startNumber - The starting question number for this group
 */
export default function ShortAnswerQuestion({ questionGroup, answers, onAnswerChange, startNumber, disabled = false }) {
    // Helper to count words
    const countWords = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    };

    const handleInputChange = (questionId, text, limit) => {
        // We allow typing even if over limit, but could show warning
        onAnswerChange(questionId, text);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {questionGroup.instruction || 'Answer the questions below.'}
                </h3>
                {questionGroup.wordLimitDescription && (
                    <p className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg inline-block border border-amber-200">
                        {questionGroup.wordLimitDescription}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                {questionGroup.questions.map((question, index) => {
                    const questionNum = startNumber + index;
                    const currentValue = answers[question.id] || '';
                    const wordCount = countWords(currentValue);
                    const limit = question.wordLimit || 3; // Default to 3 if not specified
                    const isOverLimit = wordCount > limit;

                    return (
                        <div key={question.id} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-shrink-0 pt-2">
                                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {questionNum}
                                </span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <label
                                    htmlFor={question.id}
                                    className="text-gray-800 font-medium block leading-relaxed"
                                >
                                    {question.text}
                                </label>

                                <div className="max-w-md">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id={question.id}
                                            value={currentValue}
                                            onChange={(e) => handleInputChange(question.id, e.target.value, limit)}
                                            disabled={disabled}
                                            className={`
                                                w-full px-4 py-2 rounded-lg border-2 outline-none transition-all
                                                disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                                                ${isOverLimit
                                                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                                                    : 'border-gray-300 focus:border-blue-500 hover:border-blue-300'
                                                }
                                            `}
                                            placeholder="Type your answer here..."
                                            autoComplete="off"
                                        />
                                        <div className={`
                                            absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full
                                            ${isOverLimit ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                            {wordCount}/{limit} words
                                        </div>
                                    </div>
                                    {isOverLimit && (
                                        <p className="text-red-600 text-xs mt-1 font-medium flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Word limit exceeded
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
