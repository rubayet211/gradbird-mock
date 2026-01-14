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
            correctAnswer: ''
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
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Correct Answer</label>
                                        <input
                                            type="text"
                                            value={q.correctAnswer}
                                            onChange={(e) => updateQuestion(activeSection, qIndex, 'correctAnswer', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Question Text / Stem</label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(activeSection, qIndex, 'text', e.target.value)}
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
