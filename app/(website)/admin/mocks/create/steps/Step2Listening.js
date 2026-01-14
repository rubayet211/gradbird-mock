"use client";

import { useState } from 'react';

export default function Step2Listening({ data, updateData }) {

    const addQuestion = () => {
        const newQuestion = {
            id: crypto.randomUUID(),
            type: 'MCQ',
            text: '',
            options: ['', '', '', ''],
            correctAnswer: ''
        };
        updateData({
            listening: {
                ...data.listening,
                questions: [...(data.listening.questions || []), newQuestion]
            }
        });
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...data.listening.questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        updateData({ listening: { ...data.listening, questions: updatedQuestions } });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updatedQuestions = [...data.listening.questions];
        const updatedOptions = [...updatedQuestions[qIndex].options];
        updatedOptions[oIndex] = value;
        updatedQuestions[qIndex].options = updatedOptions;
        updateData({ listening: { ...data.listening, questions: updatedQuestions } });
    };

    const removeQuestion = (index) => {
        const updatedQuestions = data.listening.questions.filter((_, i) => i !== index);
        updateData({ listening: { ...data.listening, questions: updatedQuestions } });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Listening Module</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Audio URL</label>
                <input
                    type="text"
                    value={data.listening.audioUrl || ''}
                    onChange={(e) => updateData({ listening: { ...data.listening, audioUrl: e.target.value } })}
                    placeholder="https://s3.aws.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700">Questions ({data.listening.questions?.length || 0})</h3>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        + Add Question
                    </button>
                </div>

                <div className="space-y-4">
                    {data.listening.questions?.map((q, index) => (
                        <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-medium text-gray-600">Question {index + 1}</span>
                                <button
                                    onClick={() => removeQuestion(index)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                    <select
                                        value={q.type}
                                        onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="MCQ">MCQ</option>
                                        <option value="GapFill">Gap Fill</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Correct Answer</label>
                                    <input
                                        type="text"
                                        value={q.correctAnswer}
                                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Question Text / Stem</label>
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>

                            {q.type === 'MCQ' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Options</label>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex gap-2">
                                            <span className="text-gray-400 text-sm w-4 pt-2">{String.fromCharCode(65 + oIndex)}</span>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(index, oIndex, e.target.value)}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
