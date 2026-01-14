'use client';

import { useMemo } from 'react';

/**
 * Multiple Answer MCQ Component
 * Handles "Choose TWO/THREE letters" type questions with checkbox inputs
 * and answer count validation.
 * 
 * @param {Object} props
 * @param {Object} props.questionGroup - Question data object
 * @param {number} props.questionNumber - Display number for the question
 * @param {Object} props.answers - Current answers from ExamContext (keyed by question ID)
 * @param {Function} props.onAnswerChange - Callback to update answers
 */
export default function MultipleAnswerMCQ({
    questionGroup,
    questionNumber,
    answers,
    onAnswerChange,
    disabled = false,
}) {
    const {
        id,
        instruction,
        text,
        options,
        requiredCount,
    } = questionGroup;

    // Get current selected answers as an array
    const selectedAnswers = useMemo(() => {
        const answer = answers[id];
        if (!answer) return [];
        if (Array.isArray(answer)) return answer;
        return [];
    }, [answers, id]);

    const selectedCount = selectedAnswers.length;
    const remainingCount = requiredCount - selectedCount;
    const isComplete = selectedCount === requiredCount;

    // Handle checkbox change
    const handleCheckboxChange = (optionId) => {
        let newAnswers;

        if (selectedAnswers.includes(optionId)) {
            // Deselect: remove from array
            newAnswers = selectedAnswers.filter((id) => id !== optionId);
        } else if (selectedCount < requiredCount) {
            // Select: add to array (only if not at max)
            newAnswers = [...selectedAnswers, optionId];
        } else {
            // Already at max, do nothing
            return;
        }

        onAnswerChange(id, newAnswers);
    };

    // Check if an option should be disabled
    const isOptionDisabled = (optionId) => {
        // Disable unselected options when max is reached
        return isComplete && !selectedAnswers.includes(optionId);
    };

    return (
        <div
            className="rounded-xl shadow-sm border p-5 transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        >
            {/* Question Header */}
            <div className="flex gap-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {questionNumber}
                </span>
                <div className="flex-1">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                        {instruction}
                    </p>
                    <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                        {text}
                    </p>
                </div>
            </div>

            {/* Selection Feedback */}
            <div className="mb-4 px-4">
                {isComplete ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Selection complete</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">
                            Select {remainingCount} more option{remainingCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className="space-y-3 pl-12">
                {options.map((option) => {
                    const isSelected = selectedAnswers.includes(option.id);
                    const isDisabled = isOptionDisabled(option.id);

                    return (
                        <label
                            key={option.id}
                            className={`
                                flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                ${isSelected
                                    ? 'border-purple-600 bg-purple-50'
                                    : (isDisabled || disabled)
                                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            {/* Custom Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled || disabled}
                                    onChange={() => handleCheckboxChange(option.id)}
                                    className="sr-only"
                                />
                                <div
                                    className={`
                                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                        ${isSelected
                                            ? 'border-purple-600 bg-purple-600'
                                            : isDisabled
                                                ? 'opacity-50'
                                                : ''
                                        }
                                    `}
                                    style={{
                                        backgroundColor: isSelected ? undefined : 'var(--input-bg)',
                                        borderColor: isSelected ? undefined : 'var(--border-color)'
                                    }}
                                >
                                    {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Option Letter */}
                            <span
                                className={`
                                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm
                                    ${isSelected
                                        ? 'bg-purple-600 text-white'
                                        : isDisabled
                                            ? 'bg-gray-200 text-gray-400'
                                            : 'bg-gray-200 text-gray-700'
                                    }
                                `}
                            >
                                {option.id}
                            </span>

                            {/* Option Text */}
                            <span
                                className={`
                                    flex-1 text-sm
                                    ${isSelected
                                        ? 'text-purple-700 font-medium'
                                        : isDisabled
                                            ? 'text-gray-400'
                                            : 'text-gray-700'
                                    }
                                `}
                            >
                                {option.text}
                            </span>
                        </label>
                    );
                })}
            </div>

            {/* Selected Summary */}
            {selectedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 pl-12">
                    <p className="text-xs text-gray-500">
                        Selected: <span className="font-medium text-gray-700">{[...selectedAnswers].sort().join(', ')}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
