'use client';

import { useState, useCallback } from 'react';
import ResizableSplitPane from './ResizableSplitPane';

// Sample IELTS Writing Task 1 Prompt
const TASK1_PROMPT = {
    title: 'Academic Writing Task 1',
    time: '20 minutes',
    minWords: 150,
    instructions: `You should spend about 20 minutes on this task.

The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    hasChart: true,
    chartDescription: 'Bar chart showing housing ownership vs renting trends from 1918-2011',
};

// Sample IELTS Writing Task 2 Prompt
const TASK2_PROMPT = {
    title: 'Academic Writing Task 2',
    time: '40 minutes',
    minWords: 250,
    instructions: `You should spend about 40 minutes on this task.

Write about the following topic:

Some people believe that unpaid community service should be a compulsory part of high school programmes (for example, working for a charity, improving the neighbourhood or teaching sports to younger children).

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    hasChart: false,
};

export default function WritingInterface() {
    const [activeTask, setActiveTask] = useState(1);
    const [task1Text, setTask1Text] = useState('');
    const [task2Text, setTask2Text] = useState('');

    const currentPrompt = activeTask === 1 ? TASK1_PROMPT : TASK2_PROMPT;
    const currentText = activeTask === 1 ? task1Text : task2Text;
    const setCurrentText = activeTask === 1 ? setTask1Text : setTask2Text;

    // Calculate word count
    const getWordCount = useCallback((text) => {
        const trimmed = text.trim();
        if (trimmed === '') return 0;
        return trimmed.split(/\s+/).length;
    }, []);

    const wordCount = getWordCount(currentText);

    // Handle text change
    const handleTextChange = (e) => {
        setCurrentText(e.target.value);
    };

    // Block rich text shortcuts (Ctrl+B, Ctrl+I, etc.)
    const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (['b', 'i', 'u', 'B', 'I', 'U'].includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    // Get word count color based on minimum requirement
    const getWordCountColor = () => {
        const minWords = currentPrompt.minWords;
        if (wordCount >= minWords) {
            return 'text-green-600';
        } else if (wordCount >= minWords * 0.75) {
            return 'text-amber-600';
        }
        return 'text-gray-600';
    };

    // Left pane content - Prompt & Chart
    const leftPaneContent = (
        <div className="h-full overflow-y-auto bg-white">
            <div className="p-6">
                {/* Task Header */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {currentPrompt.title}
                    </span>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {currentPrompt.time}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Minimum {currentPrompt.minWords} words
                        </span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {currentPrompt.instructions}
                        </div>
                    </div>
                </div>

                {/* Chart Placeholder for Task 1 */}
                {currentPrompt.hasChart && (
                    <div className="mt-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8">
                            <div className="text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-gray-500 font-medium">{currentPrompt.chartDescription}</p>
                                <p className="text-gray-400 text-sm mt-2">[Chart/Graph will be displayed here]</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Right pane content - Text Editor
    const rightPaneContent = (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Editor Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Your Response</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Write your answer in the space below. Spell check is disabled.
                </p>
            </div>

            {/* Text Area */}
            <div className="flex-1 p-6 overflow-hidden">
                <textarea
                    value={currentText}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    placeholder="Start writing your response here..."
                    className="w-full h-full resize-none rounded-xl border-2 border-gray-200 bg-white p-5 text-gray-800 leading-relaxed text-base focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-gray-400 font-[system-ui]"
                    style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: '16px',
                        lineHeight: '1.8',
                    }}
                />
            </div>

            {/* Word Counter */}
            <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getWordCountColor()}`}>
                        Word count: {wordCount}
                    </span>
                    {wordCount > 0 && wordCount < currentPrompt.minWords && (
                        <span className="text-sm text-gray-400">
                            ({currentPrompt.minWords - wordCount} more words needed)
                        </span>
                    )}
                    {wordCount >= currentPrompt.minWords && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Minimum reached
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                <ResizableSplitPane
                    storageKey="writing-panel-sizes"
                    leftPanel={leftPaneContent}
                    rightPanel={rightPaneContent}
                />
            </div>

            {/* Task Switching Tabs */}
            <div className="bg-gray-900 px-6 py-3 flex items-center justify-center gap-4">
                <button
                    onClick={() => setActiveTask(1)}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                        ${activeTask === 1
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                    `}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Task 1
                    </span>
                    {task1Text && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                            {getWordCount(task1Text)} words
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTask(2)}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                        ${activeTask === 2
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                    `}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Task 2
                    </span>
                    {task2Text && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                            {getWordCount(task2Text)} words
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

