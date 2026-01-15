'use client';

import { useMemo, useCallback } from 'react';

/**
 * Gap Fill Question Component
 * Handles sentence completion questions with inline text inputs at blank positions.
 * Supports ____ or {BLANK} markers in question text.
 * 
 * @param {Object} props
 * @param {Object} props.questionGroup - Question group data object
 * @param {number} props.startNumber - Starting question number for display
 * @param {Object} props.answers - Current answers from ExamContext (keyed by question ID)
 * @param {Function} props.onAnswerChange - Callback to update answers
 */
export default function GapFillQuestion({
    questionGroup,
    startNumber,
    answers,
    onAnswerChange,
    disabled = false,
}) {
    const { instruction, questions } = questionGroup;

    return (
        <div className="space-y-6">
            {/* Instruction Box */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800 font-medium mb-2">Instructions:</p>
                <p className="text-sm text-teal-700">{instruction}</p>
            </div>

            {/* Questions List */}
            {questions.map((question, index) => (
                <GapFillItem
                    key={question.id}
                    question={question}
                    questionNumber={startNumber + index}
                    answer={answers[question.id] || ''}
                    onAnswerChange={onAnswerChange}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}

/**
 * Individual Gap Fill Item Component
 * Renders a single gap fill question with inline input(s)
 */
function GapFillItem({
    question,
    questionNumber,
    answer,
    onAnswerChange,
    disabled,
}) {
    const { id, text, wordLimit } = question;

    // Parse the text to find blank markers and split into segments
    const segments = useMemo(() => {
        // Match ____ (4+ underscores), {BLANK}, or {BLANK_N}
        const blankPattern = /_{3,}|\{BLANK(?:_\d+)?\}/gi;
        const parts = [];
        let lastIndex = 0;
        let blankIndex = 0;
        let match;

        const regex = new RegExp(blankPattern);
        while ((match = regex.exec(text)) !== null) {
            // Add text before the blank
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index),
                });
            }
            // Add the blank marker
            parts.push({
                type: 'blank',
                index: blankIndex,
                marker: match[0],
            });
            blankIndex++;
            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last blank
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex),
            });
        }

        return parts;
    }, [text]);

    // Count number of blanks
    const blankCount = useMemo(() => {
        return segments.filter(s => s.type === 'blank').length;
    }, [segments]);

    // Handle answers - for single blank use string, for multiple use object
    const getBlankValue = useCallback((blankIndex) => {
        if (blankCount === 1) {
            return typeof answer === 'string' ? answer : '';
        }
        // Multiple blanks: answer is an object { 0: 'value', 1: 'value' }
        return typeof answer === 'object' && answer !== null ? (answer[blankIndex] || '') : '';
    }, [answer, blankCount]);

    const handleBlankChange = useCallback((blankIndex, value) => {
        if (blankCount === 1) {
            onAnswerChange(id, value);
        } else {
            // Multiple blanks: merge into answer object
            const currentAnswer = typeof answer === 'object' && answer !== null ? answer : {};
            onAnswerChange(id, {
                ...currentAnswer,
                [blankIndex]: value,
            });
        }
    }, [id, blankCount, answer, onAnswerChange]);

    // Count words in a string
    const countWords = (str) => {
        if (!str || typeof str !== 'string') return 0;
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    // Check if any blank exceeds word limit
    const hasExceededLimit = useMemo(() => {
        if (!wordLimit) return false;

        if (blankCount === 1) {
            return countWords(answer) > wordLimit;
        }

        if (typeof answer === 'object' && answer !== null) {
            return Object.values(answer).some(val => countWords(val) > wordLimit);
        }

        return false;
    }, [answer, wordLimit, blankCount]);

    // Check if question is answered
    const isAnswered = useMemo(() => {
        if (blankCount === 1) {
            return typeof answer === 'string' && answer.trim().length > 0;
        }
        if (typeof answer === 'object' && answer !== null) {
            const filledBlanks = Object.values(answer).filter(v => v && v.trim().length > 0).length;
            return filledBlanks === blankCount;
        }
        return false;
    }, [answer, blankCount]);

    return (
        <div
            className="rounded-xl shadow-sm border p-5 transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
        >
            <div className="flex gap-4">
                {/* Question Number */}
                <span className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {questionNumber}
                </span>

                {/* Question Content with Inline Inputs */}
                <div className="flex-1">
                    <div className="leading-relaxed flex flex-wrap items-center gap-1" style={{ color: 'var(--text-color)' }}>
                        {segments.map((segment, idx) => {
                            if (segment.type === 'text') {
                                return (
                                    <span key={idx} className="whitespace-pre-wrap">
                                        {segment.content}
                                    </span>
                                );
                            }

                            // Render inline input for blank
                            const blankValue = getBlankValue(segment.index);
                            const wordCount = countWords(blankValue);
                            const isOverLimit = wordLimit && wordCount > wordLimit;

                            return (
                                <span key={idx} className="inline-flex flex-col items-center mx-1">
                                    <input
                                        type="text"
                                        value={blankValue}
                                        onChange={(e) => handleBlankChange(segment.index, e.target.value)}
                                        placeholder="..."
                                        disabled={disabled}
                                        tabIndex={id} // Sequential tab navigation based on question ID
                                        className={`
                                            min-w-[120px] max-w-[200px] px-3 py-1.5 
                                            border-b-2 rounded-t
                                            text-center font-medium
                                            focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isOverLimit
                                                ? 'border-red-500 text-red-700 bg-red-50'
                                                : blankValue
                                                    ? 'border-teal-500 text-teal-700'
                                                    : 'border-gray-300'
                                            }
                                        `}
                                        style={{
                                            width: `${Math.max(120, (blankValue.length + 3) * 10)}px`,
                                            backgroundColor: isOverLimit ? undefined : 'var(--input-bg)',
                                            color: 'var(--text-color)',
                                            borderColor: (!isOverLimit && !blankValue) ? 'var(--border-color)' : undefined
                                        }}
                                    />
                                    {/* Word count indicator */}
                                    {wordLimit && blankValue && (
                                        <span className={`
                                            text-xs mt-0.5
                                            ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}
                                        `}>
                                            {wordCount}/{wordLimit} word{wordLimit !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </span>
                            );
                        })}
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-3 flex items-center gap-2">
                        {hasExceededLimit ? (
                            <div className="flex items-center gap-1.5 text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-xs font-medium">Word limit exceeded</span>
                            </div>
                        ) : isAnswered ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Answered</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span className="text-xs">Type your answer</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
