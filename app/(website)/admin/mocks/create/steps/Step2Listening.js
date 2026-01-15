"use client";

import { useState } from 'react';

export default function Step2Listening({ data, updateData }) {
    const [activePartIndex, setActivePartIndex] = useState(0);

    const parts = data.listening.parts || [
        { partNumber: 1, title: 'Part 1', audioUrl: '', transcript: '', questions: [] },
        { partNumber: 2, title: 'Part 2', audioUrl: '', transcript: '', questions: [] },
        { partNumber: 3, title: 'Part 3', audioUrl: '', transcript: '', questions: [] },
        { partNumber: 4, title: 'Part 4', audioUrl: '', transcript: '', questions: [] }
    ];

    const updatePart = (index, field, value) => {
        const updatedParts = [...parts];
        updatedParts[index] = { ...updatedParts[index], [field]: value };
        updateData({ listening: { ...data.listening, parts: updatedParts } });
    };

    const addQuestion = (partIndex) => {
        const newQuestion = {
            id: crypto.randomUUID(),
            type: 'MCQ',
            text: '',
            options: ['', '', '', ''],
            correctAnswer: ''
        };
        const updatedParts = [...parts];
        updatedParts[partIndex].questions = [...(updatedParts[partIndex].questions || []), newQuestion];
        updateData({ listening: { ...data.listening, parts: updatedParts } });
    };

    const updateQuestion = (partIndex, qIndex, field, value) => {
        const updatedParts = [...parts];
        updatedParts[partIndex].questions[qIndex] = {
            ...updatedParts[partIndex].questions[qIndex],
            [field]: value
        };
        updateData({ listening: { ...data.listening, parts: updatedParts } });
    };

    const updateOption = (partIndex, qIndex, oIndex, value) => {
        const updatedParts = [...parts];
        const options = [...updatedParts[partIndex].questions[qIndex].options];
        options[oIndex] = value;
        updatedParts[partIndex].questions[qIndex].options = options;
        updateData({ listening: { ...data.listening, parts: updatedParts } });
    };

    const removeQuestion = (partIndex, qIndex) => {
        const updatedParts = [...parts];
        updatedParts[partIndex].questions = updatedParts[partIndex].questions.filter((_, i) => i !== qIndex);
        updateData({ listening: { ...data.listening, parts: updatedParts } });
    };

    const activePart = parts[activePartIndex];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Listening Module</h2>
            <p className="text-sm text-gray-500">Configure each of the 4 parts of the Listening test. Each part has its own audio and questions.</p>

            {/* Part Tabs */}
            <div className="flex border-b border-gray-200">
                {parts.map((part, index) => (
                    <button
                        key={index}
                        onClick={() => setActivePartIndex(index)}
                        className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${activePartIndex === index
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Part {part.partNumber}
                        {part.questions?.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                {part.questions.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Active Part Content */}
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Part Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Part Title</label>
                    <input
                        type="text"
                        value={activePart.title || ''}
                        onChange={(e) => updatePart(activePartIndex, 'title', e.target.value)}
                        placeholder="e.g., Part 1: Conversation about travel plans"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Audio URL */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Audio URL</label>
                    <input
                        type="text"
                        value={activePart.audioUrl || ''}
                        onChange={(e) => updatePart(activePartIndex, 'audioUrl', e.target.value)}
                        placeholder="https://s3.aws.com/audio/part1.mp3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400">Direct link to the audio file for this part</p>
                </div>

                {/* Transcript */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Transcript <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={activePart.transcript || ''}
                        onChange={(e) => updatePart(activePartIndex, 'transcript', e.target.value)}
                        rows={4}
                        placeholder="Paste the audio transcript here for review purposes..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                    />
                </div>

                {/* Questions Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-700">
                            Questions ({activePart.questions?.length || 0})
                        </h3>
                        <button
                            type="button"
                            onClick={() => addQuestion(activePartIndex)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            + Add Question
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activePart.questions?.map((q, qIndex) => (
                            <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-medium text-gray-600">Question {qIndex + 1}</span>
                                    <button
                                        onClick={() => removeQuestion(activePartIndex, qIndex)}
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
                                            onChange={(e) => updateQuestion(activePartIndex, qIndex, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        >
                                            <option value="MCQ">Multiple Choice (MCQ)</option>
                                            <option value="GapFill">Gap Fill / Sentence Completion</option>
                                            <option value="TrueFalse">True/False/Not Given</option>
                                            <option value="Matching">Matching</option>
                                            <option value="ShortAnswer">Short Answer</option>
                                            <option value="MapLabeling">Map/Diagram Labeling</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Correct Answer</label>
                                        <input
                                            type="text"
                                            value={q.correctAnswer || ''}
                                            onChange={(e) => updateQuestion(activePartIndex, qIndex, 'correctAnswer', e.target.value)}
                                            placeholder={q.type === 'TrueFalse' ? 'TRUE / FALSE / NOT GIVEN' : 'Answer'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Question Text / Stem</label>
                                    <input
                                        type="text"
                                        value={q.text || ''}
                                        onChange={(e) => updateQuestion(activePartIndex, qIndex, 'text', e.target.value)}
                                        placeholder="Enter the question text or sentence with blank (use ____ for gaps)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                {/* MCQ Options */}
                                {q.type === 'MCQ' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-500">Options</label>
                                        {(q.options || ['', '', '', '']).map((opt, oIndex) => (
                                            <div key={oIndex} className="flex gap-2">
                                                <span className="text-gray-400 text-sm w-4 pt-2">{String.fromCharCode(65 + oIndex)}</span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(activePartIndex, qIndex, oIndex, e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Word Limit for GapFill/ShortAnswer */}
                                {(q.type === 'GapFill' || q.type === 'ShortAnswer') && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Word Limit <span className="text-gray-400 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={q.wordLimit || ''}
                                            onChange={(e) => updateQuestion(activePartIndex, qIndex, 'wordLimit', parseInt(e.target.value) || '')}
                                            placeholder="e.g., 3"
                                            className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                )}

                                {/* MapLabeling fields */}
                                {q.type === 'MapLabeling' && (
                                    <div className="mt-4 space-y-4 p-3 bg-amber-50 rounded border border-amber-200">
                                        <p className="text-xs text-amber-700">
                                            Map/Diagram questions require an image URL. Drop zones can be configured in the data.
                                        </p>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={q.imageUrl || ''}
                                                onChange={(e) => updateQuestion(activePartIndex, qIndex, 'imageUrl', e.target.value)}
                                                placeholder="https://example.com/map.png"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!activePart.questions || activePart.questions.length === 0) && (
                            <div className="text-center py-8 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No questions added yet.</p>
                                <p className="text-sm">Click "+ Add Question" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                    {parts.map((part, i) => (
                        <div key={i} className={`p-2 rounded ${i === activePartIndex ? 'bg-blue-100' : 'bg-white'}`}>
                            <p className="font-medium text-gray-700">Part {part.partNumber}</p>
                            <p className="text-gray-500">{part.questions?.length || 0} questions</p>
                            <p className="text-xs text-gray-400 truncate">{part.audioUrl ? '✓ Audio' : '○ No audio'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
