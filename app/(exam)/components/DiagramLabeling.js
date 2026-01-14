'use client';

import React from 'react';

/**
 * DiagramLabeling Component
 * 
 * Renders an image with overlay inputs for labeling specific parts.
 * 
 * @param {Object} props
 * @param {Object} props.questionGroup - The group of questions containing image and labels
 * @param {string} props.title - Optional title for the diagram
 * @param {string} props.imageUrl - URL of the diagram image
 * @param {Array} props.labels - Array of label objects { id, x, y, label }
 * @param {number} props.startNumber - The starting question number
 * @param {Object} props.answers - Current state of answers { [questionId]: value }
 * @param {Function} props.onAnswerChange - Callback (questionId, value) => void
 */
export default function DiagramLabeling({
    questionGroup,
    startNumber,
    answers,
    onAnswerChange,
    disabled = false
}) {
    const { questions, imageUrl, instruction } = questionGroup;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header / Instructions */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {startNumber}-{startNumber + questions.length - 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">Label the diagram below.</h3>
                </div>
                {instruction && (
                    <p className="text-gray-600 ml-11">{instruction}</p>
                )}
            </div>

            {/* Diagram Container */}
            <div className="relative w-full max-w-3xl mx-auto border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                {/* Image */}
                <img
                    src={imageUrl}
                    alt="Diagram to label"
                    className="w-full h-auto block"
                />

                {/* Overlay Inputs */}
                {questions.map((question, index) => {
                    const questionNumber = startNumber + index;
                    const currentValue = answers[question.id] || '';

                    return (
                        <div
                            key={question.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: `${question.x}%`,
                                top: `${question.y}%`,
                                minWidth: '120px'
                            }}
                        >
                            <div className="flex flex-col items-center">
                                {/* Input Field */}
                                <div className="relative group">
                                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10">
                                        {questionNumber}
                                    </div>
                                    <input
                                        type="text"
                                        value={currentValue}
                                        onChange={(e) => onAnswerChange(question.id, e.target.value)}
                                        placeholder={question.label || "Label..."}
                                        disabled={disabled}
                                        className={`
                                            w-32 sm:w-40 px-3 py-1.5 pl-3 rounded-md border-2 shadow-sm text-sm font-medium
                                            focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all
                                            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
                                            ${currentValue
                                                ? 'border-blue-600 bg-blue-50 text-blue-800'
                                                : 'border-gray-300 bg-white/90 hover:border-blue-400 focus:border-blue-600'
                                            }
                                        `}
                                    />
                                </div>

                                {/* Connector Line (Optional visual flair) */}
                                {/* <div className="h-4 w-0.5 bg-gray-400/50 mt-1"></div> */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
