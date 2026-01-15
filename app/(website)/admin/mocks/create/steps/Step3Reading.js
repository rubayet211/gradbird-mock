"use client";

import { useState } from 'react';

export default function Step3Reading({ data, updateData }) {
    const [activeSection, setActiveSection] = useState(0);

    const sections = data.reading.sections || [
        { title: 'Passage 1', passageText: '', questions: [] },
        { title: 'Passage 2', passageText: '', questions: [] },
        { title: 'Passage 3', passageText: '', questions: [] }
    ];

    // Ensure state is initialized if empty
    if (!data.reading.sections || data.reading.sections.length === 0) {
        // This acts as a safeguard, but standard practice is to initialize in parent. 
        // We'll rely on parent init or just render what we have.
    }

    const updateSection = (index, field, value) => {
        const updatedSections = [...sections];
        updatedSections[index] = { ...updatedSections[index], [field]: value };
        updateData({ reading: { ...data.reading, sections: updatedSections } });
    };

    const addQuestion = (sectionIndex) => {
        const newQuestion = {
            id: crypto.randomUUID(),
            type: 'MCQ',
            text: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            items: [],
            questions: [],
            imageUrl: ''
        };
        const updatedSections = [...sections];
        updatedSections[sectionIndex].questions.push(newQuestion);
        updateData({ reading: { ...data.reading, sections: updatedSections } });
    };

    const updateQuestion = (sectionIndex, qIndex, field, value) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].questions[qIndex] = { ...updatedSections[sectionIndex].questions[qIndex], [field]: value };
        updateData({ reading: { ...data.reading, sections: updatedSections } });
    };

    const updateOption = (sectionIndex, qIndex, oIndex, value) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].questions[qIndex].options[oIndex] = value;
        updateData({ reading: { ...data.reading, sections: updatedSections } });
    };

    const removeQuestion = (sectionIndex, qIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions.filter((_, i) => i !== qIndex);
        updateData({ reading: { ...data.reading, sections: updatedSections } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Reading Module</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {sections.map((section, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSection(index)}
                        className={`px-4 py-2 -mb-px text-sm font-medium ${activeSection === index
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {section.title || `Section ${index + 1}`}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Passage Title</label>
                    <input
                        type="text"
                        value={sections[activeSection].title}
                        onChange={(e) => updateSection(activeSection, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Passage Text (HTML supported)</label>
                    <textarea
                        value={sections[activeSection].passageText}
                        onChange={(e) => updateSection(activeSection, 'passageText', e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                        placeholder="<p>Paste your passage here...</p>"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-700">Questions ({sections[activeSection].questions.length})</h3>
                        <button
                            type="button"
                            onClick={() => addQuestion(activeSection)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            + Add Question
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sections[activeSection].questions.map((q, qIndex) => (
                            <div key={q.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-medium text-gray-600">Question {qIndex + 1}</span>
                                    <button
                                        onClick={() => removeQuestion(activeSection, qIndex)}
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
                                            onChange={(e) => updateQuestion(activeSection, qIndex, 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        >
                                            <option value="MCQ">MCQ</option>
                                            <option value="TrueFalse">True/False/Not Given</option>
                                            <option value="GapFill">Gap Fill</option>
                                            <option value="Matching">Matching</option>
                                            <option value="DiagramLabeling">Diagram Labeling</option>
                                        </select>
                                    </div>
                                    {!['Matching', 'DiagramLabeling'].includes(q.type) && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Correct Answer</label>
                                            <input
                                                type="text"
                                                value={q.correctAnswer || ''}
                                                onChange={(e) => updateQuestion(activeSection, qIndex, 'correctAnswer', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        {['Matching', 'DiagramLabeling'].includes(q.type) ? 'Instruction / Title' : 'Question Text / Stem'}
                                    </label>
                                    <input
                                        type="text"
                                        value={q.text || ''}
                                        onChange={(e) => updateQuestion(activeSection, qIndex, 'text', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                {/* Matching Configuration */}
                                {q.type === 'Matching' && (
                                    <div className="mt-4 space-y-4 p-3 bg-indigo-50 rounded border border-indigo-200">
                                        <p className="text-xs text-indigo-700">
                                            <b>Matching:</b> Define options to be dragged and items (questions) to act as slots.
                                        </p>

                                        {/* Options */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Options (Draggable)</label>
                                            <div className="space-y-2">
                                                {(q.options || []).map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={opt || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(q.options || [])];
                                                                newOptions[oIndex] = e.target.value;
                                                                updateQuestion(activeSection, qIndex, 'options', newOptions);
                                                            }}
                                                            placeholder={`Option ${oIndex + 1}`}
                                                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newOptions = (q.options || []).filter((_, i) => i !== oIndex);
                                                                updateQuestion(activeSection, qIndex, 'options', newOptions);
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateQuestion(activeSection, qIndex, 'options', [...(q.options || []), ''])}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    + Add Option
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items (Questions) */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Items (Questions/Slots)</label>
                                            <div className="space-y-3">
                                                {(q.items || []).map((item, iIndex) => (
                                                    <div key={iIndex} className="flex gap-2 items-start">
                                                        <div className="flex-1 space-y-1">
                                                            <input
                                                                type="text"
                                                                value={item.text || ''}
                                                                onChange={(e) => {
                                                                    const newItems = [...(q.items || [])];
                                                                    newItems[iIndex] = { ...item, text: e.target.value };
                                                                    updateQuestion(activeSection, qIndex, 'items', newItems);
                                                                }}
                                                                placeholder="Question Text"
                                                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.correctAnswer || ''}
                                                                onChange={(e) => {
                                                                    const newItems = [...(q.items || [])];
                                                                    newItems[iIndex] = { ...item, correctAnswer: e.target.value };
                                                                    updateQuestion(activeSection, qIndex, 'items', newItems);
                                                                }}
                                                                placeholder="Correct Answer (must match an option)"
                                                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newItems = (q.items || []).filter((_, i) => i !== iIndex);
                                                                updateQuestion(activeSection, qIndex, 'items', newItems);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 mt-2"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateQuestion(activeSection, qIndex, 'items', [...(q.items || []), { id: crypto.randomUUID(), text: '', correctAnswer: '' }])}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    + Add Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* DiagramLabeling Configuration */}
                                {q.type === 'DiagramLabeling' && (
                                    <div className="mt-4 space-y-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                                        <p className="text-xs text-emerald-700">
                                            <b>Diagram Labeling:</b> Provide an image and labels (questions) with coordinates.
                                        </p>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={q.imageUrl || ''}
                                                onChange={(e) => updateQuestion(activeSection, qIndex, 'imageUrl', e.target.value)}
                                                placeholder="https://example.com/diagram.png"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-2">Labels (Questions)</label>
                                            <div className="space-y-3">
                                                {(q.questions || []).map((subQ, sIndex) => (
                                                    <div key={sIndex} className="p-3 bg-white border border-gray-200 rounded text-sm space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-gray-600">Label {sIndex + 1}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const newQs = (q.questions || []).filter((_, i) => i !== sIndex);
                                                                    updateQuestion(activeSection, qIndex, 'questions', newQs);
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                value={subQ.label || ''}
                                                                onChange={(e) => {
                                                                    const newQs = [...(q.questions || [])];
                                                                    newQs[sIndex] = { ...subQ, label: e.target.value };
                                                                    updateQuestion(activeSection, qIndex, 'questions', newQs);
                                                                }}
                                                                placeholder="Label Text (visible)"
                                                                className="col-span-2 w-full px-2 py-1 border rounded"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={subQ.correctAnswer || ''}
                                                                onChange={(e) => {
                                                                    const newQs = [...(q.questions || [])];
                                                                    newQs[sIndex] = { ...subQ, correctAnswer: e.target.value };
                                                                    updateQuestion(activeSection, qIndex, 'questions', newQs);
                                                                }}
                                                                placeholder="Correct Answer"
                                                                className="col-span-2 w-full px-2 py-1 border rounded bg-gray-50"
                                                            />
                                                            <div>
                                                                <label className="text-xs text-gray-400">X (%)</label>
                                                                <input
                                                                    type="number"
                                                                    value={subQ.x || 0}
                                                                    onChange={(e) => {
                                                                        const newQs = [...(q.questions || [])];
                                                                        newQs[sIndex] = { ...subQ, x: parseInt(e.target.value) || 0 };
                                                                        updateQuestion(activeSection, qIndex, 'questions', newQs);
                                                                    }}
                                                                    className="w-full px-2 py-1 border rounded"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-400">Y (%)</label>
                                                                <input
                                                                    type="number"
                                                                    value={subQ.y || 0}
                                                                    onChange={(e) => {
                                                                        const newQs = [...(q.questions || [])];
                                                                        newQs[sIndex] = { ...subQ, y: parseInt(e.target.value) || 0 };
                                                                        updateQuestion(activeSection, qIndex, 'questions', newQs);
                                                                    }}
                                                                    className="w-full px-2 py-1 border rounded"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateQuestion(activeSection, qIndex, 'questions', [...(q.questions || []), { id: crypto.randomUUID(), x: 50, y: 50, label: '', correctAnswer: '' }])}
                                                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                                                >
                                                    + Add Label
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {q.type === 'MCQ' && (
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-500">Options</label>
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex gap-2">
                                                <span className="text-gray-400 text-sm w-4 pt-2">{String.fromCharCode(65 + oIndex)}</span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(activeSection, qIndex, oIndex, e.target.value)}
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
        </div>
    );
}
