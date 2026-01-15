'use client';

import { useState, useCallback, useMemo } from 'react';
import ResizableSplitPane from './ResizableSplitPane';
import { useExam } from '../contexts/ExamContext';
import { WRITING_EXAM_DATA, getTaskByNumber } from '../data/writing-data';

export default function WritingInterface() {
    const { writingResponses, updateWritingResponse, isExamEnded, examData, isLoading, loadError } = useExam();
    const [activeTask, setActiveTask] = useState(1);

    // Use examData from database if available, fallback to static data
    const writingData = useMemo(() => {
        if (examData?.writing) {
            // Map database format to component format
            return {
                title: 'IELTS Academic Writing Test',
                totalTime: 60,
                tasks: [
                    {
                        id: 'task-1',
                        taskNumber: 1,
                        title: 'Academic Writing Task 1',
                        time: '20 minutes',
                        minWords: 150,
                        instructions: examData.writing.task1?.promptText || 'Complete the writing task.',
                        hasChart: true,
                        chartImageUrl: examData.writing.task1?.imageUrls?.[0] || null,
                        chartDescription: 'Chart for Task 1'
                    },
                    {
                        id: 'task-2',
                        taskNumber: 2,
                        title: 'Academic Writing Task 2',
                        time: '40 minutes',
                        minWords: 250,
                        instructions: examData.writing.task2?.promptText || 'Complete the essay task.',
                        hasChart: false,
                        chartImageUrl: null,
                        chartDescription: null
                    }
                ]
            };
        }
        // Fallback to static data for development/testing
        return WRITING_EXAM_DATA;
    }, [examData]);

    const currentTask = writingData.tasks.find(t => t.taskNumber === activeTask) || writingData.tasks[0];
    const currentText = writingResponses[`task${activeTask}Text`] || '';

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (loadError) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-600">
                    <p className="text-lg font-medium">Error loading exam</p>
                    <p className="text-sm mt-2">{loadError}</p>
                </div>
            </div>
        );
    }

    // Calculate word count
    const getWordCount = useCallback((text) => {
        const trimmed = text.trim();
        if (trimmed === '') return 0;
        return trimmed.split(/\s+/).length;
    }, []);

    const wordCount = getWordCount(currentText);

    // Handle text change
    const handleTextChange = (e) => {
        if (isExamEnded) return;
        updateWritingResponse(activeTask, e.target.value);
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
        const minWords = currentTask.minWords;
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
                        {currentTask.title}
                    </span>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {currentTask.time}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Minimum {currentTask.minWords} words
                        </span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="prose prose-gray max-w-none">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {currentTask.instructions}
                        </div>
                    </div>
                </div>

                {/* Chart/Image for Task 1 */}
                {currentTask.hasChart && (
                    <div className="mt-6">
                        {currentTask.chartImageUrl ? (
                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <img
                                    src={currentTask.chartImageUrl}
                                    alt={currentTask.chartDescription || 'Task chart'}
                                    className="w-full h-auto"
                                />
                                {currentTask.chartDescription && (
                                    <p className="text-sm text-gray-500 p-3 bg-gray-50 text-center">
                                        {currentTask.chartDescription}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">{currentTask.chartDescription}</p>
                                    <p className="text-gray-400 text-sm mt-2">[Chart/Graph will be displayed here]</p>
                                </div>
                            </div>
                        )}
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
                    disabled={isExamEnded}
                    placeholder={isExamEnded ? "Exam has ended." : "Start writing your response here..."}
                    className={`w-full h-full resize-none rounded-xl border-2 border-gray-200 bg-white p-5 text-gray-800 leading-relaxed text-base focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-gray-400 font-[system-ui] ${isExamEnded ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
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
                    {wordCount > 0 && wordCount < currentTask.minWords && (
                        <span className="text-sm text-gray-400">
                            ({currentTask.minWords - wordCount} more words needed)
                        </span>
                    )}
                    {wordCount >= currentTask.minWords && (
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
                {writingData.tasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => setActiveTask(task.taskNumber)}
                        className={`
                            px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                            ${activeTask === task.taskNumber
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                        `}
                    >
                        <span className="flex items-center gap-2">
                            {task.taskNumber === 1 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            )}
                            Task {task.taskNumber}
                        </span>
                        {writingResponses[`task${task.taskNumber}Text`] && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                                {getWordCount(writingResponses[`task${task.taskNumber}Text`])} words
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

